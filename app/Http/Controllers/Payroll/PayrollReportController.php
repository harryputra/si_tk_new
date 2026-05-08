<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\PayrollAssignment;
use App\Models\PayrollComponent;
use App\Models\PayrollItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * 4 jenis laporan untuk Track B Phase B3:
 *  1. Slip Gaji (PDF per teacher per bulan)
 *  2. Rekapitulasi Gaji (per periode, breakdown per teacher)
 *  3. Mutasi Potongan (per kategori potongan, untuk disetorkan ke pihak eksternal)
 *  4. Audit Kepegawaian (daftar SK aktif + total biaya tunjangan)
 */
class PayrollReportController extends Controller
{
    public function slipGaji(Payroll $payroll)
    {
        $payroll->load([
            'teacher',
            'paidBy',
            'items.component',
            'adjustments.changedBy',
        ]);

        $pdf = \PDF::loadView('reports.slip_gaji', ['payroll' => $payroll]);
        $filename = sprintf(
            'slip-gaji-%s-%s.pdf',
            \Illuminate\Support\Str::slug($payroll->teacher->nama_lengkap),
            Carbon::parse($payroll->periode)->format('Y-m')
        );
        return $pdf->download($filename);
    }

    public function rekapGaji(Request $request): Response
    {
        $periode = $request->input('periode', date('Y-m'));
        $payrolls = Payroll::with(['teacher', 'items'])
            ->where('periode', $periode . '-01')
            ->get();

        $rows = $payrolls->map(function (Payroll $p) {
            $earnings   = $p->items->where('kind', 'earning')->sum('amount');
            $deductions = $p->items->where('kind', 'deduction')->sum('amount');
            return [
                'id'                  => $p->id,
                'teacher_name'        => $p->teacher?->nama_lengkap,
                'teacher_nip'         => $p->teacher?->nip,
                'jabatan'             => $p->teacher?->jabatan,
                'jumlah_hadir'        => $p->jumlah_hadir,
                'jumlah_alfa'         => $p->jumlah_alfa,
                'total_earning'       => round($earnings, 2),
                'total_deduction'     => round($deductions, 2),
                'total_take_home_pay' => (float) $p->total_take_home_pay,
                'status_approval'     => $p->status_approval,
            ];
        })->values();

        $summary = [
            'count'            => $rows->count(),
            'sum_earning'      => $rows->sum('total_earning'),
            'sum_deduction'    => $rows->sum('total_deduction'),
            'sum_thp'          => $rows->sum('total_take_home_pay'),
            'paid_count'       => $rows->where('status_approval', 'paid')->count(),
            'approved_count'   => $rows->where('status_approval', 'approved')->count(),
            'draft_count'      => $rows->where('status_approval', 'draft')->count(),
        ];

        return Inertia::render('Payroll/Reports/RekapGaji', [
            'rows'    => $rows,
            'summary' => $summary,
            'filters' => ['periode' => $periode],
        ]);
    }

    public function mutasiPotongan(Request $request): Response
    {
        $periode = $request->input('periode', date('Y-m'));
        $startDate = $periode . '-01';

        // Item potongan di periode tsb, group by component (utk disetorkan ke pihak eksternal)
        $items = PayrollItem::with(['payroll.teacher', 'component'])
            ->where('kind', 'deduction')
            ->whereHas('payroll', fn ($q) => $q->where('periode', $startDate))
            ->get();

        $byComponent = $items->groupBy(fn ($i) => $i->component?->name ?? $i->description)
            ->map(function ($group, $name) {
                return [
                    'component_name' => $name,
                    'category'       => $group->first()->category ?? '—',
                    'count_teachers' => $group->pluck('payroll.teacher_id')->unique()->count(),
                    'total_amount'   => round($group->sum('amount'), 2),
                    'detail'         => $group->map(fn ($i) => [
                        'teacher_name' => $i->payroll?->teacher?->nama_lengkap,
                        'nip'          => $i->payroll?->teacher?->nip,
                        'amount'       => (float) $i->amount,
                    ])->values(),
                ];
            })->values();

        return Inertia::render('Payroll/Reports/MutasiPotongan', [
            'rows'    => $byComponent,
            'summary' => [
                'total_components' => $byComponent->count(),
                'grand_total'      => round($items->sum('amount'), 2),
            ],
            'filters' => ['periode' => $periode],
        ]);
    }

    public function auditKepegawaian(Request $request): Response
    {
        $today = Carbon::today();

        // Ambil semua assignment yang AKTIF hari ini, kecuali komponen "default" (gaji_pokok / tunjangan_tetap / dll)
        // — fokus laporan ini: tunjangan jabatan / project / kasbon yang punya bukti SK
        $assignments = PayrollAssignment::with(['teacher:id,nip,nama_lengkap,jabatan', 'component'])
            ->whereDate('effective_from', '<=', $today)
            ->where(function ($q) use ($today) {
                $q->whereNull('effective_until')
                  ->orWhereDate('effective_until', '>=', $today);
            })
            ->orderBy('teacher_id')
            ->get();

        $rows = $assignments->map(function (PayrollAssignment $a) {
            return [
                'id'             => $a->id,
                'teacher_name'   => $a->teacher?->nama_lengkap,
                'teacher_nip'    => $a->teacher?->nip,
                'jabatan'        => $a->teacher?->jabatan,
                'component_name' => $a->component?->name,
                'kind'           => $a->component?->kind,
                'category'       => $a->component?->category,
                'nominal'        => (float) $a->nominal,
                'effective_from' => $a->effective_from?->toDateString(),
                'effective_until'=> $a->effective_until?->toDateString(),
                'sk_number'      => $a->sk_number,
                'sk_file'        => $a->sk_file,
                'has_evidence'   => !empty($a->sk_file),
            ];
        })->values();

        // Group by category untuk total per pos
        $byCategory = $rows->groupBy('category')->map(function ($group, $cat) {
            return [
                'category' => $cat ?: '—',
                'count'    => $group->count(),
                'total'    => round($group->sum('nominal'), 2),
            ];
        })->values();

        return Inertia::render('Payroll/Reports/AuditKepegawaian', [
            'rows'        => $rows,
            'by_category' => $byCategory,
            'summary'     => [
                'total_active_assignments' => $rows->count(),
                'with_evidence'            => $rows->where('has_evidence', true)->count(),
                'without_evidence'         => $rows->where('has_evidence', false)->count(),
            ],
        ]);
    }
}
