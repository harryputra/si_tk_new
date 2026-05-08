<?php

use App\Models\RkasBudget;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Repair migration: rebuild kolom `rkas_budgets.terpakai` dari sum
     * `outbound_requests.nominal` dengan status_approval='disbursed'.
     *
     * Sebelum C1, `disburse()` tidak pernah update kolom `terpakai`,
     * sehingga seluruh nilai existing tidak akurat. Sekali jalan saja.
     */
    public function up(): void
    {
        DB::transaction(function () {
            $budgets = RkasBudget::all();
            foreach ($budgets as $budget) {
                $sum = (float) $budget->outboundRequests()
                    ->where('status_approval', 'disbursed')
                    ->sum('nominal');
                if ((float) $budget->terpakai !== $sum) {
                    $budget->terpakai = $sum;
                    $budget->save();
                }
            }
        });
    }

    public function down(): void
    {
        // Tidak reversible — repair migration. Kalau perlu, jalankan ulang.
    }
};
