<?php

namespace App\Http\Controllers\Report;

use App\Http\Controllers\Controller;
use App\Models\InboundPayment;
use App\Models\OutboundRequest;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', date('Y-m-01'));
        $endDate = $request->input('end_date', date('Y-m-t'));

        // Pendapatan (Approved Inbound Payments)
        $inbound = InboundPayment::where('status_approval', 'approved')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->sum('total_bayar');

        // Pengeluaran (Disbursed Outbound Requests)
        $outbound = OutboundRequest::where('status_approval', 'disbursed')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->sum('nominal');

        // Payroll (Paid Payrolls)
        $payroll = Payroll::where('status_approval', 'paid')
            ->whereBetween('paid_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->sum('total_take_home_pay');

        $totalExpense = $outbound + $payroll;
        $netProfit = $inbound - $totalExpense;

        // Daily Trend for Chart
        $dailyInbound = InboundPayment::where('status_approval', 'approved')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_bayar) as total'))
            ->groupBy('date')
            ->get();

        $dailyOutbound = OutboundRequest::where('status_approval', 'disbursed')
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(nominal) as total'))
            ->groupBy('date')
            ->get();

        return Inertia::render('Report/Index', [
            'stats' => [
                'total_inbound' => $inbound,
                'total_outbound' => $outbound,
                'total_payroll' => $payroll,
                'total_expense' => $totalExpense,
                'net_profit' => $netProfit,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'chart_data' => [
                'inbound' => $dailyInbound,
                'outbound' => $dailyOutbound,
            ]
        ]);
    }
}
