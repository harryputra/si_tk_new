<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'registration_number',
        'nis',
        'nama_lengkap',
        'nama_panggilan',
        'tahun_angkatan',
        'jenis_siswa',
        'nama_wali',
        'no_hp_wali',
        'status',
        'current_class_id',
        'photo',
    ];

    protected function casts(): array
    {
        return [
            'tahun_angkatan' => 'integer',
        ];
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function inboundPayments(): HasMany
    {
        return $this->hasMany(InboundPayment::class);
    }

    public function currentClass()
    {
        return $this->belongsTo(SchoolClass::class, 'current_class_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    /**
     * Scope a query to only include active students.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }
}
