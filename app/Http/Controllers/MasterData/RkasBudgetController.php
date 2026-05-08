<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\RkasAccount;
use App\Models\RkasBudget;
use App\Models\RkasBudgetRevision;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RkasBudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $query = RkasBudget::query()->with(['revisions.changedBy', 'rkasAccount.parent', 'approvedBy']);

        if ($request->filled('tahun')) {
            $query->where('tahun_anggaran', $request->tahun);
        }
        if ($request->filled('kind')) {
            $query->where('kind', $request->kind);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $budgets = $query->orderBy('kode_rkas')->get()->map(function (RkasBudget $b) {
            return [
                'id'             => $b->id,
                'kind'           => $b->kind,
                'status'         => $b->status,
                'kode_rkas'      => $b->kode_rkas,
                'uraian'         => $b->uraian,
                'kategori_utama' => $b->kategori_utama,
                'sub_kategori'   => $b->sub_kategori,
                'rkas_account_id' => $b->rkas_account_id,
                'rkas_account'   => $b->rkasAccount ? [
                    'kode' => $b->rkasAccount->kode,
                    'name' => $b->rkasAccount->name,
                    'path' => $b->rkasAccount->path,
                ] : null,
                'pagu_anggaran'  => (float) $b->pagu_anggaran,
                'terpakai'       => (float) $b->terpakai,
                'sisa_pagu'      => (float) $b->pagu_anggaran - (float) $b->terpakai,
                'persentase_terpakai' => $b->persentase_realisasi,
                'tahun_anggaran' => $b->tahun_anggaran,
                'approved_by'    => $b->approvedBy?->name,
                'approved_at'    => $b->approved_at?->toDateTimeString(),
                'revisions'      => $b->revisions->map(fn ($r) => [
                    'id'            => $r->id,
                    'field_changed' => $r->field_changed,
                    'old_value'     => $r->old_value,
                    'new_value'     => $r->new_value,
                    'reason'        => $r->reason,
                    'changed_by'    => $r->changedBy?->name,
                    'created_at'    => $r->created_at->toDateTimeString(),
                ]),
            ];
        });

        // Summary aggregates per kind
        $pendapatan = $budgets->where('kind', 'pendapatan');
        $pengeluaran = $budgets->where('kind', 'pengeluaran');

        return Inertia::render('MasterData/RkasBudgets/Index', [
            'budgets'  => $budgets->values(),
            'accounts' => RkasAccount::where('is_active', true)->orderBy('kode')->get()->map(fn ($a) => [
                'id'   => $a->id,
                'kode' => $a->kode,
                'name' => $a->name,
                'kind' => $a->kind,
                'level'=> $a->level,
            ]),
            'filters'  => $request->only(['tahun', 'kind', 'status']),
            'summary'  => [
                'pendapatan' => [
                    'count'           => $pendapatan->count(),
                    'total_target'    => (float) $pendapatan->sum('pagu_anggaran'),
                    'total_realisasi' => (float) $pendapatan->sum('terpakai'),
                ],
                'pengeluaran' => [
                    'count'           => $pengeluaran->count(),
                    'total_pagu'      => (float) $pengeluaran->sum('pagu_anggaran'),
                    'total_realisasi' => (float) $pengeluaran->sum('terpakai'),
                ],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateBudget($request);

        // Default status: draft kalau tidak super_admin atau eksplisit ditandai active
        $validated['status'] = $validated['status'] ?? RkasBudget::STATUS_DRAFT;

        RkasBudget::create($validated);

        return redirect()->route('rkas.index')
            ->with('success', 'Anggaran RKAS ditambahkan (status: draft, butuh approval).');
    }

    public function update(Request $request, RkasBudget $rka): RedirectResponse
    {
        $validated = $this->validateBudget($request, $rka->id);

        // Detect tracked field changes
        $tracked = ['pagu_anggaran', 'uraian', 'kategori_utama', 'sub_kategori', 'rkas_account_id', 'kind'];
        $changes = [];
        foreach ($tracked as $field) {
            $old = (string) ($rka->{$field} ?? '');
            $new = (string) ($validated[$field] ?? '');
            if ($old !== $new) {
                $changes[] = ['field' => $field, 'old' => $old, 'new' => $new];
            }
        }

        $paguChanged = collect($changes)->contains(fn ($c) => $c['field'] === 'pagu_anggaran');
        if ($paguChanged && empty(trim($validated['revision_reason'] ?? ''))) {
            return back()
                ->withErrors(['revision_reason' => 'Alasan revisi wajib diisi saat mengubah Pagu Anggaran.'])
                ->withInput();
        }

        if ($paguChanged && (float) $validated['pagu_anggaran'] < (float) $rka->terpakai) {
            return back()
                ->withErrors([
                    'pagu_anggaran' => sprintf(
                        'Pagu baru (Rp %s) lebih kecil dari yang sudah terpakai (Rp %s).',
                        number_format($validated['pagu_anggaran'], 0, ',', '.'),
                        number_format($rka->terpakai, 0, ',', '.'),
                    ),
                ])->withInput();
        }

        // Edit pada anggaran ACTIVE → revert ke draft (butuh re-approval)
        $autoRevertToDraft = $rka->status === RkasBudget::STATUS_ACTIVE && $paguChanged;

        DB::transaction(function () use ($rka, $validated, $changes, $autoRevertToDraft) {
            $reason = $validated['revision_reason'] ?? '(non-pagu update)';
            $userId = Auth::id();

            $payload = collect($validated)->except(['revision_reason'])->toArray();
            if ($autoRevertToDraft) {
                $payload['status']      = RkasBudget::STATUS_DRAFT;
                $payload['approved_by'] = null;
                $payload['approved_at'] = null;
            }
            $rka->update($payload);

            foreach ($changes as $c) {
                RkasBudgetRevision::create([
                    'rkas_budget_id' => $rka->id,
                    'field_changed'  => $c['field'],
                    'old_value'      => $c['old'],
                    'new_value'      => $c['new'],
                    'reason'         => $reason,
                    'changed_by'     => $userId,
                ]);
            }
        });

        $msg = count($changes) > 0
            ? sprintf('RKAS diperbarui (%d revisi tercatat%s).',
                count($changes), $autoRevertToDraft ? ', status revert ke DRAFT' : '')
            : 'RKAS diperbarui.';

        return redirect()->route('rkas.index')->with('success', $msg);
    }

    /**
     * Approval: ubah status draft → approved → active.
     * Untuk MVP, single-step approval (Yayasan/Kepsek). Multi-tier bisa ditambah di C3.
     */
    public function approve(RkasBudget $rka): RedirectResponse
    {
        if (!in_array($rka->status, [RkasBudget::STATUS_DRAFT, RkasBudget::STATUS_APPROVED])) {
            return back()->with('error', 'Hanya draft/approved yang bisa di-approve.');
        }

        $rka->update([
            'status'      => RkasBudget::STATUS_ACTIVE,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'RKAS disetujui & aktif.');
    }

    public function archive(RkasBudget $rka): RedirectResponse
    {
        $rka->update(['status' => RkasBudget::STATUS_ARCHIVED]);
        return back()->with('success', 'RKAS diarsipkan.');
    }

    public function destroy(RkasBudget $rka): RedirectResponse
    {
        if ($rka->terpakai > 0) {
            return redirect()->route('rkas.index')
                ->with('error', 'Anggaran yang sudah terpakai/realisasi tidak dapat dihapus. Arsipkan saja.');
        }

        $rka->delete();

        return redirect()->route('rkas.index')->with('success', 'Anggaran RKAS dihapus.');
    }

    public function recomputeTerpakai(RkasBudget $rka): RedirectResponse
    {
        $oldVal = (float) $rka->terpakai;
        $newVal = $rka->recomputeTerpakai();

        return redirect()->route('rkas.index')->with('success', sprintf(
            'Terpakai recomputed: Rp %s → Rp %s.',
            number_format($oldVal, 0, ',', '.'),
            number_format($newVal, 0, ',', '.'),
        ));
    }

    private function validateBudget(Request $request, ?int $exceptId = null): array
    {
        $uniqueRule = 'unique:rkas_budgets,kode_rkas' . ($exceptId ? ',' . $exceptId : '');

        return $request->validate([
            'kind'            => 'required|in:pendapatan,pengeluaran',
            'status'          => 'nullable|in:draft,approved,active,archived',
            'rkas_account_id' => 'nullable|exists:rkas_accounts,id',
            'kode_rkas'       => 'required|string|max:50|' . $uniqueRule,
            'uraian'          => 'required|string|max:255',
            'kategori_utama'  => 'nullable|string|max:100',
            'sub_kategori'    => 'nullable|string|max:100',
            'pagu_anggaran'   => 'required|numeric|min:0',
            'tahun_anggaran'  => 'required|integer|digits:4',
            'revision_reason' => 'nullable|string|max:500',
        ]);
    }
}
