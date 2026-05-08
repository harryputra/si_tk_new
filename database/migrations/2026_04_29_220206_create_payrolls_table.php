<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->restrictOnDelete();
            $table->date('periode');
            $table->unsignedSmallInteger('jumlah_hadir')->default(0);
            $table->unsignedSmallInteger('jumlah_alfa')->default(0);
            $table->unsignedSmallInteger('jumlah_izin')->default(0);
            $table->unsignedSmallInteger('jumlah_sakit')->default(0);
            // snapshot salary components at generation time
            $table->decimal('gaji_pokok', 12, 2);
            $table->decimal('tunjangan', 12, 2)->default(0);
            $table->decimal('bonus_kehadiran', 12, 2)->default(0);
            $table->decimal('potongan_alfa', 12, 2)->default(0);
            $table->decimal('potongan_lain', 12, 2)->default(0);
            $table->decimal('total_take_home_pay', 12, 2);
            $table->text('catatan')->nullable();
            $table->enum('status_approval', ['draft', 'approved', 'paid'])->default('draft');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['teacher_id', 'periode']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
