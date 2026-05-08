<?php

namespace App\Http\Controllers\Outbound;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\OutboundRequest;
use App\Models\RkasBudget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OutboundRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $query = OutboundRequest::with(['rkasBudget', 'account', 'createdBy', 'approvedBy', 'disbursedBy']);

        if ($request->filled('status')) {
            $query->where('status_approval', $request->status);
        }

        $requests = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Outbound/Requests/Index', [
            'requests'     => $requests,
            'filters'      => $request->only(['status']),
            'rkas_budgets' => RkasBudget::where('tahun_anggaran', date('Y'))->get(['id', 'kode_rkas', 'uraian', 'pagu_anggaran', 'terpakai']),
            'accounts'     => Account::where('jenis', 'operasional')->get(['id', 'bank', 'nama_rekening']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rkas_id'         => 'nullable|exists:rkas_budgets,id',
            'account_id'      => 'required|exists:accounts,id',
            'judul_pengajuan' => 'required|string|max:255',
            'deskripsi'       => 'required|string',
            'nominal'         => ['required', 'numeric', 'min:1', function ($attribute, $value, $fail) use ($request) {
                if ($request->rkas_id) {
                    $rkas = RkasBudget::find($request->rkas_id);
                    if ($rkas && $value > ($rkas->pagu_anggaran - $rkas->terpakai)) {
                        $fail('Nominal melebihi sisa pagu RKAS.');
                    }
                }
            }],
            'jenis_pengajuan' => 'required|in:sekolah,yayasan',
            'nota_rab'        => 'nullable|array',
            'nota_rab.*'      => 'file|max:2048',
        ]);

        $outboundRequest = OutboundRequest::create(array_merge($validated, [
            'status_approval' => 'pending',
            'dibuat_oleh'     => Auth::id(),
        ]));

        if ($request->hasFile('nota_rab')) {
            foreach ($request->file('nota_rab') as $file) {
                $outboundRequest->addMedia($file)->toMediaCollection('nota_rab');
            }
        }

        return redirect()->route('pengajuan.index')
            ->with('success', 'Pengajuan dana berhasil disubmit.');
    }

    public function approve(Request $request, OutboundRequest $pengajuan): RedirectResponse
    {
        // $this->authorize('approve', $pengajuan);

        $pengajuan->update([
            'status_approval' => 'approved',
            'approved_by'     => Auth::id(),
            'approved_at'     => now(),
            'catatan_reviewer' => $request->catatan,
        ]);

        return redirect()->back()->with('success', 'Pengajuan disetujui.');
    }

    public function disburse(OutboundRequest $pengajuan): RedirectResponse
    {
        // Idempotent: tolak kalau sudah disbursed (cegah double bump pada terpakai)
        if ($pengajuan->status_approval === 'disbursed') {
            return back()->with('error', 'Pengajuan ini sudah dicairkan sebelumnya.');
        }

        // OutboundRequestObserver akan otomatis: decrement saldo Account
        // & increment terpakai RkasBudget saat status berubah jadi 'disbursed'.
        $pengajuan->update([
            'status_approval' => 'disbursed',
            'disbursed_by'    => Auth::id(),
            'disbursed_at'    => now(),
        ]);

        return redirect()->back()->with('success', 'Dana telah dicairkan.');
    }
}
