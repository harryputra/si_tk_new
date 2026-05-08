<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RkasBudget extends Model
{
    use HasFactory;

    public const KIND_PENDAPATAN = 'pendapatan';
    public const KIND_PENGELUARAN = 'pengeluaran';

    public const STATUS_DRAFT = 'draft';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'kind',
        'status',
        'rkas_account_id',
        'kode_rkas',
        'uraian',
        'kategori_utama',
        'sub_kategori',
        'pagu_anggaran',
        'terpakai',
        'tahun_anggaran',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'pagu_anggaran'  => 'decimal:2',
            'terpakai'       => 'decimal:2',
            'tahun_anggaran' => 'integer',
            'approved_at'    => 'datetime',
        ];
    }

    public function getSisaPaguAttribute(): string
    {
        return bcsub((string) $this->pagu_anggaran, (string) $this->terpakai, 2);
    }

    public function outboundRequests(): HasMany
    {
        return $this->hasMany(OutboundRequest::class, 'rkas_id');
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(RkasBudgetRevision::class)->latest();
    }

    /**
     * Recalculate `terpakai` dari sum nominal OutboundRequest yang sudah disbursed.
     * Dipakai untuk repair (kalau data drift) atau verifikasi.
     */
    public function recomputeTerpakai(): float
    {
        $sum = (float) $this->outboundRequests()
            ->where('status_approval', 'disbursed')
            ->sum('nominal');
        $this->terpakai = (string) $sum;
        $this->save();
        return $sum;
    }

    public function rkasAccount(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RkasAccount::class);
    }

    public function approvedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Untuk pengeluaran: realisasi = uang yang sudah keluar (terpakai).
     * Untuk pendapatan: realisasi = uang masuk yang ter-attribute ke pos ini
     *                  (di C2 disimpan di kolom `terpakai` juga, semantic dual).
     */
    public function getRealisasiAttribute(): float
    {
        return (float) $this->terpakai;
    }

    public function getPersentaseRealisasiAttribute(): float
    {
        $pagu = (float) $this->pagu_anggaran;
        if ($pagu <= 0) return 0;
        return round(((float) $this->terpakai / $pagu) * 100, 1);
    }
}
