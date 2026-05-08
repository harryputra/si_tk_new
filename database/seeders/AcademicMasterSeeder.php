<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\StudentType;
use Illuminate\Database\Seeder;

class AcademicMasterSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tahun Ajaran
        $years = [
            ['name' => '2023/2024', 'is_active' => false],
            ['name' => '2024/2025', 'is_active' => true],
            ['name' => '2025/2026', 'is_active' => false],
        ];
        foreach ($years as $year) {
            AcademicYear::updateOrCreate(['name' => $year['name']], $year);
        }

        // 2. Jenis Siswa
        $types = [
            ['name' => 'Reguler', 'code' => 'reguler', 'description' => 'Siswa kelas reguler standar'],
            ['name' => 'Reguler Opsi 2', 'code' => 'reguler_opsi2', 'description' => 'Siswa kelas reguler dengan opsi biaya tambahan'],
            ['name' => 'Full Day', 'code' => 'fullday', 'description' => 'Siswa program full day'],
        ];
        foreach ($types as $type) {
            StudentType::updateOrCreate(['code' => $type['code']], $type);
        }

        // 3. Kelas
        $classes = [
            ['name' => 'TK A - Merpati', 'level' => 'TK A'],
            ['name' => 'TK A - Elang', 'level' => 'TK A'],
            ['name' => 'TK B - Garuda', 'level' => 'TK B'],
            ['name' => 'TK B - Rajawali', 'level' => 'TK B'],
        ];
        foreach ($classes as $class) {
            SchoolClass::updateOrCreate(['name' => $class['name']], $class);
        }
    }
}
