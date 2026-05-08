<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payroll extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'teacher_id',
        'periode',
        'jumlah_hadir',
        'jumlah_alfa',
        'jumlah_izin',
        'jumlah_sakit',
        'gaji_pokok',
        'tunjangan',
        'bonus_kehadiran',
        'potongan_alfa',
        'potongan_lain',
        'total_take_home_pay',
        'catatan',
        'status_approval',
        'approved_by',
        'approved_at',
        'paid_by',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'periode'             => 'date',
            'gaji_pokok'          => 'decimal:2',
            'tunjangan'           => 'decimal:2',
            'bonus_kehadiran'     => 'decimal:2',
            'potongan_alfa'       => 'decimal:2',
            'potongan_lain'       => 'decimal:2',
            'total_take_home_pay' => 'decimal:2',
            'approved_at'         => 'datetime',
            'paid_at'             => 'datetime',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(PayrollAdjustment::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(PayrollItem::class)->where('kind', 'earning');
    }

    public function deductions(): HasMany
    {
        return $this->hasMany(PayrollItem::class)->where('kind', 'deduction');
    }
}
