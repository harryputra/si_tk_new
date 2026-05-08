<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\AcademicYear;
use App\Models\InboundPayment;
use App\Models\Invoice;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Tariff;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class GraduationSimulationSeeder extends Seeder
{
    /**
     * Seeder simulasi lengkap untuk skenario Kenaikan Kelas & Kelulusan.
     *
     * Membuat:
     * - 5 Kelas (PG, TK A-1, TK A-2, TK B-1, TK B-2)
     * - 3 Tahun Ajaran (2023/2024, 2024/2025, 2025/2026)
     * - 5 Guru sebagai Wali Kelas
     * - 40 Siswa tersebar di semua kelas
     * - Tagihan SPP per bulan (Jul-Jun)
     * - Skenario: Lunas, Sebagian Bayar, Tunggakan Penuh
     */
    public function run(): void
    {
        $admin = User::first();

        // --- 1. ACADEMIC YEARS ---
        $ay2324 = AcademicYear::firstOrCreate(['name' => '2023/2024'], ['is_active' => false]);
        $ay2425 = AcademicYear::firstOrCreate(['name' => '2024/2025'], ['is_active' => false]);
        $ay2526 = AcademicYear::firstOrCreate(['name' => '2025/2026'], ['is_active' => true]);

        // --- 2. SCHOOL CLASSES ---
        $classPG   = SchoolClass::firstOrCreate(['name' => 'Playgroup'],  ['level' => 'PG']);
        $classA1   = SchoolClass::firstOrCreate(['name' => 'TK A-1'],    ['level' => 'TK A']);
        $classA2   = SchoolClass::firstOrCreate(['name' => 'TK A-2'],    ['level' => 'TK A']);
        $classB1   = SchoolClass::firstOrCreate(['name' => 'TK B-1'],    ['level' => 'TK B']);
        $classB2   = SchoolClass::firstOrCreate(['name' => 'TK B-2'],    ['level' => 'TK B']);

        // Assign wali kelas
        $teachers = Teacher::all();
        if ($teachers->count() < 5) {
            $needed = 5 - $teachers->count();
            $newTeachers = Teacher::factory()->count($needed)->create();
            $teachers = $teachers->merge($newTeachers);
        }
        $classPG->update(['teacher_id' => $teachers[0]->id]);
        $classA1->update(['teacher_id' => $teachers[1]->id]);
        $classA2->update(['teacher_id' => $teachers[2]->id]);
        $classB1->update(['teacher_id' => $teachers[3]->id]);
        $classB2->update(['teacher_id' => $teachers[4]->id]);

        // --- 3. ACCOUNTS ---
        $accounts = Account::all();
        if ($accounts->isEmpty()) {
            $this->call(AccountSeeder::class);
            $accounts = Account::all();
        }

        // --- 4. TARIF SPP ---
        $tariffReguler = Tariff::firstOrCreate(
            ['jenis_tarif' => 'spp', 'jenis_siswa' => 'reguler', 'tahun_berlaku' => 2025],
            ['nama_tarif' => 'SPP Reguler', 'nominal' => 200000]
        );
        $tariffFullday = Tariff::firstOrCreate(
            ['jenis_tarif' => 'spp', 'jenis_siswa' => 'fullday', 'tahun_berlaku' => 2025],
            ['nama_tarif' => 'SPP Fullday', 'nominal' => 350000]
        );

        // --- 5. SISWA ---
        // Nama-nama realistis TK
        $namaAnak = [
            // Playgroup (8 anak - angkatan 2025, baru masuk)
            ['nama_lengkap' => 'Aisyah Zahra Putri',     'nama_panggilan' => 'Aisyah',  'class' => $classPG, 'angkatan' => 2025, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Muhammad Fathir Rizqi',   'nama_panggilan' => 'Fathir',  'class' => $classPG, 'angkatan' => 2025, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Naura Kayla Azzahra',     'nama_panggilan' => 'Naura',   'class' => $classPG, 'angkatan' => 2025, 'jenis' => 'fullday'],
            ['nama_lengkap' => 'Ahmad Rasyid Hakim',      'nama_panggilan' => 'Rasyid',  'class' => $classPG, 'angkatan' => 2025, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Khadijah Salsabila',      'nama_panggilan' => 'Salsa',   'class' => $classPG, 'angkatan' => 2025, 'jenis' => 'fullday'],
            ['nama_lengkap' => 'Umar Fadhil Akbar',       'nama_panggilan' => 'Fadhil',  'class' => $classPG, 'angkatan' => 2025, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Safira Nur Aini',         'nama_panggilan' => 'Fira',    'class' => $classPG, 'angkatan' => 2025, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Dzaky Alfaruq',           'nama_panggilan' => 'Dzaky',   'class' => $classPG, 'angkatan' => 2025, 'jenis' => 'reguler'],

            // TK A-1 (8 anak - angkatan 2024)
            ['nama_lengkap' => 'Hana Mufida Rahmah',      'nama_panggilan' => 'Hana',    'class' => $classA1, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Bilal Abdurrahman',        'nama_panggilan' => 'Bilal',   'class' => $classA1, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Zahra Khairunnisa',        'nama_panggilan' => 'Zahra',   'class' => $classA1, 'angkatan' => 2024, 'jenis' => 'fullday'],
            ['nama_lengkap' => 'Yusuf Ibrahim Hasan',      'nama_panggilan' => 'Yusuf',   'class' => $classA1, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Maryam Azzahra Siddiq',    'nama_panggilan' => 'Maryam',  'class' => $classA1, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Khalid Zainuddin',         'nama_panggilan' => 'Khalid',  'class' => $classA1, 'angkatan' => 2024, 'jenis' => 'fullday'],
            ['nama_lengkap' => 'Nabila Putri Amira',       'nama_panggilan' => 'Nabila',  'class' => $classA1, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Raffa Alghazali',          'nama_panggilan' => 'Raffa',   'class' => $classA1, 'angkatan' => 2024, 'jenis' => 'reguler'],

            // TK A-2 (8 anak - angkatan 2024)
            ['nama_lengkap' => 'Fathimah Nur Syifa',       'nama_panggilan' => 'Syifa',   'class' => $classA2, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Hamza Bayu Pratama',       'nama_panggilan' => 'Hamza',   'class' => $classA2, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Raisa Qurrota Ayun',       'nama_panggilan' => 'Raisa',   'class' => $classA2, 'angkatan' => 2024, 'jenis' => 'fullday'],
            ['nama_lengkap' => 'Ilyas Mukhtar Kamil',      'nama_panggilan' => 'Ilyas',   'class' => $classA2, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Amalina Husna',            'nama_panggilan' => 'Amal',    'class' => $classA2, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Gibran Arfa Haqiqi',       'nama_panggilan' => 'Gibran',  'class' => $classA2, 'angkatan' => 2024, 'jenis' => 'reguler'],
            ['nama_lengkap' => 'Nadia Rahma Sari',         'nama_panggilan' => 'Nadia',   'class' => $classA2, 'angkatan' => 2024, 'jenis' => 'fullday'],
            ['nama_lengkap' => 'Rizqi Aditya Putra',       'nama_panggilan' => 'Adit',    'class' => $classA2, 'angkatan' => 2024, 'jenis' => 'reguler'],

            // TK B-1 (8 anak - angkatan 2023 — CALON LULUS)
            ['nama_lengkap' => 'Abdullah Malik Firdaus',   'nama_panggilan' => 'Malik',   'class' => $classB1, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'lunas'],
            ['nama_lengkap' => 'Siti Hajar Kamila',        'nama_panggilan' => 'Hajar',   'class' => $classB1, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'lunas'],
            ['nama_lengkap' => 'Dawud Arkan Hidayat',      'nama_panggilan' => 'Dawud',   'class' => $classB1, 'angkatan' => 2023, 'jenis' => 'fullday',  'scenario' => 'lunas'],
            ['nama_lengkap' => 'Sumayyah Aqila Azzahra',   'nama_panggilan' => 'Aqila',   'class' => $classB1, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'sebagian'],
            ['nama_lengkap' => 'Zaid Husain Al-Habsyi',    'nama_panggilan' => 'Zaid',    'class' => $classB1, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'tunggakan'],
            ['nama_lengkap' => 'Ruqayyah Putri Rahma',     'nama_panggilan' => 'Ruru',    'class' => $classB1, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'tunggakan'],
            ['nama_lengkap' => 'Ubay Muadz Fadillah',      'nama_panggilan' => 'Ubay',    'class' => $classB1, 'angkatan' => 2023, 'jenis' => 'fullday',  'scenario' => 'sebagian'],
            ['nama_lengkap' => 'Hafshah Nurul Izzah',      'nama_panggilan' => 'Hafshah', 'class' => $classB1, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'lunas'],

            // TK B-2 (8 anak - angkatan 2023 — CALON LULUS)
            ['nama_lengkap' => 'Thariq Mujahid Akbar',     'nama_panggilan' => 'Thariq',  'class' => $classB2, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'lunas'],
            ['nama_lengkap' => 'Juwairiyah Salma',         'nama_panggilan' => 'Salma',   'class' => $classB2, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'lunas'],
            ['nama_lengkap' => 'Musab Ilham Darajat',      'nama_panggilan' => 'Musab',   'class' => $classB2, 'angkatan' => 2023, 'jenis' => 'fullday',  'scenario' => 'sebagian'],
            ['nama_lengkap' => 'Aminah Tsuraya Husna',     'nama_panggilan' => 'Amin',    'class' => $classB2, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'tunggakan'],
            ['nama_lengkap' => 'Sufyan Raditya Putra',     'nama_panggilan' => 'Sufyan',  'class' => $classB2, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'tunggakan'],
            ['nama_lengkap' => 'Kautsar Fikri Ramadhan',   'nama_panggilan' => 'Fikri',   'class' => $classB2, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'lunas'],
            ['nama_lengkap' => 'Shafiyah Hanin Azizah',    'nama_panggilan' => 'Hanin',   'class' => $classB2, 'angkatan' => 2023, 'jenis' => 'fullday',  'scenario' => 'lunas'],
            ['nama_lengkap' => 'Qais Athallah Zulfiqar',   'nama_panggilan' => 'Qais',    'class' => $classB2, 'angkatan' => 2023, 'jenis' => 'reguler',  'scenario' => 'sebagian'],
        ];

        $counter = 1;
        foreach ($namaAnak as $data) {
            $nis = 'TK' . $data['angkatan'] . str_pad($counter, 3, '0', STR_PAD_LEFT);

            $student = Student::firstOrCreate(
                ['nis' => $nis],
                [
                    'nama_lengkap'    => $data['nama_lengkap'],
                    'nama_panggilan'  => $data['nama_panggilan'],
                    'tahun_angkatan'  => $data['angkatan'],
                    'jenis_siswa'     => $data['jenis'],
                    'nama_wali'       => 'Wali ' . $data['nama_panggilan'],
                    'no_hp_wali'      => '08' . rand(1000000000, 9999999999),
                    'status'          => 'aktif',
                    'current_class_id' => $data['class']->id,
                ]
            );

            // Enrollment record
            $currentAY = $ay2526;
            StudentEnrollment::firstOrCreate([
                'student_id'       => $student->id,
                'school_class_id'  => $data['class']->id,
                'academic_year_id' => $currentAY->id,
            ], ['status' => 'active']);

            // --- 6. TAGIHAN SPP (10 bulan: Jul 2025 - Apr 2026) ---
            $tariff = $data['jenis'] === 'fullday' ? $tariffFullday : $tariffReguler;
            $scenario = $data['scenario'] ?? 'lunas'; // default PG & TK A = lunas

            for ($m = 7; $m <= 12; $m++) {
                $this->createInvoiceWithScenario($student, $tariff, $accounts, $admin, 2025, $m, $scenario, $ay2526);
            }
            for ($m = 1; $m <= 4; $m++) {
                $this->createInvoiceWithScenario($student, $tariff, $accounts, $admin, 2026, $m, $scenario, $ay2526);
            }

            $counter++;
        }

        $this->command->info('');
        $this->command->info('✅ Simulasi data kelulusan & kenaikan kelas berhasil dibuat!');
        $this->command->info('');
        $this->command->info('📊 Ringkasan:');
        $this->command->info("   Playgroup  : 8 siswa (semua lunas)");
        $this->command->info("   TK A-1     : 8 siswa (semua lunas) — siap naik ke TK B");
        $this->command->info("   TK A-2     : 8 siswa (semua lunas) — siap naik ke TK B");
        $this->command->info("   TK B-1     : 8 siswa (3 lunas, 2 sebagian, 2 tunggakan, 1 lunas)");
        $this->command->info("   TK B-2     : 8 siswa (4 lunas, 2 sebagian, 2 tunggakan)");
        $this->command->info('');
        $this->command->info('🎓 Skenario Kelulusan TK B:');
        $this->command->info("   ✓ LUNAS    : 8 siswa — siap diluluskan langsung");
        $this->command->info("   ◐ SEBAGIAN : 4 siswa — perlu kebijakan parsial");
        $this->command->info("   ✗ TUNGGAKAN: 4 siswa — perlu kebijakan pemutihan/subsidi");
        $this->command->info('');
    }

    private function createInvoiceWithScenario($student, $tariff, $accounts, $admin, $year, $month, $scenario, $academicYear): void
    {
        $periode = Carbon::create($year, $month, 1);
        $jatuhTempo = $periode->copy()->day(10);

        // Determine payment amount based on scenario
        $nominal = (float) $tariff->nominal;
        $terbayar = 0;
        $status = 'unpaid';

        switch ($scenario) {
            case 'lunas':
                $terbayar = $nominal;
                $status = 'paid';
                break;
            case 'sebagian':
                // Bayar 60% dari tagihan (menunggak sisanya)
                $terbayar = round($nominal * 0.6, 2);
                $status = 'partial';
                break;
            case 'tunggakan':
                // Tidak bayar sama sekali
                $terbayar = 0;
                $status = 'unpaid';
                break;
        }

        $invoice = Invoice::create([
            'student_id'       => $student->id,
            'tariff_id'        => $tariff->id,
            'academic_year_id' => $academicYear->id,
            'periode'          => $periode->format('Y-m-01'),
            'nominal_tagihan'  => $nominal,
            'nominal_terbayar' => $terbayar,
            'status'           => $status,
            'jatuh_tempo'      => $jatuhTempo->format('Y-m-d'),
            'created_at'       => $periode,
        ]);

        // Buat record pembayaran jika ada yang terbayar
        if ($terbayar > 0) {
            $payDate = $periode->copy()->addDays(rand(1, 8));
            InboundPayment::create([
                'invoice_id'       => $invoice->id,
                'student_id'       => $student->id,
                'account_id'       => $accounts->random()->id,
                'total_bayar'      => $terbayar,
                'jenis_bayar'      => $status === 'paid' ? 'lunas' : 'cicilan',
                'jenis_transaksi'  => rand(0, 1) ? 'tunai' : 'transfer',
                'status_approval'  => 'approved',
                'dibuat_oleh'      => $admin->id,
                'approved_by'      => $admin->id,
                'approved_at'      => $payDate,
                'created_at'       => $payDate,
            ]);
        }
    }
}
