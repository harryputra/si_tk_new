<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SchoolClassController extends Controller
{
    public function index(Request $request): Response
    {
        $academicYears = \App\Models\AcademicYear::orderBy('name', 'desc')->get();
        $activeYear = $academicYears->firstWhere('is_active', true);
        
        $filterYear = $request->input('academic_year_id', $activeYear ? $activeYear->id : null);

        $classes = SchoolClass::with(['teacher', 'academicYear'])
            ->when($filterYear, function($query, $filterYear) {
                return $query->where('academic_year_id', $filterYear);
            })
            ->withCount('students')
            ->orderBy('level')
            ->orderBy('name')
            ->get();
            
        $teachers = Teacher::where('status', 'aktif')->get();

        return Inertia::render('MasterData/SchoolClasses/Index', [
            'classes' => $classes,
            'teachers' => $teachers,
            'academicYears' => $academicYears,
            'filters' => [
                'academic_year_id' => $filterYear,
            ]
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|string|max:50',
            'capacity' => 'required|integer|min:1',
            'teacher_id' => 'nullable|exists:teachers,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ]);

        // Check uniqueness for name + academic_year combination
        $exists = SchoolClass::where('name', $validated['name'])
            ->where('academic_year_id', $validated['academic_year_id'])
            ->exists();
            
        if ($exists) {
            return back()->withErrors(['name' => 'Nama rombel sudah ada pada tahun ajaran ini.']);
        }

        SchoolClass::create($validated);

        return redirect()->back()
            ->with('success', 'Rombel berhasil ditambahkan.');
    }

    public function update(Request $request, SchoolClass $kela): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'level' => 'required|string|max:50',
            'capacity' => 'required|integer|min:1',
            'teacher_id' => 'nullable|exists:teachers,id',
            'academic_year_id' => 'required|exists:academic_years,id',
        ]);

        $exists = SchoolClass::where('name', $validated['name'])
            ->where('academic_year_id', $validated['academic_year_id'])
            ->where('id', '!=', $kela->id)
            ->exists();
            
        if ($exists) {
            return back()->withErrors(['name' => 'Nama rombel sudah ada pada tahun ajaran ini.']);
        }

        $kela->update($validated);

        return redirect()->back()
            ->with('success', 'Rombel berhasil diperbarui.');
    }

    public function destroy(SchoolClass $kela): RedirectResponse
    {
        $kela->delete();

        return redirect()->back()
            ->with('success', 'Rombel berhasil dihapus.');
    }

    public function clone(Request $request): RedirectResponse
    {
        $request->validate([
            'source_year_id' => 'required|exists:academic_years,id',
            'target_year_id' => 'required|exists:academic_years,id|different:source_year_id',
        ]);

        $sourceClasses = SchoolClass::where('academic_year_id', $request->source_year_id)->get();
        
        if ($sourceClasses->isEmpty()) {
            return back()->with('error', 'Tidak ada rombel di tahun ajaran sumber.');
        }

        $clonedCount = 0;
        foreach ($sourceClasses as $sourceClass) {
            // Check if already exists
            $exists = SchoolClass::where('name', $sourceClass->name)
                ->where('academic_year_id', $request->target_year_id)
                ->exists();

            if (!$exists) {
                SchoolClass::create([
                    'name' => $sourceClass->name,
                    'level' => $sourceClass->level,
                    'capacity' => $sourceClass->capacity,
                    'teacher_id' => $sourceClass->teacher_id, // keep the same teacher or null it? Let's keep it.
                    'academic_year_id' => $request->target_year_id,
                ]);
                $clonedCount++;
            }
        }

        return redirect()->back()
            ->with('success', "Berhasil menyalin {$clonedCount} rombel ke tahun ajaran baru.");
    }
}
