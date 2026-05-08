<?php

namespace App\Observers;

use App\Models\Payroll;
use Illuminate\Support\Facades\DB;

class PayrollObserver
{
    public function updated(Payroll $payroll): void
    {
        if ($payroll->isDirty('status_approval') && $payroll->status_approval === 'paid') {
            DB::transaction(function () use ($payroll) {
                // Debit from the gaji account — find it by jenis
                $account = \App\Models\Account::where('jenis', 'gaji')
                    ->lockForUpdate()
                    ->firstOrFail();

                $account->decrement('saldo', $payroll->total_take_home_pay);
            });
        }
    }
}
