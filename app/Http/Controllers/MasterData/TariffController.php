<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Tariff;
use App\Services\InvoiceGenerator;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TariffController extends Controller
{
    public function index(): Response
    {
        $tariffs = Tariff::latest()->get();
        $academic_years = \App\Models\AcademicYear::all();
        $classes = \App\Models\SchoolClass::orderBy('level')->orderBy('name')->get();
        // Daftar tingkat (level) unik untuk applicability='level'
        $levels = \App\Models\SchoolClass::query()
            ->whereNotNull('level')
            ->distinct()
            ->orderBy('level')
            ->pluck('level')
            ->values();

        // C3: COA pendapatan untuk linking ke tariff
        $rkas_accounts_pendapatan = \App\Models\RkasAccount::where('kind', 'pendapatan')
            ->where('is_active', true)
            ->orderBy('kode')
            ->get(['id', 'kode', 'name', 'level']);

        return Inertia::render('MasterData/Tariffs/Index', [
            'tariffs' => $tariffs,
            'academic_years' => $academic_years,
            'classes' => $classes,
            'levels' => $levels,
            'rkas_accounts_pendapatan' => $rkas_accounts_pendapatan,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateTariff($request);
        Tariff::create($validated);

        return redirect()->route('tarif.index')
            ->with('success', 'Tarif berhasil ditambahkan.');
    }

    public function update(Request $request, Tariff $tarif): RedirectResponse
    {
        $validated = $this->validateTariff($request);
        $tarif->update($validated);

        return redirect()->route('tarif.index')
            ->with('success', 'Tarif berhasil diperbarui.');
    }

    /**
     * Validasi tarif dengan rule kontekstual:
     * - applicability=class → applicable_id wajib (school_classes.id)
     * - applicability=level → applicable_level wajib (string level)
     * - applicability=student → applicable_id wajib (students.id)
     * - applicability=all → keduanya tidak relevan, di-null-kan
     */
    private function validateTariff(Request $request): array
    {
        $validated = $request->validate([
            'nama_tarif'       => 'required|string|max:255',
            'jenis_tarif'      => 'required|in:spp,dsp,kegiatan_tahunan,seragam,pendaftaran,snack',
            'jenis_siswa'      => 'required|in:reguler,reguler_opsi2,fullday,all',
            'nominal'          => 'required|numeric|min:0',
            'tahun_berlaku'    => 'required|integer|digits:4',
            'billing_cycle'    => 'required|in:one_time,monthly,annual,situational',
            'applicability'    => 'required|in:all,class,level,student',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'applicable_id'    => 'nullable|integer',
            'applicable_level' => 'nullable|string|max:100',
            'rkas_account_id'  => 'nullable|exists:rkas_accounts,id',
        ]);

        // Konsistensi: kosongkan field yang tidak relevan dengan applicability
        $applicability = $validated['applicability'];
        if ($applicability === 'all') {
            $validated['applicable_id'] = null;
            $validated['applicable_level'] = null;
        } elseif ($applicability === 'class') {
            $validated['applicable_level'] = null;
            if (empty($validated['applicable_id'])) {
                abort(422, 'applicable_id wajib diisi untuk applicability=class');
            }
        } elseif ($applicability === 'level') {
            $validated['applicable_id'] = null;
            if (empty($validated['applicable_level'])) {
                abort(422, 'applicable_level wajib diisi untuk applicability=level');
            }
        } elseif ($applicability === 'student') {
            $validated['applicable_level'] = null;
            if (empty($validated['applicable_id'])) {
                abort(422, 'applicable_id wajib diisi untuk applicability=student');
            }
        }

        return $validated;
    }

    public function destroy(Tariff $tarif): RedirectResponse
    {
        $tarif->delete();

        return redirect()->route('tarif.index')
            ->with('success', 'Tarif berhasil dihapus.');
    }

    public function issueInvoices(Request $request, Tariff $tarif, InvoiceGenerator $generator): RedirectResponse
    {
        $validated = $request->validate([
            'periode' => 'nullable|date',
        ]);

        $result = $generator->issueForTariff($tarif, $validated['periode'] ?? null);

        $msg = sprintf(
            'Tarif "%s" — %d invoice baru diterbitkan, %d dilewati (sudah ada). Target siswa aktif: %d. Periode: %s.',
            $tarif->nama_tarif,
            $result['created'],
            $result['skipped'],
            $result['targeted'],
            $result['periode']
        );

        return redirect()->route('tarif.index')->with('success', $msg);
    }
}
