<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Tariff;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;

class InvoiceGenerator
{
    public function issueForTariff(Tariff $tariff, ?string $periode = null): array
    {
        $resolvedPeriode = $this->resolvePeriode($periode);
        $students = $this->resolveTargetStudents($tariff);

        $created = 0;
        $skipped = 0;

        DB::transaction(function () use ($tariff, $students, $resolvedPeriode, &$created, &$skipped) {
            foreach ($students as $student) {
                $exists = Invoice::where('student_id', $student->id)
                    ->where('tariff_id', $tariff->id)
                    ->where('periode', $resolvedPeriode)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                Invoice::create([
                    'student_id'       => $student->id,
                    'tariff_id'        => $tariff->id,
                    'academic_year_id' => $tariff->academic_year_id,
                    'billing_cycle'    => $tariff->billing_cycle,
                    'periode'          => $resolvedPeriode,
                    // SNAPSHOT: nominal dibekukan pada saat penerbitan.
                    // Perubahan tariff.nominal di masa depan TIDAK mempengaruhi invoice ini.
                    'nominal_tagihan'  => $tariff->nominal,
                    'nominal_terbayar' => 0,
                    'status'           => 'unpaid',
                    'jatuh_tempo'      => $this->resolveDueDate($resolvedPeriode),
                ]);
                $created++;
            }
        });

        return [
            'created'  => $created,
            'skipped'  => $skipped,
            'targeted' => $students->count(),
            'periode'  => $resolvedPeriode,
        ];
    }

    protected function resolvePeriode(?string $periode): string
    {
        $base = $periode ? Carbon::parse($periode) : now();
        return $base->copy()->startOfMonth()->format('Y-m-d');
    }

    protected function resolveDueDate(string $periode): string
    {
        return Carbon::parse($periode)->endOfMonth()->format('Y-m-d');
    }

    protected function resolveTargetStudents(Tariff $tariff): EloquentCollection
    {
        $query = Student::query()->where('status', 'aktif');

        switch ($tariff->applicability) {
            case 'class':
                if (!$tariff->applicable_id) {
                    return new EloquentCollection();
                }
                $query->where('current_class_id', $tariff->applicable_id);
                break;
            case 'level':
                // Inject ke seluruh siswa yang current_class-nya berada di tingkat tsb
                // (mendukung rombel jamak per tingkat: 1A, 1B, 1C, dst).
                if (!$tariff->applicable_level) {
                    return new EloquentCollection();
                }
                $classIds = SchoolClass::where('level', $tariff->applicable_level)->pluck('id');
                if ($classIds->isEmpty()) {
                    return new EloquentCollection();
                }
                $query->whereIn('current_class_id', $classIds);
                break;
            case 'student':
                if (!$tariff->applicable_id) {
                    return new EloquentCollection();
                }
                $query->where('id', $tariff->applicable_id);
                break;
            case 'all':
            default:
                break;
        }

        if ($tariff->jenis_siswa && $tariff->jenis_siswa !== 'all') {
            $query->where('jenis_siswa', $tariff->jenis_siswa);
        }

        return $query->get();
    }
}
