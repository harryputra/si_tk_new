<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * PostgreSQL: relax enum check constraint pada inbound_payments
     * supaya jenis_bayar bisa 'kebijakan' dan jenis_transaksi bisa
     * subsidi_yayasan/pemutihan/diskon_kelulusan untuk transaksi penyesuaian.
     *
     * Pakai DB::statement karena Laravel doctrine/dbal punya keterbatasan
     * mengubah enum di PostgreSQL.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE inbound_payments DROP CONSTRAINT IF EXISTS inbound_payments_jenis_bayar_check');
        DB::statement(
            "ALTER TABLE inbound_payments ADD CONSTRAINT inbound_payments_jenis_bayar_check ".
            "CHECK (jenis_bayar IN ('lunas', 'cicilan', 'kebijakan'))"
        );

        DB::statement('ALTER TABLE inbound_payments DROP CONSTRAINT IF EXISTS inbound_payments_jenis_transaksi_check');
        DB::statement(
            "ALTER TABLE inbound_payments ADD CONSTRAINT inbound_payments_jenis_transaksi_check ".
            "CHECK (jenis_transaksi IN ('tunai', 'transfer', 'subsidi_yayasan', 'pemutihan', 'diskon_kelulusan'))"
        );
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE inbound_payments DROP CONSTRAINT IF EXISTS inbound_payments_jenis_bayar_check');
        DB::statement(
            "ALTER TABLE inbound_payments ADD CONSTRAINT inbound_payments_jenis_bayar_check ".
            "CHECK (jenis_bayar IN ('lunas', 'cicilan'))"
        );

        DB::statement('ALTER TABLE inbound_payments DROP CONSTRAINT IF EXISTS inbound_payments_jenis_transaksi_check');
        DB::statement(
            "ALTER TABLE inbound_payments ADD CONSTRAINT inbound_payments_jenis_transaksi_check ".
            "CHECK (jenis_transaksi IN ('tunai', 'transfer'))"
        );
    }
};
