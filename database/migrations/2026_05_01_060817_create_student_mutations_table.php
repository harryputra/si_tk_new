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
        Schema::create('student_mutations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_class_id')->nullable()->constrained('school_classes')->nullOnDelete(); // Kelas terakhir
            $table->date('tanggal_keluar');
            $table->string('alasan');
            $table->decimal('sisa_tagihan_akhir', 15, 2)->default(0);
            $table->string('status_penyelesaian'); // e.g., 'Lunas Tunai', 'Pemutihan', 'Diskon Kebijakan'
            $table->foreignId('admin_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_mutations');
    }
};
