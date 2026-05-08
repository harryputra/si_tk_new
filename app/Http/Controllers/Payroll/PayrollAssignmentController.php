<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\PayrollAssignment;
use App\Models\PayrollComponent;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PayrollAssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PayrollAssignment::query()
            ->with(['teacher:id,nip,nama_lengkap,jabatan,status', 'component']);

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }
        if ($request->filled('component_id')) {
            $query->where('payroll_component_id', $request->component_id);
        }
        if ($request->filled('status')) {
            $today = now()->toDateString();
            if ($request->status === 'active') {
                $query->whereDate('effective_from', '<=', $today)
                      ->where(function ($q) use ($today) {
                          $q->whereNull('effective_until')->orWhereDate('effective_until', '>=', $today);
                      });
            } elseif ($request->status === 'expired') {
                $query->whereNotNull('effective_until')->whereDate('effective_until', '<', $today);
            } elseif ($request->status === 'future') {
                $query->whereDate('effective_from', '>', $today);
            }
        }

        $assignments = $query->latest('id')->paginate(25)->withQueryString();

        return Inertia::render('Payroll/Assignments/Index', [
            'assignments' => $assignments,
            'teachers'    => Teacher::active()->orderBy('nama_lengkap')->get(['id', 'nip', 'nama_lengkap', 'jabatan']),
            'components'  => PayrollComponent::where('is_active', true)->orderBy('kind')->orderBy('name')->get(),
            'filters'     => $request->only(['teacher_id', 'component_id', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateAssignment($request);
        $validated['sk_file'] = $this->handleSkUpload($request);
        $validated['created_by'] = Auth::id();

        PayrollAssignment::create($validated);

        return redirect()->route('penugasan-gaji.index')
            ->with('success', 'Penugasan komponen gaji ditambahkan.');
    }

    public function update(Request $request, PayrollAssignment $penugasan_gaji): RedirectResponse
    {
        $validated = $this->validateAssignment($request);

        $newSkFile = $this->handleSkUpload($request);
        if ($newSkFile !== null) {
            // Hapus file lama kalau ada & sukses upload yang baru
            if ($penugasan_gaji->sk_file) {
                Storage::disk('public')->delete($penugasan_gaji->sk_file);
            }
            $validated['sk_file'] = $newSkFile;
        } else {
            // tidak ada file baru → biarkan kolom sk_file existing (jangan ditimpa null)
            unset($validated['sk_file']);
        }

        $penugasan_gaji->update($validated);

        return redirect()->route('penugasan-gaji.index')
            ->with('success', 'Penugasan komponen gaji diperbarui.');
    }

    /**
     * Akhiri penugasan lebih awal (set effective_until = hari ini).
     * Tidak menghapus row — tetap sebagai audit history.
     */
    public function endNow(PayrollAssignment $penugasan_gaji): RedirectResponse
    {
        $penugasan_gaji->update([
            'effective_until' => now()->toDateString(),
        ]);
        return redirect()->route('penugasan-gaji.index')
            ->with('success', 'Penugasan diakhiri per hari ini.');
    }

    public function destroy(PayrollAssignment $penugasan_gaji): RedirectResponse
    {
        // Hapus file SK kalau ada
        if ($penugasan_gaji->sk_file) {
            Storage::disk('public')->delete($penugasan_gaji->sk_file);
        }
        $penugasan_gaji->delete();
        return redirect()->route('penugasan-gaji.index')->with('success', 'Penugasan dihapus.');
    }

    private function validateAssignment(Request $request): array
    {
        return $request->validate([
            'teacher_id'           => 'required|exists:teachers,id',
            'payroll_component_id' => 'required|exists:payroll_components,id',
            'nominal'              => 'required|numeric|min:0',
            'effective_from'       => 'required|date',
            'effective_until'      => 'nullable|date|after_or_equal:effective_from',
            'sk_number'            => 'nullable|string|max:100',
            'sk_file'              => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB
            'notes'                => 'nullable|string|max:1000',
        ]);
    }

    private function handleSkUpload(Request $request): ?string
    {
        if (!$request->hasFile('sk_file')) {
            return null;
        }
        $file = $request->file('sk_file');
        $teacherId = $request->teacher_id;
        $name = time() . '_t' . $teacherId . '_' . $file->getClientOriginalName();
        return $file->storeAs('payroll/sk', $name, 'public');
    }
}
