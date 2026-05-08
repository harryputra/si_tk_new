<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentMutation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'school_class_id',
        'tanggal_keluar',
        'alasan',
        'sisa_tagihan_akhir',
        'status_penyelesaian',
        'admin_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_keluar' => 'date',
            'sisa_tagihan_akhir' => 'decimal:2',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
