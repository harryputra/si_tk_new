<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'is_active'];

    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function tariffs()
    {
        return $this->hasMany(Tariff::class);
    }
}
