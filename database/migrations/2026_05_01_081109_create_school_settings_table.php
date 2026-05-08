<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('nama_sekolah');
            $table->text('alamat');
            $table->string('telepon');
            $table->string('email');
            $table->string('website')->nullable();
            $table->string('nama_kepala_sekolah')->nullable();
            $table->string('nip_kepala_sekolah')->nullable();
            $table->string('logo')->nullable();
            $table->timestamps();
        });

        // Seed initial data
        DB::table('school_settings')->insert([
            'nama_sekolah' => 'TK ISLAM ATTAUHID',
            'alamat' => 'Jl. Raya Attauhid No. 123, Kota Administrasi, Indonesia',
            'telepon' => '(021) 1234567',
            'email' => 'info@tk-attauhid.sch.id',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
