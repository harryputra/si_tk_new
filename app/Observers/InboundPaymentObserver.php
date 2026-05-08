<?php

namespace App\Observers;

use App\Models\InboundPayment;
use App\Models\RkasBudget;
use Illuminate\Support\Facades\DB;

class InboundPaymentObserver
{
    public function updated(InboundPayment $payment): void
    {
        if ($payment->isDirty('status_approval') && $payment->status_approval === 'approved') {
            DB::transaction(function () use ($payment) {
                // 1. Bump saldo akun (kalau ada — utk kebijakan/waiver, account_id NULL)
                if ($payment->account_id) {
                    $account = $payment->account()->lockForUpdate()->first();
                    if ($account) {
                        $account->increment('saldo', $payment->total_bayar);
                    }
                }

                // 2. Update invoice terbayar + status
                $invoice = $payment->invoice()->lockForUpdate()->first();
                $invoice->increment('nominal_terbayar', $payment->total_bayar);

                $newTerbayar = bcadd((string) $invoice->nominal_terbayar, '0', 2);
                $tagihan     = (string) $invoice->nominal_tagihan;

                $status = match (true) {
                    bccomp($newTerbayar, $tagihan, 2) >= 0 => 'paid',
                    bccomp($newTerbayar, '0', 2) > 0       => 'partial',
                    default                                => 'unpaid',
                };

                $invoice->update(['status' => $status]);

                // 3. C3 — Sinkronisasi pendapatan RKAS
                // Bump realisasi (kolom `terpakai`) di rkas_budgets pendapatan
                // yang punya akun + tahun yang match dengan tariff invoice ini.
                $this->syncRkasPendapatanRealisasi($invoice, (float) $payment->total_bayar);
            });
        }
    }

    /**
     * Cari RkasBudget dengan kind='pendapatan', rkas_account_id sama dengan
     * tariff.rkas_account_id, tahun_anggaran sama dengan tahun invoice/tariff.
     * Increment kolom terpakai (= realisasi pendapatan).
     */
    private function syncRkasPendapatanRealisasi($invoice, float $amount): void
    {
        $tariff = $invoice->tariff;
        if (!$tariff || !$tariff->rkas_account_id || $amount <= 0) {
            return;
        }

        $tahun = $invoice->academic_year_id
            ? optional(\App\Models\AcademicYear::find($invoice->academic_year_id))->name
            : null;
        // academic_year.name biasanya format "2025/2026" — ambil angka pertama
        $tahunAnggaran = $tahun
            ? (int) substr($tahun, 0, 4)
            : (int) date('Y', strtotime($invoice->periode));

        RkasBudget::query()
            ->where('kind', RkasBudget::KIND_PENDAPATAN)
            ->where('rkas_account_id', $tariff->rkas_account_id)
            ->where('tahun_anggaran', $tahunAnggaran)
            ->whereIn('status', [RkasBudget::STATUS_ACTIVE, RkasBudget::STATUS_APPROVED])
            ->lockForUpdate()
            ->increment('terpakai', $amount);
    }
}
