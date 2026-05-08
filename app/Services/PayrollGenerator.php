<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Payroll;
use App\Models\PayrollAssignment;
use App\Models\PayrollComponent;
use App\Models\PayrollItem;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Engine generate gaji bulanan berbasis komponen + assignment dinamis (Phase B2).
 *
 * Untuk setiap guru aktif:
 *   1. Hitung jumlah hari hadir/alfa/izin/sakit di periode (dari attendances).
 *   2. Ambil semua PayrollAssignment yang AKTIF di tanggal awal periode
 *      (cocok dgn definisi `effective_from <= start AND (effective_until IS NULL OR >= start)`).
 *   3. Untuk tiap assignment, hitung amount sesuai formula komponen:
 *        - flat                : nominal × 1
 *        - per_attendance_day  : nominal × jumlah_hadir
 *        - per_alfa_day        : nominal × jumlah_alfa
 *   4. Buat PayrollItem (snapshot) dan akumulasi total earning - deduction = take home pay.
 *   5. Update/create Payroll record.
 *
 * Hanya regenerate kalau status_approval == 'draft'. Payroll yang sudah approved/paid
 * di-skip (tidak boleh ditimpa).
 */
class PayrollGenerator
{
    public function generateForPeriod(string $periode): array
    {
        // periode format Y-m-01
        $start = Carbon::parse($periode)->startOfMonth();
        $end = Carbon::parse($periode)->endOfMonth();
        $periodeDate = $start->toDateString();

        $teachers = Teacher::active()->get();

        $result = [
            'created'    => 0,
            'updated'    => 0,
            'locked'     => 0,
            'no_assign'  => 0,
        ];

        DB::transaction(function () use ($teachers, $start, $end, $periodeDate, &$result) {
            foreach ($teachers as $teacher) {
                $existing = Payroll::where('teacher_id', $teacher->id)
                    ->where('periode', $periodeDate)
                    ->first();

                // Jangan timpa payroll yang sudah approved/paid
                if ($existing && in_array($existing->status_approval, ['approved', 'paid'])) {
                    $result['locked']++;
                    continue;
                }

                // Hitung kehadiran dari attendances
                $attendance = Attendance::where('teacher_id', $teacher->id)
                    ->whereBetween('tanggal', [$start->toDateString(), $end->toDateString()])
                    ->selectRaw("
                        COUNT(CASE WHEN status = 'hadir' THEN 1 END) as hadir,
                        COUNT(CASE WHEN status = 'alfa' THEN 1 END) as alfa,
                        COUNT(CASE WHEN status = 'izin' THEN 1 END) as izin,
                        COUNT(CASE WHEN status = 'sakit' THEN 1 END) as sakit
                    ")
                    ->first();

                $hadir = (int) ($attendance->hadir ?? 0);
                $alfa  = (int) ($attendance->alfa ?? 0);
                $izin  = (int) ($attendance->izin ?? 0);
                $sakit = (int) ($attendance->sakit ?? 0);

                // Ambil assignment aktif (anchor: tanggal awal periode)
                $assignments = PayrollAssignment::with('component')
                    ->where('teacher_id', $teacher->id)
                    ->whereDate('effective_from', '<=', $start->toDateString())
                    ->where(function ($q) use ($start) {
                        $q->whereNull('effective_until')
                          ->orWhereDate('effective_until', '>=', $start->toDateString());
                    })
                    ->get();

                if ($assignments->isEmpty()) {
                    $result['no_assign']++;
                    // Tetap buat payroll record kosong supaya kelihatan di UI
                    // (HR perlu tahu kalau ada teacher tanpa komponen)
                }

                // Untuk fresh draft / regenerate → hapus item lama dulu
                if ($existing) {
                    $existing->items()->delete();
                    $payroll = $existing;
                } else {
                    $payroll = new Payroll();
                    $payroll->teacher_id = $teacher->id;
                    $payroll->periode = $periodeDate;
                    $payroll->status_approval = 'draft';
                }

                // Generate items + akumulasi summary columns (backward compat)
                $totalEarning = 0.0;
                $totalDeduction = 0.0;
                $sumGajiPokok = 0.0;
                $sumTunjangan = 0.0;
                $sumBonusKehadiran = 0.0;
                $sumPotonganAlfa = 0.0;
                $sumPotonganLain = 0.0;

                $items = [];
                foreach ($assignments as $assignment) {
                    $component = $assignment->component;
                    if (!$component) continue; // safety

                    [$unitCount, $amount] = $this->computeItemAmount(
                        $component->formula,
                        (float) $assignment->nominal,
                        $hadir,
                        $alfa
                    );

                    if ($amount == 0 && $unitCount == 0) {
                        // skip kalau hadir/alfa = 0 untuk per_*_day formula → invoice 0
                        // tetap log sbg item supaya terlihat di slip (transparansi)
                    }

                    $items[] = [
                        'payroll_component_id'  => $component->id,
                        'payroll_assignment_id' => $assignment->id,
                        'description'           => $component->name,
                        'kind'                  => $component->kind,
                        'formula'               => $component->formula,
                        'category'              => $component->category,
                        'unit_count'            => $unitCount,
                        'unit_nominal'          => (float) $assignment->nominal,
                        'amount'                => $amount,
                        'sk_number_snapshot'    => $assignment->sk_number,
                        'is_manual'             => false,
                        'notes'                 => null,
                    ];

                    if ($component->kind === PayrollComponent::KIND_EARNING) {
                        $totalEarning += $amount;
                    } else {
                        $totalDeduction += $amount;
                    }

                    // Update snapshot summary fields (backward-compat dgn UI lama)
                    if ($component->category === 'gaji_pokok') {
                        $sumGajiPokok += $amount;
                    } elseif ($component->category === 'tunjangan_tetap') {
                        $sumTunjangan += $amount;
                    } elseif ($component->category === 'bonus_kehadiran') {
                        $sumBonusKehadiran += $amount;
                    } elseif ($component->category === 'potongan_disiplin') {
                        $sumPotonganAlfa += $amount;
                    } elseif ($component->kind === PayrollComponent::KIND_DEDUCTION) {
                        $sumPotonganLain += $amount;
                    }
                }

                $payroll->jumlah_hadir = $hadir;
                $payroll->jumlah_alfa  = $alfa;
                $payroll->jumlah_izin  = $izin;
                $payroll->jumlah_sakit = $sakit;
                $payroll->gaji_pokok          = $sumGajiPokok;
                $payroll->tunjangan           = $sumTunjangan;
                $payroll->bonus_kehadiran     = $sumBonusKehadiran;
                $payroll->potongan_alfa       = $sumPotonganAlfa;
                $payroll->potongan_lain       = $sumPotonganLain;
                $payroll->total_take_home_pay = $totalEarning - $totalDeduction;
                $payroll->save();

                if ($existing) {
                    $result['updated']++;
                } else {
                    $result['created']++;
                }

                foreach ($items as $itemData) {
                    $itemData['payroll_id'] = $payroll->id;
                    PayrollItem::create($itemData);
                }
            }
        });

        return $result;
    }

    /**
     * Hitung [unitCount, amount] untuk sebuah item berdasarkan formula.
     */
    private function computeItemAmount(string $formula, float $nominal, int $hadir, int $alfa): array
    {
        switch ($formula) {
            case PayrollComponent::FORMULA_PER_ATTENDANCE_DAY:
                return [$hadir, $nominal * $hadir];
            case PayrollComponent::FORMULA_PER_ALFA_DAY:
                return [$alfa, $nominal * $alfa];
            case PayrollComponent::FORMULA_FLAT:
            default:
                return [1.0, $nominal];
        }
    }
}
