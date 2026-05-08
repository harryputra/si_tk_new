<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'payroll_component_id',
        'nominal',
        'effective_from',
        'effective_until',
        'sk_number',
        'sk_file',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'nominal'         => 'decimal:2',
            'effective_from'  => 'date',
            'effective_until' => 'date',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(PayrollComponent::class, 'payroll_component_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope: assignment yang AKTIF di tanggal tertentu (default: hari ini).
     * Aktif kalau effective_from <= date AND (effective_until IS NULL OR effective_until >= date).
     */
    public function scopeActiveOn(Builder $query, ?Carbon $date = null): Builder
    {
        $date = $date ?? Carbon::today();
        return $query
            ->whereDate('effective_from', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('effective_until')
                  ->orWhereDate('effective_until', '>=', $date);
            });
    }

    public function getIsActiveAttribute(): bool
    {
        $today = Carbon::today();
        if ($this->effective_from && $this->effective_from->gt($today)) return false;
        if ($this->effective_until && $this->effective_until->lt($today)) return false;
        return true;
    }
}
