<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tariff extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_tarif',
        'jenis_tarif',
        'jenis_siswa',
        'nominal',
        'tahun_berlaku',
        'billing_cycle',
        'applicability',
        'academic_year_id',
        'applicable_id',
        'applicable_level',
        'rkas_account_id',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function rkasAccount()
    {
        return $this->belongsTo(RkasAccount::class);
    }

    protected function casts(): array
    {
        return [
            'nominal'       => 'decimal:2',
            'tahun_berlaku' => 'integer',
        ];
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
