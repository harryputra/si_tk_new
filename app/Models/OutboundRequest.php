<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OutboundRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rkas_id',
        'account_id',
        'judul_pengajuan',
        'deskripsi',
        'nominal',
        'jenis_pengajuan',
        'status_approval',
        'catatan_reviewer',
        'approved_by',
        'approved_at',
        'disbursed_by',
        'disbursed_at',
        'dibuat_oleh',
    ];

    protected function casts(): array
    {
        return [
            'nominal'       => 'decimal:2',
            'approved_at'   => 'datetime',
            'disbursed_at'  => 'datetime',
        ];
    }

    public function rkasBudget(): BelongsTo
    {
        return $this->belongsTo(RkasBudget::class, 'rkas_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function disbursedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disbursed_by');
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function createdBy(): BelongsTo
    {
        return $this->dibuatOleh();
    }
}
