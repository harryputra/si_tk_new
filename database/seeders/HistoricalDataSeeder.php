<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Attendance;
use App\Models\InboundPayment;
use App\Models\Invoice;
use App\Models\OutboundRequest;
use App\Models\Payroll;
use App\Models\RkasBudget;
use App\Models\Student;
use App\Models\Tariff;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HistoricalDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Base Data
        $admin = User::first() ?? User::factory()->create();
        
        $accounts = Account::all();
        if ($accounts->isEmpty()) {
            $this->call(AccountSeeder::class);
            $accounts = Account::all();
        }

        $tariffs = Tariff::all();
        if ($tariffs->isEmpty()) {
            $this->call(TariffSeeder::class);
            $tariffs = Tariff::all();
        }

        // 2. Create Students & Teachers
        $students = Student::factory()->count(30)->create();
        $teachers = Teacher::factory()->count(10)->create();

        // 3. Historical Data for 2 Years (2024 - 2025)
        $startYear = 2024;
        $endYear = 2025;

        for ($year = $startYear; $year <= $endYear; $year++) {
            // Fetch standardized RKAS for this year from RkasBudgetSeeder
            $budgets = RkasBudget::where('tahun_anggaran', $year)->get();
            if ($budgets->isEmpty()) {
                $budgets = RkasBudget::factory()->count(10)->create([
                    'tahun_anggaran' => $year,
                ]);
            }

            for ($month = 1; $month <= 12; $month++) {
                $date = Carbon::create($year, $month, 1);
                
                // --- INBOUND SIMULATION ---
                foreach ($students as $student) {
                    $tariff = $tariffs->where('jenis_siswa', $student->jenis_siswa)->first() ?? $tariffs->first();
                    
                    $invoice = Invoice::create([
                        'student_id' => $student->id,
                        'tariff_id' => $tariff->id,
                        'periode' => $date->format('Y-m-01'),
                        'nominal_tagihan' => $tariff->nominal,
                        'nominal_terbayar' => 0,
                        'status' => 'unpaid',
                        'jatuh_tempo' => $date->copy()->day(10)->format('Y-m-d'),
                        'created_at' => $date,
                    ]);

                    // Simulate payment (90% pay on time)
                    if (rand(1, 100) <= 90) {
                        $payDate = $date->copy()->addDays(rand(1, 15));
                        InboundPayment::create([
                            'invoice_id' => $invoice->id,
                            'student_id' => $student->id,
                            'account_id' => $accounts->random()->id,
                            'total_bayar' => $tariff->nominal,
                            'jenis_bayar' => 'lunas',
                            'jenis_transaksi' => rand(1, 2) == 1 ? 'tunai' : 'transfer',
                            'status_approval' => 'approved',
                            'dibuat_oleh' => $admin->id,
                            'approved_by' => $admin->id,
                            'approved_at' => $payDate,
                            'created_at' => $payDate,
                        ]);
                    }
                }

                // --- PAYROLL & ATTENDANCE SIMULATION ---
                foreach ($teachers as $teacher) {
                    // Create attendance for the whole month
                    $daysInMonth = $date->daysInMonth;
                    $hadirCount = 0;
                    $izinCount = 0;
                    $sakitCount = 0;
                    $alfaCount = 0;

                    for ($d = 1; $d <= $daysInMonth; $d++) {
                        $currentDay = $date->copy()->day($d);
                        if ($currentDay->isWeekend()) continue;

                        $status = 'hadir';
                        $rand = rand(1, 100);
                        if ($rand > 95) { $status = 'alfa'; $alfaCount++; }
                        elseif ($rand > 92) { $status = 'izin'; $izinCount++; }
                        elseif ($rand > 89) { $status = 'sakit'; $sakitCount++; }
                        else { $hadirCount++; }

                        Attendance::create([
                            'teacher_id' => $teacher->id,
                            'admin_id' => $admin->id,
                            'tanggal' => $currentDay->format('Y-m-d'),
                            'status' => $status,
                            'keterangan' => $status != 'hadir' ? 'Auto-generated' : null,
                        ]);
                    }

                    // Create Payroll
                    $totalBonus = $hadirCount * $teacher->bonus_hadir;
                    $totalDenda = $alfaCount * $teacher->denda_alfa;
                    
                    $thp = ($teacher->gaji_pokok + $teacher->tunjangan_tetap + $totalBonus) - $totalDenda;

                    Payroll::create([
                        'teacher_id' => $teacher->id,
                        'periode' => $date->format('Y-m-01'),
                        'jumlah_hadir' => $hadirCount,
                        'jumlah_alfa' => $alfaCount,
                        'jumlah_izin' => $izinCount,
                        'jumlah_sakit' => $sakitCount,
                        'gaji_pokok' => $teacher->gaji_pokok,
                        'tunjangan' => $teacher->tunjangan_tetap,
                        'bonus_kehadiran' => $totalBonus,
                        'potongan_alfa' => $totalDenda,
                        'potongan_lain' => 0,
                        'total_take_home_pay' => $thp,
                        'status_approval' => 'paid',
                        'approved_by' => $admin->id,
                        'approved_at' => $date->copy()->endOfMonth(),
                        'paid_by' => $admin->id,
                        'paid_at' => $date->copy()->endOfMonth(),
                        'created_at' => $date->copy()->endOfMonth(),
                    ]);
                }

                // --- OUTBOUND SIMULATION ---
                $requestCount = rand(3, 5);
                for ($i = 0; $i < $requestCount; $i++) {
                    $reqDate = $date->copy()->addDays(rand(1, 28));
                    $nominal = rand(100000, 2000000);
                    $budget = $budgets->random();

                    OutboundRequest::create([
                        'rkas_id' => $budget->id,
                        'account_id' => $accounts->random()->id,
                        'judul_pengajuan' => 'Operasional ' . $budget->sub_kategori . ' ' . $i,
                        'deskripsi' => 'Pengeluaran rutin bulanan untuk ' . $budget->uraian,
                        'nominal' => $nominal,
                        'jenis_pengajuan' => 'sekolah',
                        'status_approval' => 'disbursed',
                        'dibuat_oleh' => $admin->id,
                        'approved_by' => $admin->id,
                        'approved_at' => $reqDate->copy()->addHours(2),
                        'disbursed_by' => $admin->id,
                        'disbursed_at' => $reqDate->copy()->addHours(4),
                        'created_at' => $reqDate,
                    ]);
                }
            }
        }
    }
}
