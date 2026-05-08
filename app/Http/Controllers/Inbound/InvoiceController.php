<?php

namespace App\Http\Controllers\Inbound;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Invoice;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Invoice::with(['student', 'tariff', 'inboundPayments']);

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('periode')) {
            $query->where('periode', $request->periode . '-01');
        }

        // Search by student name or NIS
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where(function ($subQuery) use ($search) {
                    $subQuery->where('nama_lengkap', 'ILIKE', '%' . $search . '%')
                             ->orWhere('nis', 'ILIKE', '%' . $search . '%');
                });
            });
        }

        // Filter by Class
        if ($request->filled('school_class_id')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('current_class_id', $request->school_class_id);
            });
        }

        // Dynamic Pagination with safety whitelist
        $perPage = $request->integer('per_page', 10);
        if (!in_array($perPage, [10, 25, 50, 100])) {
            $perPage = 10;
        }

        $invoices = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('Inbound/Invoices/Index', [
            'invoices' => $invoices,
            'filters'  => $request->only(['student_id', 'status', 'periode', 'search', 'per_page', 'school_class_id']),
            'students' => Student::select('id', 'nama_lengkap')->active()->get(),
            'classes'  => \App\Models\SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name', 'level']),
            'accounts' => Account::where('jenis', 'operasional')->get(['id', 'bank', 'nama_rekening']),
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        return Inertia::render('Inbound/Invoices/Show', [
            'invoice' => $invoice->load(['student.currentClass', 'tariff', 'inboundPayments.createdBy', 'waivers.approver']),
        ]);
    }

    public function generateBills(Request $request, \App\Services\InvoiceGenerator $generator)
    {
        $validated = $request->validate([
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'month'            => 'required|date',
        ]);

        $tariffs = \App\Models\Tariff::where('billing_cycle', 'monthly')
            ->when($validated['academic_year_id'] ?? null, fn ($q, $id) => $q->where('academic_year_id', $id))
            ->get();

        $totalCreated = 0;
        $totalSkipped = 0;
        foreach ($tariffs as $tariff) {
            $result = $generator->issueForTariff($tariff, $validated['month']);
            $totalCreated += $result['created'];
            $totalSkipped += $result['skipped'];
        }

        return redirect()->back()->with(
            'success',
            "Generate selesai: {$totalCreated} invoice baru, {$totalSkipped} dilewati (sudah ada)."
        );
    }

    public function submitWaiver(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|max:'.$invoice->sisa_hutang,
            'reason' => 'required|string',
        ]);

        \App\Models\InvoiceWaiver::create([
            'invoice_id' => $invoice->id,
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'requested_by' => auth()->id(),
            'status' => 'pending'
        ]);

        return redirect()->back()->with('success', 'Pengajuan pemutihan (waiver) berhasil dikirim.');
    }

    public function approveWaiver(Request $request, \App\Models\InvoiceWaiver $waiver)
    {
        // Must be Kepsek/Admin
        $waiver->update([
            'status' => 'kepsek_approved',
            'approved_by' => auth()->id(),
        ]);

        // Adjust the invoice automatically if needed or wait for Yayasan
        // For now, let's adjust the tagihan nominal directly to reflect the waiver
        $invoice = $waiver->invoice;
        $invoice->nominal_tagihan = $invoice->nominal_tagihan - $waiver->amount;
        if ($invoice->nominal_terbayar >= $invoice->nominal_tagihan) {
            $invoice->status = 'paid';
        }
        $invoice->save();

        return redirect()->back()->with('success', 'Pemutihan disetujui.');
    }

    public function exportPdf(Request $request)
    {
        // Increase memory and execution time for large datasets (e.g., 1000+ rows)
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', '300');

        // Use a clean query without unnecessary relations for performance
        $query = Invoice::with(['student:id,nama_lengkap,nis', 'tariff:id,nama_tarif']);
        
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Apply filters from request
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('school_class_id')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('current_class_id', $request->school_class_id);
            });
        }

        $invoices = $query->latest()->get();
        $school = \App\Models\SchoolSetting::first();

        $paperSize = $request->input('paper_size', 'a4'); // a4, legal, letter
        $orientation = $request->input('orientation', 'landscape'); // portrait, landscape

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.invoices_pdf', [
            'invoices' => $invoices,
            'school' => $school,
        ])
            ->setPaper($paperSize, $orientation);

        return $pdf->download('laporan-tagihan-' . now()->format('Y-m-d') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\InvoicesExport($request->all()),
            'laporan-tagihan-' . now()->format('Y-m-d') . '.xlsx'
        );
    }
}
