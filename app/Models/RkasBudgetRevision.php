<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RkasBudgetRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'rkas_budget_id',
        'field_changed',
        'old_value',
        'new_value',
        'reason',
        'changed_by',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(RkasBudget::class, 'rkas_budget_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
