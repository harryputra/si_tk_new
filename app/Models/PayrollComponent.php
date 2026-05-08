<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollComponent extends Model
{
    use HasFactory;

    public const KIND_EARNING = 'earning';
    public const KIND_DEDUCTION = 'deduction';

    public const FREQ_RECURRING = 'recurring';
    public const FREQ_TEMPORARY = 'temporary';

    public const FORMULA_FLAT = 'flat';
    public const FORMULA_PER_ATTENDANCE_DAY = 'per_attendance_day';
    public const FORMULA_PER_ALFA_DAY = 'per_alfa_day';

    public const KIND_LABELS = [
        self::KIND_EARNING   => 'Pendapatan',
        self::KIND_DEDUCTION => 'Potongan',
    ];

    public const FREQUENCY_LABELS = [
        self::FREQ_RECURRING => 'Rutin Bulanan',
        self::FREQ_TEMPORARY => 'Sekali / Sementara',
    ];

    public const FORMULA_LABELS = [
        self::FORMULA_FLAT               => 'Flat (Nominal × 1)',
        self::FORMULA_PER_ATTENDANCE_DAY => 'Per Hari Hadir',
        self::FORMULA_PER_ALFA_DAY       => 'Per Hari Alfa',
    ];

    protected $fillable = [
        'name',
        'kind',
        'frequency',
        'formula',
        'category',
        'default_nominal',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'default_nominal' => 'decimal:2',
            'is_active'       => 'boolean',
        ];
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(PayrollAssignment::class);
    }
}
