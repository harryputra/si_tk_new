<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Audit trail untuk perubahan manual pada Payroll/PayrollItem.
     * Setiap "Penyesuaian" (add/edit/remove item) WAJIB punya alasan,
     * sehingga tertelusur saat audit Yayasan.
     */
    public function up(): void
    {
        Schema::create('payroll_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained()->cascadeOnDelete();
            // payroll_item_id null kalau adjustment global (mis. ubah catatan/total override)
            $table->foreignId('payroll_item_id')->nullable()->constrained()->nullOnDelete();
            // added | edited | removed
            $table->string('action');
            // Field yang berubah (untuk action=edited): amount/unit_count/unit_nominal/description/dll
            $table->string('field_changed')->nullable();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->text('reason'); // WAJIB
            $table->foreignId('changed_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['payroll_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_adjustments');
    }
};
