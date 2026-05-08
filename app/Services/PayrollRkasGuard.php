<?php

namespace App\Services;

use App\Models\Payroll;
use App\Models\RkasAccount;
use App\Models\RkasBudget;
use Carbon\Carbon;

/**
 * Validasi: pastikan total payroll bulan tertentu (digabung dengan periode-periode
 * sebelumnya yang sudah dibayar/disetujui di tahun anggaran sama) tidak melebihi
 * alokasi RKAS pengeluaran kategori "Belanja Pegawai" (PTK / 5.4.x).
 *
 * Dipanggil dari controller saat:
 *   - generate (warning info)
 *   - approve  (warning soft)
 *   - pay      (hard block kalau over)
 */
class PayrollRkasGuard
{
    /**
     * @return array{
     *     ok: bool,
     *     status: 'safe'|'warning'|'over_budget',
     *     pagu: float,
     *     used_prior: float,
     *     payroll_amount: float,
     *     used_total: float,
     *     remaining: float,
     *     percentage: float,
     *     message: string,
     *     rkas_budgets: array,
     * }
     */
    public function check(Payroll $payroll): array
    {
        $periode = Carbon::parse($payroll->periode);
        $tahunAnggaran = (int) $periode->format('Y');

        // 1. Cari semua RKAS pengeluaran tahun ini, kind=pengeluaran, status=active,
        //    yang COA-nya termasuk PTK (kode dimulai dengan '5.4').
        $ptkRoot = RkasAccount::where('kode', '5.4')->first();
        $ptkAccountIds = collect();
        if ($ptkRoot) {
            // Self + descendants (1 level deep cukup untuk seed default)
            $ptkAccountIds = collect([$ptkRoot->id])
                ->merge($ptkRoot->children()->pluck('id'));
        }

        $budgets = RkasBudget::query()
            ->where('kind', RkasBudget::KIND_PENGELUARAN)
            ->where('tahun_anggaran', $tahunAnggaran)
            ->whereIn('status', [RkasBudget::STATUS_ACTIVE, RkasBudget::STATUS_APPROVED])
            ->where(function ($q) use ($ptkAccountIds) {
                if ($ptkAccountIds->isNotEmpty()) {
                    $q->whereIn('rkas_account_id', $ptkAccountIds);
                }
                // Fallback: kalau tidak link COA, tapi kategori_utama mengandung 'pegawai' atau 'gaji' atau 'PTK'
                $q->orWhere(function ($qq) {
                    $qq->where('kategori_utama', 'ilike', '%pegawai%')
                       ->orWhere('kategori_utama', 'ilike', '%PTK%')
                       ->orWhere('uraian', 'ilike', '%gaji%');
                });
            })
            ->get();

        $totalPagu = (float) $budgets->sum('pagu_anggaran');
        $usedPrior = (float) $budgets->sum('terpakai');

        $payrollAmount = (float) $payroll->total_take_home_pay;
        $usedTotal = $usedPrior + $payrollAmount;
        $remaining = $totalPagu - $usedTotal;
        $percentage = $totalPagu > 0 ? round(($usedTotal / $totalPagu) * 100, 1) : 0;

        if ($totalPagu <= 0) {
            return [
                'ok'             => true,
                'status'         => 'safe',
                'pagu'           => 0,
                'used_prior'     => 0,
                'payroll_amount' => $payrollAmount,
                'used_total'     => $payrollAmount,
                'remaining'      => 0,
                'percentage'     => 0,
                'message'        => 'Belum ada alokasi RKAS Belanja Pegawai untuk tahun ' . $tahunAnggaran . '. Validasi dilewati.',
                'rkas_budgets'   => [],
            ];
        }

        $status = 'safe';
        $message = '';
        if ($remaining < 0) {
            $status = 'over_budget';
            $message = sprintf(
                'OVER BUDGET: Pembayaran ini akan melampaui pagu RKAS Belanja Pegawai sebesar Rp %s. Sisa pagu: Rp %s.',
                number_format(-$remaining, 0, ',', '.'),
                number_format($totalPagu - $usedPrior, 0, ',', '.'),
            );
        } elseif ($percentage >= 80) {
            $status = 'warning';
            $message = sprintf(
                'PERINGATAN: Realisasi Belanja Pegawai sudah mencapai %s%% dari pagu (Rp %s sisa).',
                $percentage,
                number_format($remaining, 0, ',', '.'),
            );
        } else {
            $message = sprintf(
                'Aman: %s%% terpakai dari Rp %s. Sisa: Rp %s.',
                $percentage,
                number_format($totalPagu, 0, ',', '.'),
                number_format($remaining, 0, ',', '.'),
            );
        }

        return [
            'ok'             => $status !== 'over_budget',
            'status'         => $status,
            'pagu'           => $totalPagu,
            'used_prior'     => $usedPrior,
            'payroll_amount' => $payrollAmount,
            'used_total'     => $usedTotal,
            'remaining'      => $remaining,
            'percentage'     => $percentage,
            'message'        => $message,
            'rkas_budgets'   => $budgets->map(fn ($b) => [
                'id'    => $b->id,
                'kode'  => $b->kode_rkas,
                'uraian'=> $b->uraian,
                'pagu'  => (float) $b->pagu_anggaran,
                'terpakai' => (float) $b->terpakai,
            ])->values()->all(),
        ];
    }
}
