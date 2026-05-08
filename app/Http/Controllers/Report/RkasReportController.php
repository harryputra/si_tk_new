<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\InboundPayment;
use App\Models\OutboundRequest;
use App\Models\Payroll;
use App\Models\RkasAccount;
use App\Models\RkasBudget;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * C3 Reports:
 *  - variance(): Anggaran vs Realisasi per kind, group by COA root + leaf
 *  - cashFlow(): proyeksi kas per bulan (actual + estimated)
 */
class RkasReportController extends Controller
{
    public function variance(Request $request): Response
    {
        $tahun = (int) $request->input('tahun', date('Y'));

        $budgets = RkasBudget::with(['rkasAccount.parent'])
            ->where('tahun_anggaran', $tahun)
            ->where('status', '!=', RkasBudget::STATUS_ARCHIVED)
            ->get();

        $rows = $budgets->map(function (RkasBudget $b) {
            $pagu = (float) $b->pagu_anggaran;
            $real = (float) $b->terpakai;
            $variance = $b->kind === RkasBudget::KIND_PENDAPATAN
                ? $real - $pagu          // pendapatan: positif = surplus, negatif = kurang dari target
                : $pagu - $real;         // pengeluaran: positif = sisa pagu, negatif = over budget
            $varPct = $pagu > 0 ? round(($variance / $pagu) * 100, 1) : 0;

            return [
                'id'             => $b->id,
                'kind'           => $b->kind,
                'kode_rkas'      => $b->kode_rkas,
                'uraian'         => $b->uraian,
                'coa_kode'       => $b->rkasAccount?->kode,
                'coa_name'       => $b->rkasAccount?->name,
                'coa_root_kode'  => $b->rkasAccount?->parent?->kode ?? $b->rkasAccount?->kode,
                'coa_root_name'  => $b->rkasAccount?->parent?->name ?? $b->rkasAccount?->name ?? '(Tanpa COA)',
                'pagu'           => $pagu,
                'realisasi'      => $real,
                'variance'       => round($variance, 2),
                'variance_pct'   => $varPct,
                'pct_realisasi'  => $pagu > 0 ? round(($real / $pagu) * 100, 1) : 0,
                'is_over'        => $b->kind === RkasBudget::KIND_PENGELUARAN && $real > $pagu,
                'is_under'       => $b->kind === RkasBudget::KIND_PENDAPATAN && $real < $pagu,
            ];
        });

        // Group by kind, then by COA root for display
        $byKind = $rows->groupBy('kind')->map(function ($group, $kind) {
            $byRoot = $group->groupBy('coa_root_kode')->map(function ($items, $root) {
                return [
                    'coa_root_kode' => $root ?: '—',
                    'coa_root_name' => $items->first()['coa_root_name'] ?? '—',
                    'items'         => $items->values(),
                    'sum_pagu'      => round($items->sum('pagu'), 2),
                    'sum_realisasi' => round($items->sum('realisasi'), 2),
                    'sum_variance'  => round($items->sum('variance'), 2),
                ];
            })->sortBy('coa_root_kode')->values();

            return [
                'kind'          => $kind,
                'sum_pagu'      => round($group->sum('pagu'), 2),
                'sum_realisasi' => round($group->sum('realisasi'), 2),
                'sum_variance'  => round($group->sum('variance'), 2),
                'over_count'    => $group->where('is_over', true)->count(),
                'under_count'   => $group->where('is_under', true)->count(),
                'groups'        => $byRoot,
            ];
        });

        return Inertia::render('Report/RkasVariance', [
            'pendapatan' => $byKind->get('pendapatan', [
                'kind' => 'pendapatan', 'sum_pagu' => 0, 'sum_realisasi' => 0, 'sum_variance' => 0,
                'over_count' => 0, 'under_count' => 0, 'groups' => [],
            ]),
            'pengeluaran' => $byKind->get('pengeluaran', [
                'kind' => 'pengeluaran', 'sum_pagu' => 0, 'sum_realisasi' => 0, 'sum_variance' => 0,
                'over_count' => 0, 'under_count' => 0, 'groups' => [],
            ]),
            'filters'     => ['tahun' => $tahun],
        ]);
    }

    public function cashFlow(Request $request): Response
    {
        $tahun = (int) $request->input('tahun', date('Y'));

        // Per bulan: aggregate inbound (approved) & outbound (disbursed) yang HISTORIS
        $inboundMonthly = InboundPayment::query()
            ->where('status_approval', 'approved')
            ->whereYear('approved_at', $tahun)
            ->selectRaw("EXTRACT(MONTH FROM approved_at) as bulan, SUM(total_bayar) as total")
            ->groupBy('bulan')
            ->pluck('total', 'bulan');

        $outboundMonthly = OutboundRequest::query()
            ->where('status_approval', 'disbursed')
            ->whereYear('disbursed_at', $tahun)
            ->selectRaw("EXTRACT(MONTH FROM disbursed_at) as bulan, SUM(nominal) as total")
            ->groupBy('bulan')
            ->pluck('total', 'bulan');

        $payrollMonthly = Payroll::query()
            ->where('status_approval', 'paid')
            ->whereYear('paid_at', $tahun)
            ->selectRaw("EXTRACT(MONTH FROM paid_at) as bulan, SUM(total_take_home_pay) as total")
            ->groupBy('bulan')
            ->pluck('total', 'bulan');

        // ESTIMASI bulan-bulan ke depan dari sisa pagu (dibagi rata bulan tersisa di tahun)
        $now = Carbon::now();
        $currentMonth = (int) $now->format('Y') === $tahun ? (int) $now->format('m') : 12;

        $totalPaguPengeluaran = (float) RkasBudget::query()
            ->where('kind', RkasBudget::KIND_PENGELUARAN)
            ->where('tahun_anggaran', $tahun)
            ->whereIn('status', [RkasBudget::STATUS_ACTIVE, RkasBudget::STATUS_APPROVED])
            ->sum('pagu_anggaran');
        $totalRealisasiPengeluaran = (float) RkasBudget::query()
            ->where('kind', RkasBudget::KIND_PENGELUARAN)
            ->where('tahun_anggaran', $tahun)
            ->whereIn('status', [RkasBudget::STATUS_ACTIVE, RkasBudget::STATUS_APPROVED])
            ->sum('terpakai');
        $sisaPaguPengeluaran = max(0, $totalPaguPengeluaran - $totalRealisasiPengeluaran);

        $totalTargetPendapatan = (float) RkasBudget::query()
            ->where('kind', RkasBudget::KIND_PENDAPATAN)
            ->where('tahun_anggaran', $tahun)
            ->whereIn('status', [RkasBudget::STATUS_ACTIVE, RkasBudget::STATUS_APPROVED])
            ->sum('pagu_anggaran');
        $totalRealisasiPendapatan = (float) RkasBudget::query()
            ->where('kind', RkasBudget::KIND_PENDAPATAN)
            ->where('tahun_anggaran', $tahun)
            ->whereIn('status', [RkasBudget::STATUS_ACTIVE, RkasBudget::STATUS_APPROVED])
            ->sum('terpakai');
        $sisaTargetPendapatan = max(0, $totalTargetPendapatan - $totalRealisasiPendapatan);

        $bulanTersisa = max(1, 12 - $currentMonth + 1);
        $estPendapatanPerBulan = $sisaTargetPendapatan / $bulanTersisa;
        $estPengeluaranPerBulan = $sisaPaguPengeluaran / $bulanTersisa;

        // Compose monthly array
        $months = [];
        $runningBalance = 0;
        for ($m = 1; $m <= 12; $m++) {
            $isHistorical = $m <= $currentMonth || (int) date('Y') > $tahun;

            if ($isHistorical) {
                $masuk  = (float) ($inboundMonthly[$m] ?? 0);
                $keluar = (float) ($outboundMonthly[$m] ?? 0) + (float) ($payrollMonthly[$m] ?? 0);
            } else {
                $masuk  = $estPendapatanPerBulan;
                $keluar = $estPengeluaranPerBulan;
            }

            $runningBalance += $masuk - $keluar;

            $months[] = [
                'bulan'         => $m,
                'bulan_name'    => Carbon::create($tahun, $m, 1)->translatedFormat('F'),
                'is_historical' => $isHistorical,
                'masuk'         => round($masuk, 2),
                'keluar'        => round($keluar, 2),
                'net'           => round($masuk - $keluar, 2),
                'saldo_kumulatif' => round($runningBalance, 2),
            ];
        }

        return Inertia::render('Report/RkasCashFlow', [
            'months' => $months,
            'summary' => [
                'tahun'                       => $tahun,
                'total_target_pendapatan'     => $totalTargetPendapatan,
                'total_realisasi_pendapatan'  => $totalRealisasiPendapatan,
                'total_pagu_pengeluaran'      => $totalPaguPengeluaran,
                'total_realisasi_pengeluaran' => $totalRealisasiPengeluaran,
                'estimated_year_end_balance'  => round($runningBalance, 2),
                'current_month'               => $currentMonth,
                'months_remaining'            => $bulanTersisa,
                'est_per_month_in'            => round($estPendapatanPerBulan, 2),
                'est_per_month_out'           => round($estPengeluaranPerBulan, 2),
            ],
            'filters' => ['tahun' => $tahun],
        ]);
    }
}
