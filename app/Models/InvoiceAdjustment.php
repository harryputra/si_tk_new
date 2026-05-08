<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'student_id',
        'inbound_payment_id',
        'jenis_kebijakan',
        'nominal_asli',
        'nominal_adjustment',
        'keterangan',
        'batch_id',
        'admin_id',
    ];

    protected function casts(): array
    {
        return [
            'nominal_asli' => 'decimal:2',
            'nominal_adjustment' => 'decimal:2',
        ];
    }

    /**
     * Label-label jenis kebijakan yang tersedia.
     */
    public const JENIS_LABELS = [
        'subsidi_yayasan' => 'Subsidi Yayasan',
        'pemutihan' => 'Pemutihan',
        'diskon_kelulusan' => 'Diskon Kelulusan',
    ];

    public function getJenisLabelAttribute(): string
    {
        return self::JENIS_LABELS[$this->jenis_kebijakan] ?? $this->jenis_kebijakan;
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function inboundPayment(): BelongsTo
    {
        return $this->belongsTo(InboundPayment::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
