<?php

namespace Database\Seeders;

use App\Models\Tariff;
use Illuminate\Database\Seeder;

class TariffSeeder extends Seeder
{
    public function run(): void
    {
        $tahun = 2025;

        $tariffs = [
            // SPP per jenis siswa
            ['nama_tarif' => 'SPP Reguler', 'jenis_tarif' => 'spp', 'jenis_siswa' => 'reguler', 'nominal' => 200000, 'tahun_berlaku' => $tahun],
            ['nama_tarif' => 'SPP Reguler Opsi 2', 'jenis_tarif' => 'spp', 'jenis_siswa' => 'reguler_opsi2', 'nominal' => 250000, 'tahun_berlaku' => $tahun],
            ['nama_tarif' => 'SPP Fullday', 'jenis_tarif' => 'spp', 'jenis_siswa' => 'fullday', 'nominal' => 350000, 'tahun_berlaku' => $tahun],

            // DSP (Dana Sumbangan Pendidikan)
            ['nama_tarif' => 'DSP Reguler', 'jenis_tarif' => 'dsp', 'jenis_siswa' => 'reguler', 'nominal' => 1500000, 'tahun_berlaku' => $tahun],
            ['nama_tarif' => 'DSP Reguler Opsi 2', 'jenis_tarif' => 'dsp', 'jenis_siswa' => 'reguler_opsi2', 'nominal' => 1750000, 'tahun_berlaku' => $tahun],
            ['nama_tarif' => 'DSP Fullday', 'jenis_tarif' => 'dsp', 'jenis_siswa' => 'fullday', 'nominal' => 2000000, 'tahun_berlaku' => $tahun],

            // Kegiatan tahunan (semua jenis)
            ['nama_tarif' => 'Kegiatan Tahunan', 'jenis_tarif' => 'kegiatan_tahunan', 'jenis_siswa' => 'all', 'nominal' => 500000, 'tahun_berlaku' => $tahun],

            // Snack (fullday only)
            ['nama_tarif' => 'Snack Fullday', 'jenis_tarif' => 'snack', 'jenis_siswa' => 'fullday', 'nominal' => 100000, 'tahun_berlaku' => $tahun],
        ];

        foreach ($tariffs as $tariff) {
            Tariff::firstOrCreate(
                [
                    'jenis_tarif'   => $tariff['jenis_tarif'],
                    'jenis_siswa'   => $tariff['jenis_siswa'],
                    'tahun_berlaku' => $tariff['tahun_berlaku'],
                ],
                $tariff
            );
        }
    }
}
