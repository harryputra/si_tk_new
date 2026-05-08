<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rkas_budgets', function (Blueprint $table) {
            $table->id();
            $table->string('kode_rkas')->unique();
            $table->string('uraian');
            $table->string('kategori_utama');
            $table->string('sub_kategori')->nullable();
            $table->decimal('pagu_anggaran', 15, 2);
            $table->decimal('terpakai', 15, 2)->default(0);
            $table->year('tahun_anggaran');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rkas_budgets');
    }
};
