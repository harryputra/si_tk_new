<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class OutstandingDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $studentQuery = Student::query()
            ->where('status', 'aktif')
            ->with([
                'invoices' => fn ($q) => $q->where('status', '!=', 'paid'),
                'currentClass',
            ]);

        if ($request->filled('current_class_id')) {
            if ($request->current_class_id === 'none') {
                $studentQuery->whereNull('current_class_id');
            } else {
                $studentQuery->where('current_class_id', $request->current_class_id);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $studentQuery->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'ilike', "%{$search}%")
                  ->orWhere('nis', 'ilike', "%{$search}%");
            });
        }

        $matched = $studentQuery->orderBy('nama_lengkap')->get();

        // Map student_id -> academic_year_id of their LATEST active enrollment.
        // Used to bucket invoices: same year = "kelas baru", else = "kelas lama".
        $currentYearByStudent = StudentEnrollment::whereIn('student_id', $matched->pluck('id'))
            ->where('status', 'active')
            ->orderByDesc('id')
            ->get()
            ->groupBy('student_id')
            ->map(fn ($collection) => $collection->first()->academic_year_id);

        $rows = $matched->map(function (Student $s) use ($currentYearByStudent) {
            $currentYearId = $currentYearByStudent[$s->id] ?? null;
            $debtOld = 0.0;
            $debtCurrent = 0.0;

            foreach ($s->invoices as $inv) {
                $sisa = (float) $inv->nominal_tagihan - (float) $inv->nominal_terbayar;
                if ($sisa <= 0) continue;

                if ($currentYearId !== null && (int) $inv->academic_year_id === (int) $currentYearId) {
                    $debtCurrent += $sisa;
                } else {
                    $debtOld += $sisa;
                }
            }

            return [
                'id'                  => $s->id,
                'nis'                 => $s->nis,
                'nama_lengkap'        => $s->nama_lengkap,
                'current_class_id'    => $s->current_class_id,
                'current_class_name'  => $s->currentClass?->name,
                'current_class_level' => $s->currentClass?->level,
                'debt_old'            => round($debtOld, 2),
                'debt_current'        => round($debtCurrent, 2),
                'debt_total'          => round($debtOld + $debtCurrent, 2),
            ];
        });

        // Post-aggregation status filter (can't push to SQL since debt is computed in PHP)
        if ($request->filled('debt_status')) {
            $rows = match ($request->debt_status) {
                'clear'         => $rows->filter(fn ($r) => $r['debt_total'] == 0),
                'has_old'       => $rows->filter(fn ($r) => $r['debt_old'] > 0),
                'only_current'  => $rows->filter(fn ($r) => $r['debt_old'] == 0 && $r['debt_current'] > 0),
                default         => $rows,
            };
        }

        // Default sort: red flags (old debt) first, then by name
        $rows = $rows->sortBy([
            ['debt_old', 'desc'],
            ['nama_lengkap', 'asc'],
        ])->values();

        // Aggregate totals across the FULL filtered set (not just current page)
        $totals = [
            'students_count'         => $rows->count(),
            'students_with_old_debt' => $rows->where('debt_old', '>', 0)->count(),
            'total_old_debt'         => $rows->sum('debt_old'),
            'total_current_debt'     => $rows->sum('debt_current'),
            'grand_total'            => $rows->sum('debt_total'),
        ];

        // Manual pagination over the computed collection
        $perPage = (int) $request->input('per_page', 25);
        if (!in_array($perPage, [10, 25, 50, 100])) {
            $perPage = 25;
        }
        $page = max(1, (int) $request->input('page', 1));
        $items = $rows->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $items,
            $rows->count(),
            $perPage,
            $page,
            [
                'path'  => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('OutstandingDashboard/Index', [
            'students' => $paginator,
            'classes'  => SchoolClass::orderBy('level')->orderBy('name')->get(['id', 'name', 'level']),
            'filters'  => $request->only(['search', 'current_class_id', 'debt_status', 'per_page']),
            'totals'   => $totals,
        ]);
    }
}
