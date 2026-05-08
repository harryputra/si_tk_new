<?php

namespace Database\Seeders;

use App\Models\RkasAccount;
use Illuminate\Database\Seeder;

class RkasAccountSeeder extends Seeder
{
    /**
     * Seed default Chart of Accounts.
     * Idempoten via firstOrCreate(kode).
     *
     * Konvensi:
     *   4.x.x = Pendapatan
     *   5.x.x = Pengeluaran (mengikuti 8 SNP — Standar Nasional Pendidikan)
     */
    public function run(): void
    {
        // ===== PENDAPATAN =====
        $pendapatanRoots = [
            ['4.1', 'Pendapatan SPP & DSP'],
            ['4.2', 'Pendapatan Bantuan Operasional'],
            ['4.3', 'Pendapatan Hibah & Sumbangan'],
            ['4.9', 'Pendapatan Lain-lain'],
        ];
        foreach ($pendapatanRoots as [$kode, $name]) {
            RkasAccount::firstOrCreate(
                ['kode' => $kode],
                ['name' => $name, 'kind' => RkasAccount::KIND_PENDAPATAN, 'level' => 0, 'is_active' => true]
            );
        }

        // Children pendapatan
        $pendapatanChildren = [
            ['4.1.1', 'SPP Reguler', '4.1'],
            ['4.1.2', 'SPP Fullday', '4.1'],
            ['4.1.3', 'DSP / Uang Pangkal', '4.1'],
            ['4.1.4', 'Daftar Ulang', '4.1'],
            ['4.2.1', 'Dana BOS Pusat', '4.2'],
            ['4.2.2', 'Dana BOSDA / BOP Daerah', '4.2'],
            ['4.3.1', 'Hibah Yayasan', '4.3'],
            ['4.3.2', 'Sumbangan Wali Murid', '4.3'],
            ['4.9.1', 'Pendapatan Kantin / Koperasi', '4.9'],
        ];
        foreach ($pendapatanChildren as [$kode, $name, $parentKode]) {
            $parent = RkasAccount::where('kode', $parentKode)->first();
            RkasAccount::firstOrCreate(
                ['kode' => $kode],
                [
                    'name'      => $name,
                    'kind'      => RkasAccount::KIND_PENDAPATAN,
                    'parent_id' => $parent?->id,
                    'level'     => 1,
                    'is_active' => true,
                ]
            );
        }

        // ===== PENGELUARAN — 8 SNP =====
        $pengeluaranRoots = [
            ['5.1', 'Standar Isi'],
            ['5.2', 'Standar Proses'],
            ['5.3', 'Standar Kompetensi Lulusan'],
            ['5.4', 'Standar Pendidik & Tenaga Kependidikan (PTK)'],
            ['5.5', 'Standar Sarana & Prasarana'],
            ['5.6', 'Standar Pengelolaan'],
            ['5.7', 'Standar Pembiayaan'],
            ['5.8', 'Standar Penilaian'],
        ];
        foreach ($pengeluaranRoots as [$kode, $name]) {
            RkasAccount::firstOrCreate(
                ['kode' => $kode],
                ['name' => $name, 'kind' => RkasAccount::KIND_PENGELUARAN, 'level' => 0, 'is_active' => true]
            );
        }

        // Common children pengeluaran (yang paling sering dipakai)
        $pengeluaranChildren = [
            // Standar PTK (gaji & tunjangan)
            ['5.4.1', 'Belanja Pegawai - Gaji Pokok', '5.4'],
            ['5.4.2', 'Belanja Pegawai - Tunjangan Jabatan', '5.4'],
            ['5.4.3', 'Belanja Pegawai - Tunjangan Kehadiran', '5.4'],
            ['5.4.4', 'Pelatihan & Pengembangan Guru', '5.4'],
            // Standar Sarpras
            ['5.5.1', 'Pemeliharaan Gedung', '5.5'],
            ['5.5.2', 'Listrik, Air, Telepon', '5.5'],
            ['5.5.3', 'Alat Tulis Kantor (ATK)', '5.5'],
            ['5.5.4', 'Pembelian Inventaris', '5.5'],
            // Standar Proses (kegiatan siswa)
            ['5.2.1', 'Kegiatan Belajar Mengajar (KBM)', '5.2'],
            ['5.2.2', 'Kegiatan Outing / Field Trip', '5.2'],
            ['5.2.3', 'Snack & Konsumsi Siswa', '5.2'],
            // Standar Pengelolaan (admin & operasional)
            ['5.6.1', 'Operasional Administrasi', '5.6'],
            ['5.6.2', 'Acara & PHBI', '5.6'],
            // Pembiayaan
            ['5.7.1', 'Beasiswa & Subsidi Siswa', '5.7'],
        ];
        foreach ($pengeluaranChildren as [$kode, $name, $parentKode]) {
            $parent = RkasAccount::where('kode', $parentKode)->first();
            RkasAccount::firstOrCreate(
                ['kode' => $kode],
                [
                    'name'      => $name,
                    'kind'      => RkasAccount::KIND_PENGELUARAN,
                    'parent_id' => $parent?->id,
                    'level'     => 1,
                    'is_active' => true,
                ]
            );
        }
    }
}
