<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->string('status')->default('active'); // active, graduated, dropped, retained (tinggal kelas)
            $table->timestamps();
            
            // A student should only be enrolled in one class per academic year usually, but sometimes things change.
            // Still, it's good to have it tracked.
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};
