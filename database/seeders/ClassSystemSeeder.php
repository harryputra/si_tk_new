<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Database\Seeder;

class ClassSystemSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Academic Years exist
        if (AcademicYear::count() === 0) {
            $this->call(AcademicYearSeeder::class);
        }

        // 2. Ensure School Classes exist
        if (SchoolClass::count() === 0) {
            $this->call(SchoolClassSeeder::class);
        }

        $activeYear = AcademicYear::where('is_active', true)->first();
        if (!$activeYear) {
            $activeYear = AcademicYear::first();
            if ($activeYear) {
                $activeYear->update(['is_active' => true]);
            }
        }
        
        $classes = SchoolClass::all();

        if ($classes->isEmpty()) {
            return;
        }

        // 3. Assign students to classes and create enrollments
        $students = Student::all();
        
        foreach ($students as $student) {
            // Skip if already assigned (optional, but good for idempotency)
            // For dummy data, we'll force assign if not already assigned or just re-assign
            
            $class = $classes->random();
            
            $student->update([
                'current_class_id' => $class->id
            ]);

            // Create enrollment record for the active year
            StudentEnrollment::updateOrCreate([
                'student_id' => $student->id,
                'academic_year_id' => $activeYear->id,
            ], [
                'school_class_id' => $class->id,
                'status' => 'active'
            ]);
        }
    }
}
