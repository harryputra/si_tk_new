<?php

namespace Database\Seeders;

use App\Models\RkasBudget;
use Illuminate\Database\Seeder;

class RkasBudgetSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            // Kategori 1: KBM
            ['kode' => '1.1', 'utama' => 'Kegiatan Belajar Mengajar', 'uraian' => 'Pengadaan ATK & Modul Siswa', 'pagu' => 25000000],
            ['kode' => '1.2', 'utama' => 'Kegiatan Belajar Mengajar', 'uraian' => 'Lomba Akademik & Pentas Seni', 'pagu' => 15000000],
            ['kode' => '1.3', 'utama' => 'Kegiatan Belajar Mengajar', 'uraian' => 'Study Tour & Edukasi Luar Sekolah', 'pagu' => 30000000],
            
            // Kategori 2: Sarpras
            ['kode' => '2.1', 'utama' => 'Sarana & Prasarana', 'uraian' => 'Pemeliharaan Gedung & Pengecatan', 'pagu' => 45000000],
            ['kode' => '2.2', 'utama' => 'Sarana & Prasarana', 'uraian' => 'Perbaikan & Servis AC Berkala', 'pagu' => 10000000],
            ['kode' => '2.3', 'utama' => 'Sarana & Prasarana', 'uraian' => 'Pengadaan Laptop & Printer Kantor', 'pagu' => 20000000],
            
            // Kategori 3: SDM
            ['kode' => '3.1', 'utama' => 'Pengembangan SDM', 'uraian' => 'Pelatihan & Workshop Guru', 'pagu' => 12000000],
            ['kode' => '3.2', 'utama' => 'Pengembangan SDM', 'uraian' => 'Tunjangan Hari Raya (THR) Staff', 'pagu' => 50000000],
            ['kode' => '3.3', 'utama' => 'Pengembangan SDM', 'uraian' => 'Transport & Perjalanan Dinas', 'pagu' => 8000000],
            
            // Kategori 4: Operasional
            ['kode' => '4.1', 'utama' => 'Operasional & Lainnya', 'uraian' => 'Tagihan Listrik, Air & Internet', 'pagu' => 36000000],
            ['kode' => '4.2', 'utama' => 'Operasional & Lainnya', 'uraian' => 'Biaya Konsumsi Rapat & Tamu', 'pagu' => 5000000],
            ['kode' => '4.3', 'utama' => 'Operasional & Lainnya', 'uraian' => 'Promosi, Brosur & Spanduk PPDB', 'pagu' => 7000000],
        ];

        foreach ([2024, 2025, 2026] as $year) {
            foreach ($data as $item) {
                RkasBudget::updateOrCreate(
                    [
                        'kode_rkas' => $item['kode'] . '.' . $year,
                        'tahun_anggaran' => $year,
                    ],
                    [
                        'uraian' => $item['uraian'],
                        'kategori_utama' => $item['utama'],
                        'sub_kategori' => $item['utama'],
                        'pagu_anggaran' => $item['pagu'],
                        'terpakai' => 0,
                    ]
                );
            }
        }
    }
}
