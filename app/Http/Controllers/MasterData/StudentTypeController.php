<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\StudentType;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StudentTypeController extends Controller
{
    public function index(): Response
    {
        $types = StudentType::latest()->get();

        return Inertia::render('MasterData/StudentTypes/Index', [
            'types' => $types,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:student_types',
            'description' => 'nullable|string',
        ]);

        StudentType::create($validated);

        return redirect()->route('jenis-siswa.index')
            ->with('success', 'Jenis siswa berhasil ditambahkan.');
    }

    public function update(Request $request, StudentType $jenisSiswa): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:student_types,code,' . $jenisSiswa->id,
            'description' => 'nullable|string',
        ]);

        $jenisSiswa->update($validated);

        return redirect()->route('jenis-siswa.index')
            ->with('success', 'Jenis siswa berhasil diperbarui.');
    }

    public function destroy(StudentType $jenisSiswa): RedirectResponse
    {
        $jenisSiswa->delete();

        return redirect()->route('jenis-siswa.index')
            ->with('success', 'Jenis siswa berhasil dihapus.');
    }
}
