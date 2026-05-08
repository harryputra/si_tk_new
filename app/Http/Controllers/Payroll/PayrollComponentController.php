<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\PayrollComponent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayrollComponentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PayrollComponent::query()->withCount('assignments');

        if ($request->filled('kind')) {
            $query->where('kind', $request->kind);
        }
        if ($request->filled('frequency')) {
            $query->where('frequency', $request->frequency);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'ilike', "%{$search}%");
        }
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $components = $query->orderBy('kind')->orderBy('name')->get();

        return Inertia::render('Payroll/Components/Index', [
            'components' => $components,
            'filters'    => $request->only(['kind', 'frequency', 'search', 'is_active']),
            'enums'      => [
                'kind'      => PayrollComponent::KIND_LABELS,
                'frequency' => PayrollComponent::FREQUENCY_LABELS,
                'formula'   => PayrollComponent::FORMULA_LABELS,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateComponent($request);
        PayrollComponent::create($validated);
        return redirect()->route('komponen-gaji.index')->with('success', 'Komponen gaji ditambahkan.');
    }

    public function update(Request $request, PayrollComponent $komponen_gaji): RedirectResponse
    {
        $validated = $this->validateComponent($request);
        $komponen_gaji->update($validated);
        return redirect()->route('komponen-gaji.index')->with('success', 'Komponen gaji diperbarui.');
    }

    public function destroy(PayrollComponent $komponen_gaji): RedirectResponse
    {
        // Soft archive — kalau sudah pernah dipakai, jangan hapus, tapi non-aktifkan
        if ($komponen_gaji->assignments()->exists()) {
            $komponen_gaji->update(['is_active' => false]);
            return redirect()->route('komponen-gaji.index')
                ->with('success', 'Komponen sudah pernah dipakai — diarsipkan (non-aktif), bukan dihapus.');
        }

        $komponen_gaji->delete();
        return redirect()->route('komponen-gaji.index')->with('success', 'Komponen gaji dihapus.');
    }

    private function validateComponent(Request $request): array
    {
        return $request->validate([
            'name'            => 'required|string|max:255',
            'kind'            => 'required|in:earning,deduction',
            'frequency'       => 'required|in:recurring,temporary',
            'formula'         => 'required|in:flat,per_attendance_day,per_alfa_day',
            'category'        => 'nullable|string|max:100',
            'default_nominal' => 'nullable|numeric|min:0',
            'description'     => 'nullable|string|max:1000',
            'is_active'       => 'nullable|boolean',
        ]);
    }
}
