<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $tanggal = $request->input('tanggal', date('Y-m-d'));
        
        $teachers = Teacher::active()->get();
        $attendances = Attendance::where('tanggal', $tanggal)->get()->keyBy('teacher_id');

        return Inertia::render('Payroll/Attendances/Index', [
            'teachers'    => $teachers,
            'attendances' => $attendances,
            'date'        => $tanggal,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'tanggal' => 'required|date',
            'data'    => 'required|array',
            'data.*.teacher_id' => 'required|exists:teachers,id',
            'data.*.status'     => 'required|in:hadir,alfa,izin,sakit',
        ]);

        foreach ($request->data as $item) {
            Attendance::updateOrCreate(
                ['teacher_id' => $item['teacher_id'], 'tanggal' => $request->tanggal],
                ['status' => $item['status'], 'admin_id' => Auth::id(), 'keterangan' => $item['keterangan'] ?? null]
            );
        }

        return redirect()->back()->with('success', 'Absensi berhasil disimpan.');
    }
}
