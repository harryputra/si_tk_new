<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\InboundPayment;
use App\Models\Invoice;
use App\Models\OutboundRequest;
use App\Models\Student;
use App\Models\Teacher;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = now();
        $thisMonth = $now->month;
        $thisYear = $now->year;

        // Financial Stats
        $monthly_income = (float) InboundPayment::where('status_approval', 'approved')
            ->whereMonth('created_at', $thisMonth)
            ->whereYear('created_at', $thisYear)
            ->sum('total_bayar');

        $monthly_expense = (float) OutboundRequest::where('status_approval', 'disbursed')
            ->whereMonth('disbursed_at', $thisMonth)
            ->whereYear('disbursed_at', $thisYear)
            ->sum('nominal');

        // Budget Stats (RKAS Pengeluaran)
        $rkas_pagu = (float) \App\Models\RkasBudget::where('kind', 'pengeluaran')->sum('pagu_anggaran');
        $rkas_terpakai = (float) \App\Models\RkasBudget::where('kind', 'pengeluaran')->sum('terpakai');
        $budget_health = $rkas_pagu > 0 ? round(($rkas_terpakai / $rkas_pagu) * 100, 1) : 0;

        $stats = [
            'active_students' => Student::where('status', 'aktif')->count(),
            'total_teachers'  => Teacher::where('status', 'aktif')->count(),
            'total_balance'   => (float) Account::sum('saldo'),
            'total_arrears'   => (float) Invoice::where('status', 'unpaid')->selectRaw('SUM(nominal_tagihan - nominal_terbayar) as total')->value('total'),
            'monthly_income'  => $monthly_income,
            'monthly_expense' => $monthly_expense,
            'budget_health'   => $budget_health,
            'pending_payments' => InboundPayment::where('status_approval', 'pending')->count(),
            'pending_requests' => OutboundRequest::where('status_approval', 'pending')->count(),
            'current_year'    => $thisYear,
        ];

        $recent_payments = InboundPayment::with('student')
            ->latest()
            ->take(5)
            ->get();

        $recent_requests = OutboundRequest::latest()
            ->take(5)
            ->get();

        // Student stats by type
        $student_types = Student::where('status', 'aktif')
            ->selectRaw('jenis_siswa, count(*) as total')
            ->groupBy('jenis_siswa')
            ->get();

        return Inertia::render('Dashboard', [
            'stats'           => $stats,
            'recent_payments' => $recent_payments,
            'recent_requests' => $recent_requests,
            'student_types'   => $student_types,
        ]);
    }
}
