<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_id',
        'payroll_component_id',
        'payroll_assignment_id',
        'description',
        'kind',
        'formula',
        'category',
        'unit_count',
        'unit_nominal',
        'amount',
        'sk_number_snapshot',
        'is_manual',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'unit_count'   => 'decimal:2',
            'unit_nominal' => 'decimal:2',
            'amount'       => 'decimal:2',
            'is_manual'    => 'boolean',
        ];
    }

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(PayrollComponent::class, 'payroll_component_id');
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(PayrollAssignment::class, 'payroll_assignment_id');
    }
}
