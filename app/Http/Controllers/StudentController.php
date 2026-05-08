<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Student::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nama_lengkap', 'ilike', "%{$search}%")
                  ->orWhere('nis', 'ilike', "%{$search}%");
        }

        if ($request->filled('jenis_siswa')) {
            $query->where('jenis_siswa', $request->jenis_siswa);
        }

        if ($request->filled('tahun_angkatan')) {
            $query->where('tahun_angkatan', $request->tahun_angkatan);
        }

        if ($request->filled('current_class_id')) {
            if ($request->current_class_id === 'none') {
                $query->whereNull('current_class_id');
            } else {
                $query->where('current_class_id', $request->current_class_id);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $perPage = (int) ($request->per_page ?? 10);

        // Sorting
        $sortBy = $request->get('sort_by', '');
        $sortDir = $request->get('sort_dir', 'desc');
        $sortDir = in_array($sortDir, ['asc', 'desc']) ? $sortDir : 'desc';

        $allowedSorts = ['nama_lengkap', 'nis', 'tahun_angkatan', 'status'];

        if ($sortBy === 'kelas') {
            $query->leftJoin('school_classes', 'students.current_class_id', '=', 'school_classes.id')
                  ->orderBy('school_classes.name', $sortDir)
                  ->select('students.*');
        } elseif (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->latest();
        }

        $students = $query->with('currentClass')
            ->withTrashed()
            ->paginate($perPage)
            ->withQueryString();
        $classes = \App\Models\SchoolClass::orderBy('level')->orderBy('name')->get();

        return Inertia::render('MasterData/Students/Index', [
            'students' => $students,
            'classes' => $classes,
            'filters' => $request->only(['search', 'jenis_siswa', 'tahun_angkatan', 'current_class_id', 'status', 'per_page', 'sort_by', 'sort_dir']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nis' => 'required|string|unique:students,nis',
            'nama_lengkap' => 'required|string|max:255',
            'nama_panggilan' => 'nullable|string|max:100',
            'tahun_angkatan' => 'required|integer|digits:4',
            'jenis_siswa' => 'required|in:reguler,reguler_opsi2,fullday',
            'nama_wali' => 'required|string|max:255',
            'no_hp_wali' => 'nullable|string|max:20',
            'status' => 'required|in:aktif,alumni,keluar',
            'current_class_id' => 'nullable|exists:school_classes,id',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . $validated['nis'] . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('students/photos', $filename, 'public');
            $validated['photo'] = $path;
        }

        Student::create($validated);

        return redirect()->route('siswa.index')
            ->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function show(Student $siswa): Response
    {
        $siswa->load(['invoices.tariff', 'inboundPayments', 'currentClass', 'enrollments.academicYear', 'enrollments.schoolClass']);
        return Inertia::render('MasterData/Students/Show', [
            'student' => $siswa,
            'accounts' => \App\Models\Account::all()
        ]);
    }

    public function update(Request $request, Student $siswa): RedirectResponse
    {
        $validated = $request->validate([
            'nis' => 'required|string|unique:students,nis,' . $siswa->id,
            'nama_lengkap' => 'required|string|max:255',
            'nama_panggilan' => 'nullable|string|max:100',
            'tahun_angkatan' => 'required|integer|digits:4',
            'jenis_siswa' => 'required|in:reguler,reguler_opsi2,fullday',
            'nama_wali' => 'required|string|max:255',
            'no_hp_wali' => 'nullable|string|max:20',
            'status' => 'required|in:aktif,alumni,keluar',
            'current_class_id' => 'nullable|exists:school_classes,id',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($siswa->photo) {
                Storage::disk('public')->delete($siswa->photo);
            }
            $file = $request->file('photo');
            $filename = time() . '_' . $validated['nis'] . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('students/photos', $filename, 'public');
            $validated['photo'] = $path;
        }

        $siswa->update($validated);

        return redirect()->route('siswa.index')
            ->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Student $siswa): RedirectResponse
    {
        $siswa->delete();

        return redirect()->route('siswa.index')
            ->with('success', 'Data siswa berhasil dihapus.');
    }

    public function restore($id): RedirectResponse
    {
        $student = Student::withTrashed()->findOrFail($id);
        $student->restore();

        return redirect()->route('siswa.index')
            ->with('success', 'Data siswa berhasil dipulihkan.');
    }

    public function forceDelete($id): RedirectResponse
    {
        $student = Student::withTrashed()->findOrFail($id);
        $student->forceDelete();

        return redirect()->route('siswa.index')
            ->with('success', 'Data siswa berhasil dihapus permanen.');
    }

    public function apiIndex(): JsonResponse
    {
        $students = Student::where('status', 'aktif')->get(['id', 'nis', 'nama_lengkap']);
        return response()->json($students);
    }
}
