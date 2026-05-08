<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Payroll;
use App\Models\PayrollAdjustment;
use App\Models\PayrollComponent;
use App\Models\PayrollItem;
use App\Services\PayrollGenerator;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PayrollController extends Controller
{
    public function index(Request $request): Response
    {
        $periode = $request->input('periode', date('Y-m'));
        $payrolls = Payroll::with(['teacher', 'approvedBy', 'paidBy', 'items.component'])
            ->where('periode', $periode . '-01')
            ->get();

        return Inertia::render('Payroll/Index', [
            'payrolls' => $payrolls,
            'filters'  => ['periode' => $periode],
        ]);
    }

    public function show(Payroll $payroll): Response
    {
        $payroll->load([
            'teacher',
            'approvedBy',
            'paidBy',
            'items.component',
            'items.assignment',
            'adjustments.changedBy',
            'adjustments.item',
        ]);

        return Inertia::render('Payroll/Show', [
            'payroll'    => $payroll,
            'components' => PayrollComponent::where('is_active', true)->orderBy('kind')->orderBy('name')->get(),
        ]);
    }

    public function generate(Request $request, PayrollGenerator $generator): RedirectResponse
    {
        $request->validate(['periode' => 'required|date_format:Y-m']);
        $result = $generator->generateForPeriod($request->periode . '-01');

        $msg = sprintf(
            'Generate selesai — %d baru, %d di-regenerate, %d dilewati (sudah approved/paid), %d guru tanpa komponen aktif.',
            $result['created'], $result['updated'], $result['locked'], $result['no_assign']
        );

        return redirect()->back()->with('success', $msg);
    }

    public function approve(Payroll $payroll): RedirectResponse
    {
        $payroll->update([
            'status_approval' => 'approved',
            'approved_by'     => Auth::id(),
            'approved_at'     => now(),
        ]);

        return redirect()->back()->with('success', 'Payroll disetujui.');
    }

    public function pay(Payroll $payroll, \App\Services\PayrollRkasGuard $guard): RedirectResponse
    {
        // C3 — Validasi RKAS Belanja Pegawai (hard block on over_budget)
        $rkas = $guard->check($payroll);
        if (!$rkas['ok']) {
            return redirect()->back()->with('error', '[RKAS] ' . $rkas['message']);
        }

        // Check salary account balance
        $account = Account::where('jenis', 'gaji')->first();
        if (!$account || $account->saldo < $payroll->total_take_home_pay) {
            return redirect()->back()->with('error', 'Saldo rekening gaji tidak mencukupi.');
        }

        $payroll->update([
            'status_approval' => 'paid',
            'paid_by'         => Auth::id(),
            'paid_at'         => now(),
        ]);

        $msg = 'Pembayaran gaji berhasil dikonfirmasi.';
        if ($rkas['status'] === 'warning') {
            $msg .= ' [RKAS] ' . $rkas['message'];
        }

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Tambah item manual (mis. tunjangan project, kasbon, denda khusus).
     * Hanya boleh kalau payroll masih DRAFT.
     */
    public function addItem(Request $request, Payroll $payroll): RedirectResponse
    {
        if ($payroll->status_approval !== 'draft') {
            return back()->with('error', 'Tidak bisa edit payroll yang sudah disetujui/dibayar.');
        }

        $validated = $request->validate([
            'description'          => 'required|string|max:255',
            'kind'                 => 'required|in:earning,deduction',
            'amount'               => 'required|numeric|min:0',
            'payroll_component_id' => 'nullable|exists:payroll_components,id',
            'reason'               => 'required|string|max:500',
            'notes'                => 'nullable|string|max:500',
        ]);

        $item = PayrollItem::create([
            'payroll_id'           => $payroll->id,
            'payroll_component_id' => $validated['payroll_component_id'] ?? null,
            'payroll_assignment_id' => null,
            'description'          => $validated['description'],
            'kind'                 => $validated['kind'],
            'formula'              => 'flat',
            'category'             => null,
            'unit_count'           => 1,
            'unit_nominal'         => $validated['amount'],
            'amount'               => $validated['amount'],
            'is_manual'            => true,
            'notes'                => $validated['notes'] ?? null,
        ]);

        PayrollAdjustment::create([
            'payroll_id'      => $payroll->id,
            'payroll_item_id' => $item->id,
            'action'          => PayrollAdjustment::ACTION_ADDED,
            'field_changed'   => null,
            'old_value'       => null,
            'new_value'       => $validated['amount'],
            'reason'          => $validated['reason'],
            'changed_by'      => Auth::id(),
        ]);

        $this->recalculateTotals($payroll);

        return back()->with('success', 'Item manual ditambahkan ke payroll.');
    }

    /**
     * Edit nominal item — wajib alasan untuk audit.
     */
    public function editItem(Request $request, Payroll $payroll, PayrollItem $item): RedirectResponse
    {
        if ($payroll->status_approval !== 'draft') {
            return back()->with('error', 'Tidak bisa edit payroll yang sudah disetujui/dibayar.');
        }
        if ($item->payroll_id !== $payroll->id) {
            abort(404);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:500',
        ]);

        $oldAmount = (float) $item->amount;
        $newAmount = (float) $validated['amount'];

        // Untuk item dari assignment (formula non-flat), edit nominal akan
        // override unit_nominal × unit_count. Simpel: set amount langsung.
        $item->update([
            'amount'       => $newAmount,
            'unit_nominal' => $newAmount,
            'unit_count'   => 1,
            'formula'      => 'flat', // setelah override, jadi flat
            'is_manual'    => true,
        ]);

        PayrollAdjustment::create([
            'payroll_id'      => $payroll->id,
            'payroll_item_id' => $item->id,
            'action'          => PayrollAdjustment::ACTION_EDITED,
            'field_changed'   => 'amount',
            'old_value'       => (string) $oldAmount,
            'new_value'       => (string) $newAmount,
            'reason'          => $validated['reason'],
            'changed_by'      => Auth::id(),
        ]);

        $this->recalculateTotals($payroll);

        return back()->with('success', 'Item diperbarui.');
    }

    /**
     * Hapus item — wajib alasan.
     */
    public function removeItem(Request $request, Payroll $payroll, PayrollItem $item): RedirectResponse
    {
        if ($payroll->status_approval !== 'draft') {
            return back()->with('error', 'Tidak bisa edit payroll yang sudah disetujui/dibayar.');
        }
        if ($item->payroll_id !== $payroll->id) {
            abort(404);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $oldAmount = (float) $item->amount;

        PayrollAdjustment::create([
            'payroll_id'      => $payroll->id,
            'payroll_item_id' => null, // item akan dihapus, jadi null
            'action'          => PayrollAdjustment::ACTION_REMOVED,
            'field_changed'   => null,
            'old_value'       => $item->description.' = '.$oldAmount,
            'new_value'       => null,
            'reason'          => $validated['reason'],
            'changed_by'      => Auth::id(),
        ]);

        $item->delete();
        $this->recalculateTotals($payroll);

        return back()->with('success', 'Item dihapus.');
    }

    /**
     * Re-aggregate Payroll summary columns dari sum items.
     * Dipanggil setelah add/edit/remove item.
     */
    private function recalculateTotals(Payroll $payroll): void
    {
        $items = $payroll->items()->get();

        $totalEarning   = $items->where('kind', 'earning')->sum('amount');
        $totalDeduction = $items->where('kind', 'deduction')->sum('amount');

        $payroll->update([
            'gaji_pokok'          => $items->where('category', 'gaji_pokok')->sum('amount'),
            'tunjangan'           => $items->where('category', 'tunjangan_tetap')->sum('amount'),
            'bonus_kehadiran'     => $items->where('category', 'bonus_kehadiran')->sum('amount'),
            'potongan_alfa'       => $items->where('category', 'potongan_disiplin')->sum('amount'),
            'potongan_lain'       => $items->where('kind', 'deduction')->whereNotIn('category', ['potongan_disiplin'])->sum('amount'),
            'total_take_home_pay' => $totalEarning - $totalDeduction,
        ]);
    }
}
