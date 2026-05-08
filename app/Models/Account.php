<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_rekening',
        'bank',
        'nomor_rekening',
        'saldo',
        'jenis',
    ];

    protected function casts(): array
    {
        return [
            'saldo' => 'decimal:2',
        ];
    }

    public function inboundPayments(): HasMany
    {
        return $this->hasMany(InboundPayment::class);
    }

    public function outboundRequests(): HasMany
    {
        return $this->hasMany(OutboundRequest::class);
    }
}
