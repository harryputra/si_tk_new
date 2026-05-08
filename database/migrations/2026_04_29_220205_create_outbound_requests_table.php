<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outbound_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rkas_id')->nullable()->constrained('rkas_budgets')->nullOnDelete();
            $table->foreignId('account_id')->constrained()->restrictOnDelete();
            $table->string('judul_pengajuan');
            $table->text('deskripsi');
            $table->decimal('nominal', 12, 2);
            $table->enum('jenis_pengajuan', ['sekolah', 'yayasan']);
            $table->enum('status_approval', ['pending', 'approved', 'revised', 'rejected', 'disbursed'])->default('pending');
            $table->text('catatan_reviewer')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('disbursed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('disbursed_at')->nullable();
            $table->foreignId('dibuat_oleh')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outbound_requests');
    }
};
