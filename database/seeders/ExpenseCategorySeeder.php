<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Operasional Sekolah',
                'code' => 'OPS',
                'description' => 'Biaya operasional harian sekolah (listrik, air, atk, dll)',
            ],
            [
                'name' => 'Gaji & Honorarium',
                'code' => 'GAJI',
                'description' => 'Pembayaran gaji guru dan karyawan',
            ],
            [
                'name' => 'Sarana & Prasarana',
                'code' => 'SARPRAS',
                'description' => 'Pemeliharaan dan pengadaan fasilitas sekolah',
            ],
            [
                'name' => 'Kegiatan Kesiswaan',
                'code' => 'SISWA',
                'description' => 'Biaya lomba, acara, dan kegiatan murid',
            ],
            [
                'name' => 'Pengembangan SDM',
                'code' => 'SDM',
                'description' => 'Pelatihan dan workshop untuk guru',
            ],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::updateOrCreate(['code' => $category['code']], $category);
        }
    }
}
