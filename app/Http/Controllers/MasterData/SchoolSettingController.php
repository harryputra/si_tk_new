<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\SchoolSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolSettingController extends Controller
{
    public function index(): Response
    {
        $setting = SchoolSetting::first();
        return Inertia::render('MasterData/SchoolSetting/Index', [
            'setting' => $setting,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $setting = SchoolSetting::first();

        $validated = $request->validate([
            'nama_sekolah'        => 'required|string|max:255',
            'alamat'              => 'required|string',
            'telepon'             => 'required|string|max:50',
            'email'               => 'required|email|max:255',
            'website'             => 'nullable|string|max:255',
            'nama_kepala_sekolah' => 'nullable|string|max:255',
            'nip_kepala_sekolah'  => 'nullable|string|max:255',
        ]);

        $setting->update($validated);

        return redirect()->back()->with('success', 'Profil sekolah berhasil diperbarui.');
    }
}
