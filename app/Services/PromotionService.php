<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceWaiver;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\Tariff;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PromotionService
{
    public function __construct(private InvoiceGenerator $invoiceGenerator)
    {
    }

    /**
     * Step 1: Promotion / Registrasi Ulang
     * This pushes promoted students into the Plotting Queue.
     */
    public function executePromotionToQueue(
        array $promotions,
        string $targetLevel,
        int $targetAcademicYearId
    ): array {
        $promotedToQueue = 0;
        $retained = 0;
        $skipped = 0;

        DB::transaction(function () use (
            $promotions, $targetLevel, $targetAcademicYearId,
            &$promotedToQueue, &$retained, &$skipped
        ) {
            foreach ($promotions as $p) {
                $student = Student::find($p['student_id']);
                if (!$student) continue;

                $action = $p['action'] ?? 'promote';

                // Check if already in queue or enrolled
                $alreadyEnrolled = StudentEnrollment::where('student_id', $student->id)
                    ->where('academic_year_id', $targetAcademicYearId)
                    ->exists();
                $alreadyInQueue = \App\Models\PlottingQueue::where('student_id', $student->id)
                    ->where('academic_year_id', $targetAcademicYearId)
                    ->exists();

                if ($alreadyEnrolled || $alreadyInQueue) {
                    $skipped++;
                    continue;
                }

                // Mark prior active enrollments as graduated
                StudentEnrollment::where('student_id', $student->id)
                    ->where('status', 'active')
                    ->update(['status' => 'graduated']);

                if ($action === 'promote') {
                    \App\Models\PlottingQueue::create([
                        'student_id'       => $student->id,
                        'academic_year_id' => $targetAcademicYearId,
                        'target_level'     => $targetLevel,
                        'status'           => 'unmapped',
                    ]);
                    $promotedToQueue++;
                } elseif ($action === 'retain') {
                    // Retain stays in current class, skip plotting queue
                    StudentEnrollment::create([
                        'student_id'       => $student->id,
                        'school_class_id'  => $student->current_class_id,
                        'academic_year_id' => $targetAcademicYearId,
                        'status'           => 'retained',
                    ]);
                    $retained++;
                }
            }
        });

        return [
            'promoted_to_queue' => $promotedToQueue,
            'retained'          => $retained,
            'skipped'           => $skipped,
        ];
    }

    /**
     * Step 2: Mapping / Plotting
     * Maps a student from PlottingQueue to a specific class, creates enrollment, and auto-issues invoices.
     */
    public function executeMapping(
        array $queueIds,
        int $targetClassId,
        int $targetAcademicYearId,
        bool $autoIssueInvoices = true,
        ?string $invoicePeriode = null
    ): array {
        $mapped = 0;
        $invoicesCreated = 0;
        $invoicesSkipped = 0;

        DB::transaction(function () use (
            $queueIds, $targetClassId, $targetAcademicYearId, $autoIssueInvoices, $invoicePeriode,
            &$mapped, &$invoicesCreated, &$invoicesSkipped
        ) {
            $queues = \App\Models\PlottingQueue::whereIn('id', $queueIds)
                ->where('status', 'unmapped')
                ->get();

            foreach ($queues as $queue) {
                // 1. Update Akademik (Enrollment & Student)
                StudentEnrollment::create([
                    'student_id'       => $queue->student_id,
                    'school_class_id'  => $targetClassId,
                    'academic_year_id' => $targetAcademicYearId,
                    'status'           => 'active',
                ]);
                
                $queue->student->update(['current_class_id' => $targetClassId]);
                
                // 2. Tandai queue selesai
                $queue->update(['status' => 'mapped']);
                $mapped++;
            }

            // 3. Aktivasi Tagihan Rutin untuk siswa yang baru di-map
            if ($autoIssueInvoices && $mapped > 0) {
                $targetClass = \App\Models\SchoolClass::find($targetClassId);
                $targetLevel = $targetClass?->level;

                $tariffs = Tariff::query()
                    ->where(function ($q) use ($targetClassId, $targetLevel) {
                        $q->where(function ($qq) use ($targetClassId) {
                            $qq->where('applicability', 'class')->where('applicable_id', $targetClassId);
                        });
                        if ($targetLevel) {
                            $q->orWhere(function ($qq) use ($targetLevel) {
                                $qq->where('applicability', 'level')->where('applicable_level', $targetLevel);
                            });
                        }
                    })
                    ->get();

                foreach ($tariffs as $tariff) {
                    $r = $this->invoiceGenerator->issueForTariff($tariff, $invoicePeriode);
                    $invoicesCreated += $r['created'];
                    $invoicesSkipped += $r['skipped'];
                }
            }
        });

        return [
            'mapped'           => $mapped,
            'invoices_created' => $invoicesCreated,
            'invoices_skipped' => $invoicesSkipped,
        ];
    }

    /**
     * Eksekusi kelulusan untuk daftar siswa.
     * Setiap entry: { student_id, action: 'graduate'|'graduate_with_waiver', waiver_reason?: string }
     *
     * - graduate              : siswa jadi alumni, enrollment ditandai graduated, tunggakan tetap menempel
     * - graduate_with_waiver  : sama + create InvoiceWaiver auto-approved untuk seluruh sisa hutang siswa,
     *                            invoice diupdate jadi paid (audit trail tercatat di invoice_waivers).
     */
    public function graduate(array $graduations): array
    {
        $graduated = 0;
        $waivedStudents = 0;
        $waiverRecords = 0;
        $waiverTotal = 0.0;
        $userId = Auth::id();

        DB::transaction(function () use (
            $graduations, $userId,
            &$graduated, &$waivedStudents, &$waiverRecords, &$waiverTotal
        ) {
            foreach ($graduations as $g) {
                $student = Student::find($g['student_id']);
                if (!$student) {
                    continue;
                }

                $action = $g['action'] ?? 'graduate';
                $reason = trim((string) ($g['waiver_reason'] ?? ''));

                // Pemutihan: untuk semua invoice unpaid/partial, generate waiver auto-approved.
                if ($action === 'graduate_with_waiver') {
                    if ($reason === '') {
                        // Skip — alasan wajib untuk audit. Controller harus validasi sebelum sampai sini.
                        continue;
                    }

                    $unpaidInvoices = Invoice::where('student_id', $student->id)
                        ->where('status', '!=', 'paid')
                        ->get();

                    $studentWaiverCount = 0;
                    foreach ($unpaidInvoices as $inv) {
                        $sisa = (float) $inv->nominal_tagihan - (float) $inv->nominal_terbayar;
                        if ($sisa <= 0) {
                            continue;
                        }

                        InvoiceWaiver::create([
                            'invoice_id'   => $inv->id,
                            'amount'       => $sisa,
                            'reason'       => $reason,
                            'status'       => 'kepsek_approved',
                            'requested_by' => $userId,
                            'approved_by'  => $userId,
                        ]);

                        // Sesuaikan invoice: nominal dikurangi waiver, status jadi paid.
                        $inv->nominal_tagihan = (float) $inv->nominal_tagihan - $sisa;
                        if ((float) $inv->nominal_terbayar >= (float) $inv->nominal_tagihan) {
                            $inv->status = 'paid';
                        }
                        $inv->save();

                        $studentWaiverCount++;
                        $waiverTotal += $sisa;
                    }
                    if ($studentWaiverCount > 0) {
                        $waivedStudents++;
                        $waiverRecords += $studentWaiverCount;
                    }
                }

                // Tandai semua active enrollment sebagai graduated.
                StudentEnrollment::where('student_id', $student->id)
                    ->where('status', 'active')
                    ->update(['status' => 'graduated']);

                // Update status siswa
                $student->update([
                    'status'           => 'alumni',
                    'current_class_id' => null,
                ]);
                $graduated++;
            }
        });

        return [
            'graduated'       => $graduated,
            'waived_students' => $waivedStudents,
            'waiver_records'  => $waiverRecords,
            'waiver_total'    => round($waiverTotal, 2),
        ];
    }

    /**
     * Get students in the source class with their unpaid balance summary
     * (for Clearance Check display).
     */
    public function clearanceReportFor(int $sourceClassId): Collection
    {
        return Student::where('current_class_id', $sourceClassId)
            ->where('status', 'aktif')
            ->with(['invoices' => function ($q) {
                $q->where('status', '!=', 'paid');
            }])
            ->orderBy('nama_lengkap')
            ->get()
            ->map(function (Student $student) {
                $unpaid = $student->invoices;
                $totalDebt = $unpaid->sum(function ($inv) {
                    return (float) $inv->nominal_tagihan - (float) $inv->nominal_terbayar;
                });
                return [
                    'id'              => $student->id,
                    'nis'             => $student->nis,
                    'nama_lengkap'    => $student->nama_lengkap,
                    'unpaid_count'    => $unpaid->count(),
                    'total_tunggakan' => $totalDebt,
                    'is_clear'        => $totalDebt <= 0,
                ];
            });
    }
}
