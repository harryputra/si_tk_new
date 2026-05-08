<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\RkasAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RkasAccountController extends Controller
{
    public function index(Request $request): Response
    {
        $query = RkasAccount::query()->with('parent');

        if ($request->filled('kind')) {
            $query->where('kind', $request->kind);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('kode', 'ilike', "%{$s}%")
                  ->orWhere('name', 'ilike', "%{$s}%");
            });
        }

        $accounts = $query->orderBy('kode')->get()->map(fn ($a) => [
            'id'          => $a->id,
            'kode'        => $a->kode,
            'name'        => $a->name,
            'kind'        => $a->kind,
            'parent_id'   => $a->parent_id,
            'parent_kode' => $a->parent?->kode,
            'parent_name' => $a->parent?->name,
            'level'       => $a->level,
            'description' => $a->description,
            'is_active'   => $a->is_active,
        ]);

        return Inertia::render('MasterData/RkasAccounts/Index', [
            'accounts' => $accounts,
            'filters'  => $request->only(['kind', 'search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateAccount($request);
        $validated['level'] = $this->resolveLevel($validated['parent_id'] ?? null);
        RkasAccount::create($validated);
        return redirect()->route('rkas-account.index')->with('success', 'Akun RKAS ditambahkan.');
    }

    public function update(Request $request, RkasAccount $rkas_account): RedirectResponse
    {
        $validated = $this->validateAccount($request, $rkas_account->id);

        // Cegah loop: parent tidak boleh self atau descendant
        if (!empty($validated['parent_id']) && $validated['parent_id'] === $rkas_account->id) {
            return back()->withErrors(['parent_id' => 'Akun tidak boleh jadi parent dirinya sendiri.']);
        }

        $validated['level'] = $this->resolveLevel($validated['parent_id'] ?? null);
        $rkas_account->update($validated);
        return redirect()->route('rkas-account.index')->with('success', 'Akun RKAS diperbarui.');
    }

    public function destroy(RkasAccount $rkas_account): RedirectResponse
    {
        if ($rkas_account->children()->exists()) {
            return redirect()->route('rkas-account.index')
                ->with('error', 'Akun ini punya child. Hapus dulu child-nya atau soft-archive saja.');
        }
        if ($rkas_account->budgets()->exists()) {
            // Soft archive — tidak boleh delete kalau dipakai
            $rkas_account->update(['is_active' => false]);
            return redirect()->route('rkas-account.index')
                ->with('success', 'Akun sudah dipakai di RKAS — diarsipkan (non-aktif).');
        }
        $rkas_account->delete();
        return redirect()->route('rkas-account.index')->with('success', 'Akun dihapus.');
    }

    private function validateAccount(Request $request, ?int $exceptId = null): array
    {
        $uniqueRule = 'unique:rkas_accounts,kode' . ($exceptId ? ',' . $exceptId : '');
        return $request->validate([
            'kode'        => 'required|string|max:50|' . $uniqueRule,
            'name'        => 'required|string|max:255',
            'kind'        => 'required|in:pendapatan,pengeluaran',
            'parent_id'   => 'nullable|exists:rkas_accounts,id',
            'description' => 'nullable|string|max:1000',
            'is_active'   => 'nullable|boolean',
        ]);
    }

    private function resolveLevel(?int $parentId): int
    {
        if (!$parentId) return 0;
        $parent = RkasAccount::find($parentId);
        return $parent ? $parent->level + 1 : 0;
    }
}
