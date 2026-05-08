<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    
    // Dev Login
    Route::get('login2', [\App\Http\Controllers\DevLoginController::class, 'show'])->name('login2');
    Route::post('login2', [\App\Http\Controllers\DevLoginController::class, 'login']);
});

Route::middleware(['auth'])->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Master Data Siswa
    Route::resource('siswa', \App\Http\Controllers\StudentController::class)
        ->except(['create', 'edit'])
        ->parameters(['siswa' => 'siswa']);
    Route::post('siswa/{id}/restore', [\App\Http\Controllers\StudentController::class, 'restore'])->name('siswa.restore');
    Route::delete('siswa/{id}/force', [\App\Http\Controllers\StudentController::class, 'forceDelete'])->name('siswa.force-delete');

    // Master Data Guru
    Route::resource('guru', \App\Http\Controllers\TeacherController::class)
        ->except(['create', 'edit'])
        ->parameters(['guru' => 'guru']);
    Route::post('guru/{id}/restore', [\App\Http\Controllers\TeacherController::class, 'restore'])->name('guru.restore');
    Route::delete('guru/{id}/force', [\App\Http\Controllers\TeacherController::class, 'forceDelete'])->name('guru.force-delete');

    // Master Rekening
    Route::resource('akun', \App\Http\Controllers\MasterData\AccountController::class)->except(['create', 'edit', 'show']);

    // Master Tarif
    Route::resource('tarif', \App\Http\Controllers\MasterData\TariffController::class)->except(['create', 'edit', 'show']);
    Route::post('tarif/{tarif}/issue-invoices', [\App\Http\Controllers\MasterData\TariffController::class, 'issueInvoices'])->name('tarif.issue-invoices');

    // Kenaikan Kelas (Promotion Workflow + Clearance Check)
    Route::get('kenaikan-kelas', [\App\Http\Controllers\PromotionController::class, 'index'])->name('kenaikan-kelas.index');
    Route::post('kenaikan-kelas/execute', [\App\Http\Controllers\PromotionController::class, 'execute'])->name('kenaikan-kelas.execute');

    // Pemetaan Kelas (Plotting Queue)
    Route::get('plotting', [\App\Http\Controllers\PlottingController::class, 'index'])->name('plotting.index');
    Route::post('plotting/execute', [\App\Http\Controllers\PlottingController::class, 'execute'])->name('plotting.execute');

    // Dashboard Tunggakan Lintas Kelas
    Route::get('tunggakan-dashboard', [\App\Http\Controllers\OutstandingDashboardController::class, 'index'])->name('tunggakan-dashboard.index');


    // --- MODUL KELULUSAN ---
    Route::get('kelulusan', [\App\Http\Controllers\Academic\GraduationController::class, 'index'])->name('kelulusan.index');
    Route::post('kelulusan/adjustment', [\App\Http\Controllers\Academic\GraduationController::class, 'applyAdjustment'])->name('kelulusan.adjustment');
    Route::post('kelulusan/graduate', [\App\Http\Controllers\Academic\GraduationController::class, 'graduate'])->name('kelulusan.graduate');
    Route::get('kelulusan/report', [\App\Http\Controllers\Academic\GraduationController::class, 'report'])->name('kelulusan.report');

    // Master RKAS (C1: + repair endpoint, C2: + approval lifecycle + COA)
    Route::resource('rkas', \App\Http\Controllers\MasterData\RkasBudgetController::class)->except(['create', 'edit', 'show']);
    Route::post('rkas/{rka}/recompute-terpakai', [\App\Http\Controllers\MasterData\RkasBudgetController::class, 'recomputeTerpakai'])->name('rkas.recompute-terpakai');
    Route::post('rkas/{rka}/approve', [\App\Http\Controllers\MasterData\RkasBudgetController::class, 'approve'])->name('rkas.approve');
    Route::post('rkas/{rka}/archive', [\App\Http\Controllers\MasterData\RkasBudgetController::class, 'archive'])->name('rkas.archive');

    // Master RKAS Account (Chart of Accounts)
    Route::resource('rkas-account', \App\Http\Controllers\MasterData\RkasAccountController::class)
        ->except(['create', 'edit', 'show'])
        ->parameters(['rkas-account' => 'rkas_account']);

    // C3 Reports — RKAS Variance & Cash Flow
    Route::get('laporan-rkas/variance', [\App\Http\Controllers\Report\RkasReportController::class, 'variance'])->name('laporan-rkas.variance');
    Route::get('laporan-rkas/cash-flow', [\App\Http\Controllers\Report\RkasReportController::class, 'cashFlow'])->name('laporan-rkas.cash-flow');

    // Master Kategori Biaya
    Route::resource('kategori-biaya', \App\Http\Controllers\MasterData\ExpenseCategoryController::class)->except(['create', 'edit', 'show']);

    // Master Akademik & Siswa
    Route::resource('tahun-ajaran', \App\Http\Controllers\MasterData\AcademicYearController::class)->except(['create', 'edit', 'show']);
    Route::resource('kelas', \App\Http\Controllers\MasterData\SchoolClassController::class)->except(['create', 'edit', 'show']);
    Route::post('kelas/clone', [\App\Http\Controllers\MasterData\SchoolClassController::class, 'clone'])->name('kelas.clone');
    Route::resource('jenis-siswa', \App\Http\Controllers\MasterData\StudentTypeController::class)->except(['create', 'edit', 'show']);
    
    // --- MODUL PPDB (Penerimaan Siswa Baru) ---
    Route::resource('ppdb', \App\Http\Controllers\MasterData\ProspectiveStudentController::class)->except(['create', 'edit', 'show', 'destroy']);
    Route::post('ppdb/{ppdb}/activate', [\App\Http\Controllers\MasterData\ProspectiveStudentController::class, 'activate'])->name('ppdb.activate');

    // --- MODUL INBOUND (PENERIMAAN) ---
    Route::get('tagihan/export/pdf', [\App\Http\Controllers\Inbound\InvoiceController::class, 'exportPdf'])->name('tagihan.export.pdf');
    Route::get('tagihan/export/excel', [\App\Http\Controllers\Inbound\InvoiceController::class, 'exportExcel'])->name('tagihan.export.excel');
    Route::post('tagihan/generate-bills', [\App\Http\Controllers\Inbound\InvoiceController::class, 'generateBills'])->name('tagihan.generate-bills');
    Route::post('tagihan/{invoice}/waiver', [\App\Http\Controllers\Inbound\InvoiceController::class, 'submitWaiver'])->name('tagihan.waiver.submit');
    Route::post('tagihan/waiver/{waiver}/approve', [\App\Http\Controllers\Inbound\InvoiceController::class, 'approveWaiver'])->name('tagihan.waiver.approve');
    
    Route::get('tagihan', [\App\Http\Controllers\Inbound\InvoiceController::class, 'index'])->name('tagihan.index');
    Route::get('tagihan/{invoice}', [\App\Http\Controllers\Inbound\InvoiceController::class, 'show'])->name('tagihan.show');
    
    Route::get('pembayaran', [\App\Http\Controllers\Inbound\InboundPaymentController::class, 'index'])->name('pembayaran.index');
    Route::post('pembayaran', [\App\Http\Controllers\Inbound\InboundPaymentController::class, 'store'])->name('pembayaran.store');
    Route::post('pembayaran/{pembayaran}/approve', [\App\Http\Controllers\Inbound\InboundPaymentController::class, 'approve'])->name('pembayaran.approve');
    Route::post('pembayaran/{pembayaran}/reject', [\App\Http\Controllers\Inbound\InboundPaymentController::class, 'reject'])->name('pembayaran.reject');
    Route::get('pembayaran/{pembayaran}/print', [\App\Http\Controllers\Inbound\InboundPaymentController::class, 'printReceipt'])->name('pembayaran.print');

    // --- MODUL OUTBOUND (PENGELUARAN) ---
    Route::resource('pengajuan', \App\Http\Controllers\Outbound\OutboundRequestController::class)
        ->except(['create', 'edit']);
    Route::post('pengajuan/{pengajuan}/approve', [\App\Http\Controllers\Outbound\OutboundRequestController::class, 'approve'])->name('pengajuan.approve');
    Route::post('pengajuan/{pengajuan}/disburse', [\App\Http\Controllers\Outbound\OutboundRequestController::class, 'disburse'])->name('pengajuan.disburse');

    // --- MODUL PAYROLL ---
    Route::get('absensi', [\App\Http\Controllers\Payroll\AttendanceController::class, 'index'])->name('absensi.index');
    Route::post('absensi', [\App\Http\Controllers\Payroll\AttendanceController::class, 'store'])->name('absensi.store');

    // Master Komponen Gaji & Penugasan (Phase B1)
    Route::resource('komponen-gaji', \App\Http\Controllers\Payroll\PayrollComponentController::class)
        ->except(['create', 'edit', 'show'])
        ->parameters(['komponen-gaji' => 'komponen_gaji']);

    Route::resource('penugasan-gaji', \App\Http\Controllers\Payroll\PayrollAssignmentController::class)
        ->except(['create', 'edit', 'show'])
        ->parameters(['penugasan-gaji' => 'penugasan_gaji']);
    Route::post('penugasan-gaji/{penugasan_gaji}/end-now', [\App\Http\Controllers\Payroll\PayrollAssignmentController::class, 'endNow'])
        ->name('penugasan-gaji.end-now');

    Route::get('penggajian', [\App\Http\Controllers\Payroll\PayrollController::class, 'index'])->name('penggajian.index');
    Route::get('penggajian/{payroll}', [\App\Http\Controllers\Payroll\PayrollController::class, 'show'])->name('penggajian.show');
    Route::post('penggajian/generate', [\App\Http\Controllers\Payroll\PayrollController::class, 'generate'])->name('penggajian.generate');
    Route::post('penggajian/{payroll}/approve', [\App\Http\Controllers\Payroll\PayrollController::class, 'approve'])->name('penggajian.approve');
    Route::post('penggajian/{payroll}/pay', [\App\Http\Controllers\Payroll\PayrollController::class, 'pay'])->name('penggajian.pay');
    // B2: manual adjustment endpoints
    Route::post('penggajian/{payroll}/items', [\App\Http\Controllers\Payroll\PayrollController::class, 'addItem'])->name('penggajian.items.add');
    Route::put('penggajian/{payroll}/items/{item}', [\App\Http\Controllers\Payroll\PayrollController::class, 'editItem'])->name('penggajian.items.edit');
    Route::delete('penggajian/{payroll}/items/{item}', [\App\Http\Controllers\Payroll\PayrollController::class, 'removeItem'])->name('penggajian.items.remove');

    // B3: Slip + Reports
    Route::get('penggajian/{payroll}/slip', [\App\Http\Controllers\Payroll\PayrollReportController::class, 'slipGaji'])->name('penggajian.slip');
    Route::get('laporan-payroll/rekap', [\App\Http\Controllers\Payroll\PayrollReportController::class, 'rekapGaji'])->name('laporan-payroll.rekap');
    Route::get('laporan-payroll/mutasi-potongan', [\App\Http\Controllers\Payroll\PayrollReportController::class, 'mutasiPotongan'])->name('laporan-payroll.mutasi-potongan');
    Route::get('laporan-payroll/audit-kepegawaian', [\App\Http\Controllers\Payroll\PayrollReportController::class, 'auditKepegawaian'])->name('laporan-payroll.audit-kepegawaian');

    // --- MODUL LAPORAN ---
    Route::get('laporan', [\App\Http\Controllers\Report\ReportController::class, 'index'])->name('laporan.index');

    // --- PENGATURAN ---
    Route::get('pengaturan-sekolah', [\App\Http\Controllers\MasterData\SchoolSettingController::class, 'index'])->name('school-settings.index');
    Route::patch('pengaturan-sekolah', [\App\Http\Controllers\MasterData\SchoolSettingController::class, 'update'])->name('school-settings.update');
});
