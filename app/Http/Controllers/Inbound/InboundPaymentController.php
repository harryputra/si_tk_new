<?php

namespace App\Http\Controllers\Inbound;

use App\Http\Controllers\Controller;
use App\Models\InboundPayment;
use App\Models\Invoice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;


class InboundPaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = InboundPayment::with(['student', 'invoice.tariff', 'account', 'createdBy', 'approvedBy', 'media']);

        if ($request->filled('status')) {
            $query->where('status_approval', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('student', function ($sq) use ($search) {
                    $sq->where('nama_lengkap', 'ilike', "%{$search}%")
                       ->orWhere('nis', 'ilike', "%{$search}%");
                })->orWhereHas('invoice', function ($iq) use ($search) {
                    $iq->where('id', 'like', "%{$search}%");
                });
            });
        }

        $payments = $query->latest()->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('Inbound/Payments/Index', [
            'payments' => $payments,
            'filters'  => $request->only(['status', 'search', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $invoice = Invoice::findOrFail($request->invoice_id);
        
        $validated = $request->validate([
            'invoice_id'      => 'required|exists:invoices,id',
            'account_id'      => 'required_if:jenis_transaksi,transfer|nullable|exists:accounts,id',
            'total_bayar'     => ['required', 'numeric', 'min:1', function ($attribute, $value, $fail) use ($invoice) {
                if ($value > $invoice->sisa_hutang) {
                    $fail('Total bayar tidak boleh melebihi sisa hutang (Rp ' . number_format($invoice->sisa_hutang, 0, ',', '.') . ')');
                }
            }],
            'jenis_bayar'     => 'required|in:lunas,cicilan',
            'jenis_transaksi' => 'required|in:tunai,transfer',
            'catatan'         => 'nullable|string',
            'bukti_bayar'     => 'nullable|image|max:2048',
        ]);

        $accountId = $validated['account_id'];
        
        // Auto-assign KAS TUNAI for cash transactions if no account is selected
        if ($validated['jenis_transaksi'] === 'tunai' && empty($accountId)) {
            $cashAccount = \App\Models\Account::where('nama_rekening', 'KAS TUNAI')->first();
            $accountId = $cashAccount ? $cashAccount->id : \App\Models\Account::first()->id; // Fallback to first account if still missing
        }

        $payment = InboundPayment::create([
            'invoice_id'      => $validated['invoice_id'],
            'student_id'      => $invoice->student_id,
            'account_id'      => $accountId,
            'total_bayar'     => $validated['total_bayar'],
            'jenis_bayar'     => $validated['jenis_bayar'],
            'jenis_transaksi' => $validated['jenis_transaksi'],
            'catatan'         => $validated['catatan'],
            'status_approval' => 'pending',
            'dibuat_oleh'     => Auth::id(),
        ]);

        if ($request->hasFile('bukti_bayar')) {
            $payment->addMediaFromRequest('bukti_bayar')->toMediaCollection('bukti_bayar');
        }

        return redirect()->route('pembayaran.index')
            ->with('success', 'Pembayaran berhasil disubmit dan menunggu persetujuan.');
    }

    public function approve(InboundPayment $pembayaran): RedirectResponse
    {
        // $this->authorize('approve', $pembayaran);

        $pembayaran->update([
            'status_approval' => 'approved',
            'approved_by'     => Auth::id(),
            'approved_at'     => now(),
        ]);

        return redirect()->back()->with('success', 'Pembayaran disetujui.');
    }

    public function reject(Request $request, InboundPayment $pembayaran): RedirectResponse
    {
        // $this->authorize('approve', $pembayaran);

        $pembayaran->update([
            'status_approval' => 'rejected',
            'catatan'         => $pembayaran->catatan . "\nReject Reason: " . $request->reason,
            'approved_by'     => Auth::id(),
            'approved_at'     => now(),
        ]);

        return redirect()->back()->with('success', 'Pembayaran ditolak.');
    }

    public function printReceipt(InboundPayment $pembayaran)
    {
        $pembayaran->load(['student', 'invoice.tariff', 'account', 'approvedBy']);
        
        if ($pembayaran->status_approval !== 'approved') {
            return redirect()->back()->withErrors(['error' => 'Bukti pembayaran hanya dapat dicetak untuk transaksi yang sudah disetujui.']);
        }

        return view('reports.receipt', compact('pembayaran'));
    }
}
