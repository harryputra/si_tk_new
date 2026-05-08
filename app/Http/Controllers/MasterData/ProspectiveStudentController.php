<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Invoice;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Tariff;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProspectiveStudentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Student::where('status', 'calon')->with(['invoices.tariff']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                  ->orWhere('registration_number', 'ilike', "%{$search}%");
            });
        }

        $perPage = (int) ($request->per_page ?? 10);
        $students = $query->latest()->paginate($perPage)->withQueryString();

        // Calculate total outstanding per student
        $students->getCollection()->transform(function ($student) {
            $student->total_tagihan = $student->invoices->sum('nominal_tagihan');
            $student->total_terbayar = $student->invoices->sum('nominal_terbayar');
            $student->sisa_tagihan = $student->total_tagihan - $student->total_terbayar;
            return $student;
        });

        // Get classes with capacity info
        $classes = SchoolClass::withCount('students')->get()->map(function($c) {
            $c->remaining_capacity = $c->capacity - $c->students_count;
            return $c;
        });

        // Get payment accounts for the payment modal
        $accounts = \App\Models\Account::all();

        return Inertia::render('MasterData/PPDB/Index', [
            'students' => $students,
            'classes' => $classes,
            'accounts' => $accounts,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nama_panggilan' => 'nullable|string|max:100',
            'tahun_angkatan' => 'required|integer|digits:4',
            'jenis_siswa' => 'required|in:reguler,reguler_opsi2,fullday',
            'nama_wali' => 'required|string|max:255',
            'no_hp_wali' => 'nullable|string|max:20',
        ]);

        DB::beginTransaction();
        try {
            // Generate Registration Number
            $year = date('y');
            $count = Student::where('status', 'calon')->count() + 1;
            $regNumber = 'PPDB' . $year . str_pad($count, 4, '0', STR_PAD_LEFT);

            $validated['registration_number'] = $regNumber;
            $validated['status'] = 'calon';
            $validated['nis'] = null; // belum punya NIS

            $student = Student::create($validated);

            // Trigger "Biaya Pendaftaran"
            $this->generateRegistrationFee($student);

            DB::commit();
            return redirect()->back()->with('success', 'Calon Siswa berhasil didaftarkan dan tagihan awal diterbitkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Gagal mendaftar: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Student $ppdb): RedirectResponse
    {
        if ($ppdb->status !== 'calon') {
            return redirect()->back()->withErrors(['error' => 'Siswa ini bukan calon siswa lagi.']);
        }

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nama_panggilan' => 'nullable|string|max:100',
            'tahun_angkatan' => 'required|integer|digits:4',
            'jenis_siswa' => 'required|in:reguler,reguler_opsi2,fullday',
            'nama_wali' => 'required|string|max:255',
            'no_hp_wali' => 'nullable|string|max:20',
        ]);

        $ppdb->update($validated);

        return redirect()->back()->with('success', 'Data calon siswa diperbarui.');
    }

    public function activate(Request $request, Student $ppdb): RedirectResponse
    {
        if ($ppdb->status !== 'calon') {
            return redirect()->back()->withErrors(['error' => 'Siswa sudah diaktivasi.']);
        }

        $request->validate([
            'school_class_id' => 'required|exists:school_classes,id'
        ]);

        // Validation 1: Saldo 0
        $totalTagihan = $ppdb->invoices()->sum('nominal_tagihan');
        $totalTerbayar = $ppdb->invoices()->sum('nominal_terbayar');
        if ($totalTagihan - $totalTerbayar > 0) {
            return redirect()->back()->withErrors(['error' => 'Siswa masih memiliki tunggakan/uang pangkal yang belum lunas.']);
        }

        // Validation 2: Kapasitas Rombel
        $class = SchoolClass::withCount('students')->findOrFail($request->school_class_id);
        if ($class->students_count >= $class->capacity) {
            return redirect()->back()->withErrors(['error' => "Rombel {$class->name} sudah penuh!"]);
        }

        DB::beginTransaction();
        try {
            // Generate NIS (Example format: TahunMasuk + 3 Digit Urut)
            $activeCount = Student::where('status', 'aktif')->where('tahun_angkatan', $ppdb->tahun_angkatan)->count();
            $nis = $ppdb->tahun_angkatan . str_pad($activeCount + 1, 3, '0', STR_PAD_LEFT);

            $ppdb->update([
                'status' => 'aktif',
                'nis' => $nis,
                'current_class_id' => $class->id
            ]);

            // Enroll
            $activeYear = AcademicYear::where('is_active', true)->first();
            if ($activeYear) {
                StudentEnrollment::create([
                    'student_id' => $ppdb->id,
                    'school_class_id' => $class->id,
                    'academic_year_id' => $activeYear->id,
                    'status' => 'active'
                ]);
            }

            DB::commit();
            return redirect()->route('ppdb.index')->with('success', "Siswa berhasil diaktivasi dengan NIS: {$nis} dan masuk ke kelas {$class->name}.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Aktivasi gagal: ' . $e->getMessage()]);
        }
    }

    private function generateRegistrationFee(Student $student)
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) return;

        // Try to find an existing registration tariff, if not create a dummy one for logic
        $tariff = Tariff::firstOrCreate(
            [
                'jenis_tarif' => 'pendaftaran',
                'tahun_berlaku' => date('Y'),
                'jenis_siswa' => 'all'
            ],
            [
                'nama_tarif' => 'Biaya Pendaftaran / Seleksi',
                'nominal' => 250000,
                'billing_cycle' => 'situasional',
                'applicability' => 'all'
            ]
        );

        Invoice::create([
            'student_id' => $student->id,
            'tariff_id' => $tariff->id,
            'academic_year_id' => $activeYear->id,
            'periode' => now()->format('Y-m-01'),
            'nominal_tagihan' => $tariff->nominal,
            'nominal_terbayar' => 0,
            'status' => 'unpaid',
            'jatuh_tempo' => now()->addDays(7)->format('Y-m-d')
        ]);
    }
}
