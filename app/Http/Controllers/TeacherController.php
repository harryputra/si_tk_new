<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Teacher::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('nama_lengkap', 'ilike', "%{$search}%")
                  ->orWhere('nip', 'ilike', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $teachers = $query->withTrashed()->latest()->paginate(10)->withQueryString();

        return Inertia::render('MasterData/Teachers/Index', [
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nip' => 'required|string|unique:teachers,nip',
            'nama_lengkap' => 'required|string|max:255',
            'jabatan' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'gaji_pokok' => 'required|numeric|min:0',
            'bonus_hadir' => 'required|numeric|min:0',
            'denda_alfa' => 'required|numeric|min:0',
            'tunjangan_tetap' => 'required|numeric|min:0',
            'nama_bank' => 'nullable|string|max:100',
            'nomor_rekening_bank' => 'nullable|string|max:50',
            'status' => 'required|in:aktif,nonaktif',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = time() . '_' . $validated['nip'] . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('teachers/photos', $filename, 'public');
            $validated['photo'] = $path;
        }

        Teacher::create($validated);

        return redirect()->route('guru.index')
            ->with('success', 'Data guru berhasil ditambahkan.');
    }

    public function show(Teacher $guru): Response
    {
        $guru->load(['attendances', 'payrolls']);
        return Inertia::render('MasterData/Teachers/Show', [
            'teacher' => $guru
        ]);
    }

    public function update(Request $request, Teacher $guru): RedirectResponse
    {
        $validated = $request->validate([
            'nip' => 'required|string|unique:teachers,nip,' . $guru->id,
            'nama_lengkap' => 'required|string|max:255',
            'jabatan' => 'required|string|max:100',
            'no_hp' => 'nullable|string|max:20',
            'gaji_pokok' => 'required|numeric|min:0',
            'bonus_hadir' => 'required|numeric|min:0',
            'denda_alfa' => 'required|numeric|min:0',
            'tunjangan_tetap' => 'required|numeric|min:0',
            'nama_bank' => 'nullable|string|max:100',
            'nomor_rekening_bank' => 'nullable|string|max:50',
            'status' => 'required|in:aktif,nonaktif',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($guru->photo) {
                Storage::disk('public')->delete($guru->photo);
            }
            $file = $request->file('photo');
            $filename = time() . '_' . $validated['nip'] . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('teachers/photos', $filename, 'public');
            $validated['photo'] = $path;
        }

        $guru->update($validated);

        return redirect()->route('guru.index')
            ->with('success', 'Data guru berhasil diperbarui.');
    }

    public function destroy(Teacher $guru): RedirectResponse
    {
        $guru->delete();

        return redirect()->route('guru.index')
            ->with('success', 'Data guru berhasil dihapus.');
    }

    public function restore($id): RedirectResponse
    {
        $teacher = Teacher::withTrashed()->findOrFail($id);
        $teacher->restore();

        return redirect()->route('guru.index')
            ->with('success', 'Data guru berhasil dipulihkan.');
    }

    public function forceDelete($id): RedirectResponse
    {
        $teacher = Teacher::withTrashed()->findOrFail($id);
        $teacher->forceDelete();

        return redirect()->route('guru.index')
            ->with('success', 'Data guru berhasil dihapus permanen.');
    }

    public function apiIndex(): JsonResponse
    {
        $teachers = Teacher::where('status', 'aktif')->get(['id', 'nip', 'nama_lengkap']);
        return response()->json($teachers);
    }
}
