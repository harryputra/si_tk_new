<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RkasAccount extends Model
{
    use HasFactory;

    public const KIND_PENDAPATAN = 'pendapatan';
    public const KIND_PENGELUARAN = 'pengeluaran';

    protected $fillable = [
        'kode',
        'name',
        'kind',
        'parent_id',
        'level',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'level'     => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(RkasAccount::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(RkasAccount::class, 'parent_id');
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(RkasBudget::class);
    }

    /**
     * Recursively build full path display: "5.1 Belanja Pegawai > 5.1.1 Gaji Guru"
     */
    public function getPathAttribute(): string
    {
        $parts = [$this->kode . ' ' . $this->name];
        $current = $this->parent;
        while ($current) {
            array_unshift($parts, $current->kode . ' ' . $current->name);
            $current = $current->parent;
        }
        return implode(' › ', $parts);
    }
}
