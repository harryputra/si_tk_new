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
        Schema::table('students', function (Blueprint $table) {
            $table->string('registration_number')->nullable()->unique()->after('id');
            $table->string('nis')->nullable()->change();
        });

        // Drop the old constraint and add a new one that includes 'calon'
        DB::statement('ALTER TABLE students DROP CONSTRAINT IF EXISTS students_status_check');
        DB::statement("ALTER TABLE students ADD CONSTRAINT students_status_check CHECK (status::text = ANY (ARRAY['aktif'::character varying, 'alumni'::character varying, 'keluar'::character varying, 'calon'::character varying]::text[]))");
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('registration_number');
            $table->string('nis')->nullable(false)->change();
        });

        DB::statement('ALTER TABLE students DROP CONSTRAINT IF EXISTS students_status_check');
        DB::statement("ALTER TABLE students ADD CONSTRAINT students_status_check CHECK (status::text = ANY (ARRAY['aktif'::character varying, 'alumni'::character varying, 'keluar'::character varying]::text[]))");
    }
};
