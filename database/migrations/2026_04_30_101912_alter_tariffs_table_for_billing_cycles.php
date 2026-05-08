<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tariffs', function (Blueprint $table) {
            $table->string('billing_cycle')->default('monthly'); // one_time, monthly, annual, situational
            $table->string('applicability')->default('all'); // all, class, student
            $table->foreignId('academic_year_id')->nullable()->constrained('academic_years')->nullOnDelete();
            $table->unsignedBigInteger('applicable_id')->nullable(); // could be class_id or student_id depending on applicability
        });
    }

    public function down(): void
    {
        Schema::table('tariffs', function (Blueprint $table) {
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn(['billing_cycle', 'applicability', 'academic_year_id', 'applicable_id']);
        });
    }
};
