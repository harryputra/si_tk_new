<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlottingQueue extends Model
{
    protected $fillable = ['student_id', 'academic_year_id', 'target_level', 'status'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
