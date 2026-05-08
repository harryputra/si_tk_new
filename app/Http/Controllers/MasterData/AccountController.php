<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        $accounts = Account::latest()->get();

        return Inertia::render('MasterData/Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_rekening' => 'required|string|max:255',
            'bank' => 'required|string|max:100',
            'nomor_rekening' => 'required|string|max:50|unique:accounts,nomor_rekening',
            'saldo' => 'required|numeric|min:0',
            'jenis' => 'required|in:operasional,gaji',
        ]);

        Account::create($validated);

        return redirect()->route('akun.index')
            ->with('success', 'Rekening berhasil ditambahkan.');
    }

    public function update(Request $request, Account $akun): RedirectResponse
    {
        $validated = $request->validate([
            'nama_rekening' => 'required|string|max:255',
            'bank' => 'required|string|max:100',
            'nomor_rekening' => 'required|string|max:50|unique:accounts,nomor_rekening,' . $akun->id,
            'saldo' => 'required|numeric|min:0',
            'jenis' => 'required|in:operasional,gaji',
        ]);

        $akun->update($validated);

        return redirect()->route('akun.index')
            ->with('success', 'Rekening berhasil diperbarui.');
    }

    public function destroy(Account $akun): RedirectResponse
    {
        // Prevent deletion if balance is not zero (optional business rule)
        if ($akun->saldo != 0) {
            return redirect()->route('akun.index')
                ->with('error', 'Rekening dengan saldo tidak nol tidak dapat dihapus.');
        }

        $akun->delete();

        return redirect()->route('akun.index')
            ->with('success', 'Rekening berhasil dihapus.');
    }
}
