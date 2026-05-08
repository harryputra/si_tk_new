<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Audit trail untuk setiap perubahan pada RKAS — terutama PAGU ANGGARAN.
     *
     * Setiap revisi pagu (mis. naik karena hibah baru, turun karena efisiensi)
     * WAJIB tercatat dengan alasan, agar pertanggungjawaban Yayasan jelas
     * (siapa-mengubah-apa-kapan-kenapa).
     */
    public function up(): void
    {
        Schema::create('rkas_budget_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rkas_budget_id')->constrained()->cascadeOnDelete();
            $table->string('field_changed'); // mis. 'pagu_anggaran', 'uraian'
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->text('reason'); // WAJIB
            $table->foreignId('changed_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['rkas_budget_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rkas_budget_revisions');
    }
};
