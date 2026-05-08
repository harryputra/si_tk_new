<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nip',
        'nama_lengkap',
        'jabatan',
        'no_hp',
        'gaji_pokok',
        'bonus_hadir',
        'denda_alfa',
        'tunjangan_tetap',
        'nama_bank',
        'nomor_rekening_bank',
        'status',
        'photo',
    ];

    protected function casts(): array
    {
        return [
            'gaji_pokok'     => 'decimal:2',
            'bonus_hadir'    => 'decimal:2',
            'denda_alfa'     => 'decimal:2',
            'tunjangan_tetap' => 'decimal:2',
        ];
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }

    public function payrollAssignments(): HasMany
    {
        return $this->hasMany(PayrollAssignment::class);
    }

    /**
     * Scope a query to only include active teachers.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }
}
