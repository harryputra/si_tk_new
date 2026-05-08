<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Link tariff ke akun COA pendapatan (rkas_accounts dengan kind=pendapatan).
     * Saat InboundPayment di-approve, observer akan auto-bump terpakai
     * di rkas_budgets yang punya akun + tahun_anggaran sama.
     */
    public function up(): void
    {
        Schema::table('tariffs', function (Blueprint $table) {
            $table->foreignId('rkas_account_id')->nullable()->after('academic_year_id')
                ->constrained('rkas_accounts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tariffs', function (Blueprint $table) {
            $table->dropForeign(['rkas_account_id']);
            $table->dropColumn('rkas_account_id');
        });
    }
};
