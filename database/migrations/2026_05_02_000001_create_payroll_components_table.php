<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_components', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // earning  = pendapatan (gaji pokok, tunjangan, bonus)
            // deduction = potongan (BPJS, kasbon, denda)
            $table->string('kind');
            // recurring = ikut tiap bulan otomatis (sesuai assignment aktif)
            // temporary = sekali bayar manual (proyek/event)
            $table->string('frequency');
            // flat                = nominal × 1 (tetap per bulan)
            // per_attendance_day  = nominal × jumlah hari hadir
            // per_alfa_day        = nominal × jumlah hari alfa
            $table->string('formula')->default('flat');
            // grouping label utk laporan: tunjangan_jabatan, tunjangan_umum, potongan_wajib, dll.
            $table->string('category')->nullable();
            $table->decimal('default_nominal', 12, 2)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_components');
    }
};
