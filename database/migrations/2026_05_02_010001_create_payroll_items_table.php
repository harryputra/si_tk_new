<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Line items per Payroll — breakdown granular hasil generate.
     * Setiap row mewakili satu komponen yang dikenakan ke teacher di bulan tsb,
     * dengan SNAPSHOT penuh (nama, formula, nominal) supaya audit historis tetap
     * akurat meski komponen / assignment di-update di masa depan.
     */
    public function up(): void
    {
        Schema::create('payroll_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payroll_component_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payroll_assignment_id')->nullable()->constrained()->nullOnDelete();

            // SNAPSHOT — di-freeze pada saat generate.
            $table->string('description');                    // snapshot dari component.name
            $table->string('kind');                           // earning | deduction
            $table->string('formula');                        // flat | per_attendance_day | per_alfa_day
            $table->string('category')->nullable();
            $table->decimal('unit_count', 8, 2)->default(1);  // jumlah unit (1 utk flat, hadir utk per_attendance_day, alfa utk per_alfa_day)
            $table->decimal('unit_nominal', 12, 2);           // nominal per unit
            $table->decimal('amount', 12, 2);                 // = unit_count × unit_nominal

            // Bukti administrasi snapshot (kalau assignment punya)
            $table->string('sk_number_snapshot')->nullable();

            // Apakah item ini ditambah / diedit secara manual (bukan dari engine generate)
            $table->boolean('is_manual')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['payroll_id', 'kind']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_items');
    }
};
