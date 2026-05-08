<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'tariff_id',
        'academic_year_id',
        'billing_cycle',
        'periode',
        'nominal_tagihan',
        'nominal_terbayar',
        'status',
        'jatuh_tempo',
    ];

    protected function casts(): array
    {
        return [
            'periode'          => 'date',
            'jatuh_tempo'      => 'date',
            'nominal_tagihan'  => 'decimal:2',
            'nominal_terbayar' => 'decimal:2',
        ];
    }

    public function getSisaHutangAttribute(): string
    {
        return bcsub((string) $this->nominal_tagihan, (string) $this->nominal_terbayar, 2);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function tariff(): BelongsTo
    {
        return $this->belongsTo(Tariff::class);
    }

    public function inboundPayments(): HasMany
    {
        return $this->hasMany(InboundPayment::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function waivers(): HasMany
    {
        return $this->hasMany(InvoiceWaiver::class);
    }
}
