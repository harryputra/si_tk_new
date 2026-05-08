<?php

namespace App\Http\Controllers\Academic;

use App\Http\Controllers\Controller;
use App\Models\InboundPayment;
use App\Models\Invoice;
use App\Models\InvoiceAdjustment;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GraduationController extends Controller
{
    /**
     * Tampilkan halaman persiapan kelulusan.
     * Menampilkan daftar siswa kelas akhir beserta akumulasi tunggakan.
     */
    public function index(Request $request): Response
    {
        $classId = $request->get('class_id');

        $classes = SchoolClass::orderBy('name')->get();

        // Ambil siswa aktif (filter per kelas jika dipilih)
        $query = Student::where('status', 'aktif')
            ->with(['currentClass', 'invoices' => function ($q) {
                $q->whereColumn('nominal_terbayar', '<', 'nominal_tagihan');
            }]);

        if ($classId) {
            $query->where('current_class_id', $classId);
        }

        $students = $query->get()->map(function ($student) {
            $totalTagihan = $student->invoices()->sum('nominal_tagihan');
            $totalTerbayar = $student->invoices()->sum('nominal_terbayar');
            $totalTunggakan = bcsub((string) $totalTagihan, (string) $totalTerbayar, 2);

            $invoicesBelumLunas = $student->invoices()
                ->whereColumn('nominal_terbayar', '<', 'nominal_tagihan')
                ->with('tariff')
                ->get()
                ->map(function ($inv) {
                    return [
                        'id' => $inv->id,
                        'tariff_name' => $inv->tariff?->nama_tarif ?? '-',
                        'periode' => $inv->periode?->format('Y-m') ?? '-',
                        'nominal_tagihan' => $inv->nominal_tagihan,
                        'nominal_terbayar' => $inv->nominal_terbayar,
                        'sisa_hutang' => $inv->sisa_hutang,
                    ];
                });

            return [
                'id' => $student->id,
                'nis' => $student->nis,
                'nama_lengkap' => $student->nama_lengkap,
                'kelas' => $student->currentClass?->name ?? '-',
                'jenis_siswa' => $student->jenis_siswa,
                'total_tagihan' => $totalTagihan,
                'total_terbayar' => $totalTerbayar,
                'total_tunggakan' => $totalTunggakan,
                'is_lunas' => bccomp($totalTunggakan, '0', 2) <= 0,
                'invoices_belum_lunas' => $invoicesBelumLunas,
            ];
        });

        // Hitung statistik
        $stats = [
            'total_siswa' => $students->count(),
            'siswa_lunas' => $students->where('is_lunas', true)->count(),
            'siswa_tunggakan' => $students->where('is_lunas', false)->count(),
            'total_tunggakan' => $students->sum('total_tunggakan'),
        ];

        // Riwayat adjustment
        $adjustments = InvoiceAdjustment::with(['student', 'admin', 'invoice.tariff'])
            ->latest()
            ->limit(50)
            ->get();

        return Inertia::render('Graduation/Index', [
            'students' => $students->values(),
            'classes' => $classes,
            'stats' => $stats,
            'adjustments' => $adjustments,
            'selected_class_id' => $classId,
        ]);
    }

    /**
     * Terapkan penyesuaian kebijakan pada tagihan siswa.
     * Membuat transaksi "pembayaran kebijakan" fiktif dan mencatat audit trail.
     */
    public function applyAdjustment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'jenis_kebijakan' => 'required|in:subsidi_yayasan,pemutihan,diskon_kelulusan',
            'keterangan' => 'nullable|string|max:500',
            'invoice_ids' => 'required|array|min:1',
            'invoice_ids.*' => 'exists:invoices,id',
            'nominal_diskon' => 'nullable|numeric|min:0', // hanya untuk diskon_kelulusan
        ]);

        $jenisLabel = InvoiceAdjustment::JENIS_LABELS[$validated['jenis_kebijakan']];
        $adminName = auth()->user()->name;
        $batchId = 'ADJ-' . strtoupper(Str::random(8));

        DB::beginTransaction();
        try {
            $student = Student::findOrFail($validated['student_id']);
            $invoices = Invoice::where('student_id', $student->id)
                ->whereIn('id', $validated['invoice_ids'])
                ->whereColumn('nominal_terbayar', '<', 'nominal_tagihan')
                ->get();

            foreach ($invoices as $invoice) {
                $sisaHutang = bcsub((string) $invoice->nominal_tagihan, (string) $invoice->nominal_terbayar, 2);

                if (bccomp($sisaHutang, '0', 2) <= 0) {
                    continue;
                }

                // Untuk diskon_kelulusan: gunakan nominal_diskon (jika ada), capped at sisa hutang
                if ($validated['jenis_kebijakan'] === 'diskon_kelulusan' && !empty($validated['nominal_diskon'])) {
                    $nominalAdjustment = min((float) $validated['nominal_diskon'], (float) $sisaHutang);
                } else {
                    // subsidi / pemutihan: lunasi seluruhnya
                    $nominalAdjustment = (float) $sisaHutang;
                }

                $keterangan = sprintf(
                    'Lunas melalui %s - %s - %s',
                    $jenisLabel,
                    $adminName,
                    now()->format('d/m/Y H:i')
                );

                if (!empty($validated['keterangan'])) {
                    $keterangan .= ' | Catatan: ' . $validated['keterangan'];
                }

                // Buat transaksi pembayaran kebijakan (fiktif — tidak ada uang tunai masuk)
                $payment = InboundPayment::create([
                    'invoice_id' => $invoice->id,
                    'student_id' => $student->id,
                    'account_id' => null,
                    'total_bayar' => $nominalAdjustment,
                    'jenis_bayar' => 'kebijakan',
                    'jenis_transaksi' => $validated['jenis_kebijakan'],
                    'catatan' => $keterangan,
                    'status_approval' => 'approved',
                    'approved_by' => auth()->id(),
                    'approved_at' => now(),
                    'dibuat_oleh' => auth()->id(),
                ]);

                // Update nominal terbayar pada invoice
                // Status enum DB: unpaid / partial / paid
                $newTerbayar = bcadd((string) $invoice->nominal_terbayar, (string) $nominalAdjustment, 2);
                $invoice->update([
                    'nominal_terbayar' => $newTerbayar,
                    'status' => bccomp($newTerbayar, (string) $invoice->nominal_tagihan, 2) >= 0 ? 'paid' : 'partial',
                ]);

                // Catat audit trail
                InvoiceAdjustment::create([
                    'invoice_id' => $invoice->id,
                    'student_id' => $student->id,
                    'inbound_payment_id' => $payment->id,
                    'jenis_kebijakan' => $validated['jenis_kebijakan'],
                    'nominal_asli' => $invoice->nominal_tagihan,
                    'nominal_adjustment' => $nominalAdjustment,
                    'keterangan' => $keterangan,
                    'batch_id' => $batchId,
                    'admin_id' => auth()->id(),
                ]);
            }

            DB::commit();

            return redirect()->route('kelulusan.index', ['class_id' => $request->get('class_id')])
                ->with('success', "Penyesuaian kebijakan ({$jenisLabel}) berhasil diterapkan untuk {$student->nama_lengkap}.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Gagal menerapkan penyesuaian: ' . $e->getMessage()]);
        }
    }

    /**
     * Proses kelulusan massal.
     * Mengubah status siswa menjadi 'lulus' dan mengunci akun mereka.
     */
    public function graduate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:students,id',
        ]);

        DB::beginTransaction();
        try {
            $students = Student::whereIn('id', $validated['student_ids'])
                ->where('status', 'aktif')
                ->get();

            $graduated = 0;
            $skipped = [];

            foreach ($students as $student) {
                // Cek apakah masih ada tunggakan
                $totalTagihan = $student->invoices()->sum('nominal_tagihan');
                $totalTerbayar = $student->invoices()->sum('nominal_terbayar');
                $tunggakan = bcsub((string) $totalTagihan, (string) $totalTerbayar, 2);

                if (bccomp($tunggakan, '0', 2) > 0) {
                    $skipped[] = $student->nama_lengkap;
                    continue;
                }

                // Tandai active enrollments siswa ini sebagai graduated (audit history)
                \App\Models\StudentEnrollment::where('student_id', $student->id)
                    ->where('status', 'active')
                    ->update(['status' => 'graduated']);

                // Status alumni + lepas dari kelas (sesuai enum students.status: aktif/alumni/keluar)
                $student->update([
                    'status'           => 'alumni',
                    'current_class_id' => null,
                ]);
                $graduated++;
            }

            DB::commit();

            $message = "{$graduated} siswa berhasil diluluskan.";
            if (!empty($skipped)) {
                $message .= ' | DITOLAK (masih tunggakan): ' . implode(', ', $skipped);
            }

            return redirect()->route('kelulusan.index', ['class_id' => $request->get('class_id')])
                ->with($graduated > 0 ? 'success' : 'error', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['general' => 'Gagal memproses kelulusan: ' . $e->getMessage()]);
        }
    }

    /**
     * Laporan Rekapitulasi Penyesuaian Kebijakan (JSON / Inertia).
     */
    public function report(Request $request): Response
    {
        $query = InvoiceAdjustment::with(['student', 'admin', 'invoice.tariff']);

        if ($request->get('batch_id')) {
            $query->where('batch_id', $request->get('batch_id'));
        }

        $adjustments = $query->latest()->get();

        $summary = [
            'total_records' => $adjustments->count(),
            'total_nominal' => $adjustments->sum('nominal_adjustment'),
            'by_jenis' => $adjustments->groupBy('jenis_kebijakan')->map(function ($group, $key) {
                return [
                    'label' => InvoiceAdjustment::JENIS_LABELS[$key] ?? $key,
                    'count' => $group->count(),
                    'total' => $group->sum('nominal_adjustment'),
                ];
            })->values(),
        ];

        return Inertia::render('Graduation/Report', [
            'adjustments' => $adjustments,
            'summary' => $summary,
        ]);
    }
}
