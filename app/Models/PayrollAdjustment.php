<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollAdjustment extends Model
{
    use HasFactory;

    public const ACTION_ADDED = 'added';
    public const ACTION_EDITED = 'edited';
    public const ACTION_REMOVED = 'removed';

    protected $fillable = [
        'payroll_id',
        'payroll_item_id',
        'action',
        'field_changed',
        'old_value',
        'new_value',
        'reason',
        'changed_by',
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(PayrollItem::class, 'payroll_item_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
