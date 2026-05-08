<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "TK A-1"
            $table->string('level'); // e.g., "TK A", "TK B", "Playgroup"
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->nullOnDelete(); // wali kelas
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_classes');
    }
};
