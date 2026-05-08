<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payroll_component_id')->constrained()->restrictOnDelete();
            // Nominal effective utk assignment ini (override default_nominal komponen)
            $table->decimal('nominal', 12, 2);
            // Periode berlaku — engine generate cek tanggal payroll period vs ini.
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            // Evidence administrasi
            $table->string('sk_number')->nullable();
            $table->string('sk_file')->nullable(); // path di storage public disk
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();

            $table->index(['teacher_id', 'effective_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_assignments');
    }
};
