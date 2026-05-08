<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicYear;
use App\Models\PlottingQueue;
use App\Models\SchoolClass;
use App\Services\PromotionService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PlottingController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        $targetYearId = $request->integer('academic_year_id') ?: ($activeYear?->id);

        $queues = PlottingQueue::with('student.currentClass')
            ->where('academic_year_id', $targetYearId)
            ->where('status', 'unmapped')
            ->when($request->string('target_level'), fn($q, $v) => $q->where('target_level', $v))
            ->get();

        $classes = SchoolClass::withCount('students')
            ->where('academic_year_id', $targetYearId)
            ->orderBy('level')
            ->orderBy('name')
            ->get(['id', 'name', 'level', 'capacity']);

        $levels = SchoolClass::select('level')->distinct()->pluck('level');

        return Inertia::render('Plotting/Index', [
            'queues'         => $queues,
            'classes'        => $classes,
            'levels'         => $levels,
            'academic_years' => AcademicYear::orderByDesc('id')->get(['id', 'name', 'is_active']),
            'filters'        => $request->only(['academic_year_id', 'target_level']),
        ]);
    }

    public function execute(Request $request, PromotionService $service): RedirectResponse
    {
        $validated = $request->validate([
            'target_class_id'         => 'required|exists:school_classes,id',
            'target_academic_year_id' => 'required|exists:academic_years,id',
            'queue_ids'               => 'required|array|min:1',
            'queue_ids.*'             => 'required|exists:plotting_queues,id',
            'auto_issue_invoices'     => 'nullable|boolean',
            'invoice_periode'         => 'nullable|date',
        ]);

        $targetClass = SchoolClass::withCount('students')->findOrFail($validated['target_class_id']);
        $remaining = $targetClass->capacity - $targetClass->students_count;

        if (count($validated['queue_ids']) > $remaining) {
            return back()->withErrors(['target_class_id' => "Kapasitas tidak mencukupi. Sisa kursi: {$remaining}, terpilih: " . count($validated['queue_ids'])]);
        }

        $result = $service->executeMapping(
            queueIds:             $validated['queue_ids'],
            targetClassId:        (int) $validated['target_class_id'],
            targetAcademicYearId: (int) $validated['target_academic_year_id'],
            autoIssueInvoices:    (bool) ($validated['auto_issue_invoices'] ?? true),
            invoicePeriode:       $validated['invoice_periode'] ? "{$validated['invoice_periode']}-01" : null,
        );

        return redirect()->route('plotting.index')->with('success', "Pemetaan selesai. {$result['mapped']} siswa berhasil ditempatkan. Invoice: {$result['invoices_created']}.");
    }
}
