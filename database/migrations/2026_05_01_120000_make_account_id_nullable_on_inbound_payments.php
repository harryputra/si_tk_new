<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Untuk pembayaran berjenis "kebijakan" (subsidi/pemutihan/diskon kelulusan),
     * tidak ada uang masuk ke rekening — jadi account_id boleh NULL.
     */
    public function up(): void
    {
        Schema::table('inbound_payments', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('inbound_payments', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable(false)->change();
        });
    }
};
