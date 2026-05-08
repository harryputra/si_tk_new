<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tariffs', function (Blueprint $table) {
            $table->id();
            $table->string('nama_tarif');
            $table->enum('jenis_tarif', ['spp', 'dsp', 'kegiatan_tahunan', 'seragam', 'pendaftaran', 'snack']);
            $table->enum('jenis_siswa', ['reguler', 'reguler_opsi2', 'fullday', 'all']);
            $table->decimal('nominal', 12, 2);
            $table->year('tahun_berlaku');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tariffs');
    }
};
