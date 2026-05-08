<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('nama_rekening');
            $table->string('bank');
            $table->string('nomor_rekening')->unique();
            $table->decimal('saldo', 15, 2)->default(0);
            $table->enum('jenis', ['operasional', 'gaji']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
