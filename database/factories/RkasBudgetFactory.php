<?php

namespace Database\Factories;

use App\Models\RkasBudget;
use Illuminate\Database\Eloquent\Factories\Factory;

class RkasBudgetFactory extends Factory
{
    protected $model = RkasBudget::class;

    public function definition(): array
    {
        $categories = [
            'Kegiatan Belajar Mengajar' => ['Pengadaan ATK Siswa', 'Buku Paket & Modul', 'Lomba Akademik & Seni', 'Alat Peraga Edukasi'],
            'Sarana & Prasarana' => ['Pemeliharaan Gedung', 'Perbaikan AC & Listrik', 'Pengadaan Kursi & Meja', 'Langganan Internet/Wifi'],
            'Pengembangan SDM' => ['Pelatihan Guru (Workshop)', 'Seminar Parenting', 'Insentif Lembur Staff', 'Transport Dinas'],
            'Operasional & Lainnya' => ['Tagihan Listrik & Air', 'Kebersihan & Keamanan', 'Biaya Konsumsi Rapat', 'Promosi & Brosur PPDB'],
        ];

        $utama = $this->faker->randomElement(array_keys($categories));
        $uraian = $this->faker->randomElement($categories[$utama]);

        return [
            'kode_rkas' => $this->faker->unique()->bothify('###.#'),
            'uraian' => $uraian,
            'kategori_utama' => $utama,
            'sub_kategori' => $utama,
            'pagu_anggaran' => $this->faker->randomFloat(2, 10000000, 100000000),
            'terpakai' => 0,
            'tahun_anggaran' => $this->faker->randomElement([2024, 2025, 2026]),
        ];
    }
}
