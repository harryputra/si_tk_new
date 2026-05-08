<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tariffs', function (Blueprint $table) {
            // Untuk applicability='level' — value-nya cocok dengan school_classes.level
            // (string bebas, misal "TK A", "Kelas 1", "Kelas 2")
            $table->string('applicable_level')->nullable()->after('applicable_id');
        });
    }

    public function down(): void
    {
        Schema::table('tariffs', function (Blueprint $table) {
            $table->dropColumn('applicable_level');
        });
    }
};
