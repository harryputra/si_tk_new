<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\Student;
use App\Models\Tariff;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'invoices:generate {date?}';
    protected $description = 'Generate monthly student invoices based on active tariffs';

    public function handle()
    {
        $dateStr = $this->argument('date') ?: date('Y-m-01');
        $periode = date('Y-m-01', strtotime($dateStr));
        $jatuhTempo = date('Y-m-10', strtotime($dateStr));

        $this->info("Generating invoices for period: $periode");

        $students = Student::active()->get();
        $count = 0;

        foreach ($students as $student) {
            // Get active SPP tariff for this student type and year
            $tariff = Tariff::where('jenis_tarif', 'spp')
                ->where(function($q) use ($student) {
                    $q->where('jenis_siswa', $student->jenis_siswa)
                      ->orWhere('jenis_siswa', 'all');
                })
                ->where('tahun_berlaku', $student->tahun_angkatan)
                ->first();

            if (!$tariff) {
                $this->warn("No SPP tariff found for student: {$student->nama_lengkap} (Type: {$student->jenis_siswa})");
                continue;
            }

            // Check if invoice already exists
            $exists = Invoice::where('student_id', $student->id)
                ->where('periode', $periode)
                ->exists();

            if ($exists) continue;

            Invoice::create([
                'student_id'      => $student->id,
                'tariff_id'       => $tariff->id,
                'periode'         => $periode,
                'nominal_tagihan'  => $tariff->nominal,
                'status'          => 'unpaid',
                'jatuh_tempo'     => $jatuhTempo,
            ]);

            $count++;
        }

        $this->info("Successfully generated $count invoices.");
    }
}
