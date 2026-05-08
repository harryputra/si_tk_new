<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    public function index(): Response
    {
        $academicYears = AcademicYear::latest()->get();

        return Inertia::render('MasterData/AcademicYears/Index', [
            'academic_years' => $academicYears,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years',
            'is_active' => 'boolean',
        ]);

        if ($validated['is_active'] ?? false) {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
        }

        AcademicYear::create($validated);

        return redirect()->route('tahun-ajaran.index')
            ->with('success', 'Tahun ajaran berhasil ditambahkan.');
    }

    public function update(Request $request, AcademicYear $tahunAjaran): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name,' . $tahunAjaran->id,
            'is_active' => 'boolean',
        ]);

        if (($validated['is_active'] ?? false) && !$tahunAjaran->is_active) {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
        }

        $tahunAjaran->update($validated);

        return redirect()->route('tahun-ajaran.index')
            ->with('success', 'Tahun ajaran berhasil diperbarui.');
    }

    public function destroy(AcademicYear $tahunAjaran): RedirectResponse
    {
        $tahunAjaran->delete();

        return redirect()->route('tahun-ajaran.index')
            ->with('success', 'Tahun ajaran berhasil dihapus.');
    }
}
