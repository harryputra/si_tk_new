<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Services\PromotionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(Request $request, PromotionService $service): Response
    {
        $sourceClassId = $request->integer('from_class_id') ?: null;

        $students = collect();
        if ($sourceClassId) {
            $students = $service->clearanceReportFor($sourceClassId);
        }

        // Just need to get unique levels from classes to define target_level
        $levels = SchoolClass::select('level')->distinct()->pluck('level');

        return Inertia::render('Promotion/Index', [
            'classes'        => SchoolClass::withCount('students')->orderBy('level')->orderBy('name')->get(['id', 'name', 'level', 'capacity']),
            'levels'         => $levels,
            'academic_years' => AcademicYear::orderByDesc('id')->get(['id', 'name', 'is_active']),
            'filters'        => $request->only(['from_class_id', 'target_level', 'target_academic_year_id']),
            'students'       => $students,
        ]);
    }

    public function execute(Request $request, PromotionService $service): RedirectResponse
    {
        $validated = $request->validate([
            'target_level'            => 'required|string',
            'target_academic_year_id' => 'required|exists:academic_years,id',
            'promotions'              => 'required|array|min:1',
            'promotions.*.student_id' => 'required|exists:students,id',
            'promotions.*.action'     => 'required|in:promote,retain',
        ]);

        $result = $service->executePromotionToQueue(
            promotions:           $validated['promotions'],
            targetLevel:          $validated['target_level'],
            targetAcademicYearId: (int) $validated['target_academic_year_id'],
        );

        $msg = sprintf(
            'Registrasi Ulang selesai — %d masuk antrean pemetaan (naik), %d tinggal kelas, %d dilewati.',
            $result['promoted_to_queue'],
            $result['retained'],
            $result['skipped'],
        );

        return redirect()->route('kenaikan-kelas.index')->with('success', $msg);
    }
}
