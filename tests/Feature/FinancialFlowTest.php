<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\InboundPayment;
use App\Models\Invoice;
use App\Models\OutboundRequest;
use App\Models\RkasBudget;
use App\Models\Student;
use App\Models\Tariff;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class FinancialFlowTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $student;
    protected $teacher;
    protected $account;
    protected $tariff;
    protected $rkas;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);

        $this->student = Student::create([
            'nis' => '12345',
            'nama_lengkap' => 'Siswa Test',
            'nama_panggilan' => 'Siswa',
            'tahun_angkatan' => 2024,
            'jenis_siswa' => 'reguler',
            'nama_wali' => 'Wali Siswa',
            'no_hp_wali' => '08123456789',
            'status' => 'aktif',
        ]);

        $this->teacher = Teacher::create([
            'nip' => 'G001',
            'nama_lengkap' => 'Guru Test',
            'jabatan' => 'Guru Kelas',
            'gaji_pokok' => 2000000,
            'bonus_hadir' => 10000,
            'denda_alfa' => 50000,
            'tunjangan_tetap' => 500000,
            'status' => 'aktif',
        ]);

        $this->account = Account::create([
            'nama_rekening' => 'Kas Sekolah',
            'bank' => 'BCA',
            'nomor_rekening' => '123456789',
            'saldo' => 5000000,
            'jenis' => 'operasional',
        ]);

        $this->tariff = Tariff::create([
            'nama_tarif' => 'SPP Bulanan',
            'jenis_tarif' => 'spp',
            'jenis_siswa' => 'reguler',
            'nominal' => 250000,
            'tahun_berlaku' => 2024,
        ]);

        $this->rkas = RkasBudget::create([
            'kode_rkas' => 'A.1',
            'uraian' => 'Biaya Operasional',
            'kategori_utama' => 'Operasional',
            'sub_kategori' => 'Alat Tulis',
            'pagu_anggaran' => 10000000,
            'terpakai' => 0,
            'tahun_anggaran' => 2024,
        ]);
    }

    /** @test */
    public function inbound_payment_increases_account_balance_after_approval()
    {
        $invoice = Invoice::create([
            'student_id' => $this->student->id,
            'tariff_id' => $this->tariff->id,
            'periode' => '2024-05-01',
            'nominal_tagihan' => 250000,
            'nominal_terbayar' => 0,
            'status' => 'unpaid',
            'jatuh_tempo' => '2024-05-10',
        ]);

        $payment = InboundPayment::create([
            'invoice_id' => $invoice->id,
            'student_id' => $this->student->id,
            'account_id' => $this->account->id,
            'total_bayar' => 250000,
            'jenis_bayar' => 'lunas',
            'jenis_transaksi' => 'tunai',
            'status_approval' => 'pending',
            'dibuat_oleh' => $this->admin->id,
        ]);

        $this->assertEquals('pending', $payment->status_approval);
        $this->assertEquals(5000000, $this->account->fresh()->saldo);

        // Approve payment
        $this->actingAs($this->admin)
            ->post(route('pembayaran.approve', $payment))
            ->assertRedirect();

        $this->assertEquals('approved', $payment->fresh()->status_approval);
        $this->assertEquals(5250000, $this->account->fresh()->saldo);
        $this->assertEquals(250000, $invoice->fresh()->nominal_terbayar);
        $this->assertEquals('paid', $invoice->fresh()->status);
    }

    /** @test */
    public function outbound_request_decreases_account_balance_after_disbursement()
    {
        $request = OutboundRequest::create([
            'rkas_id' => $this->rkas->id,
            'account_id' => $this->account->id,
            'judul_pengajuan' => 'Beli Alat Tulis',
            'deskripsi' => 'Pembelian alat tulis kantor bulanan',
            'nominal' => 500000,
            'jenis_pengajuan' => 'sekolah',
            'status_approval' => 'pending',
            'dibuat_oleh' => $this->admin->id,
        ]);

        $this->assertEquals('pending', $request->status_approval);

        $this->actingAs($this->admin);

        // Approve
        $this->post(route('pengajuan.approve', $request))
            ->assertRedirect();
        
        $this->assertEquals('approved', $request->fresh()->status_approval);
        $this->assertEquals(5000000, $this->account->fresh()->saldo);

        // Disburse
        $this->post(route('pengajuan.disburse', $request))
            ->assertRedirect();

        $this->assertEquals('disbursed', $request->fresh()->status_approval);
        $this->assertEquals(4500000, $this->account->fresh()->saldo);
        $this->assertEquals(500000, $this->rkas->fresh()->terpakai);
    }
}
