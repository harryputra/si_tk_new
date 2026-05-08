<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('nip')->unique();
            $table->string('nama_lengkap');
            $table->string('jabatan');
            $table->string('no_hp')->nullable();
            $table->decimal('gaji_pokok', 12, 2)->default(0);
            $table->decimal('bonus_hadir', 12, 2)->default(0);
            $table->decimal('denda_alfa', 12, 2)->default(0);
            $table->decimal('tunjangan_tetap', 12, 2)->default(0);
            $table->string('nama_bank')->nullable();
            $table->string('nomor_rekening_bank')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
