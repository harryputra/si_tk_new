<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'tunai' to enum by changing it to string first or using DB statement for PGSQL
        DB::statement("ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_jenis_check");
        
        Schema::table('accounts', function (Blueprint $table) {
            $table->string('jenis')->change();
        });

        // Seed default Kas Tunai if it doesn't exist
        if (!DB::table('accounts')->where('nama_rekening', 'KAS TUNAI')->exists()) {
            DB::table('accounts')->insert([
                'nama_rekening' => 'KAS TUNAI',
                'bank' => 'TUNAI',
                'nomor_rekening' => 'CASH-001',
                'jenis' => 'tunai',
                'saldo' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            // Reverting is complex for enum, keep as string for now
        });
    }
};
