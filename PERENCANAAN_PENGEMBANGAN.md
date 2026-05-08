# PERENCANAAN PENGEMBANGAN SISTEM ERP KEUANGAN TK ATTAUHID
**Versi:** 1.2.0 | **Tanggal:** 30 April 2026 | **Status:** Draft Aktif

---

## 1. RINGKASAN EKSEKUTIF

**Nama Produk:** Sistem ERP Keuangan Sekolah & Manajemen Payroll Guru
**Klien:** TK Attauhid
**Platform:** Web-Based SPA (Single Page Application)

### Visi
Menciptakan ekosistem keuangan sekolah yang 100% digital, transparan, dan bebas dari manipulasi (fraud-proof) melalui sistem persetujuan berjenjang dan rekam jejak audit yang permanen.

### Tujuan Bisnis
- Mengotomatisasi 80% tugas administratif bendahara (penagihan SPP, pencatatan cicilan, rekapitulasi laporan)
- Memastikan tidak ada aliran dana keluar/masuk yang tidak tervalidasi oleh Kepala Sekolah atau Yayasan
- Menyediakan sistem penggajian guru yang transparan, otomatis berbasis absensi, dan terdokumentasi
- Menyediakan dashboard pelaporan real-time untuk pimpinan

### Fokus Pengembangan (MVP Phase 1)
> Pengembangan difokuskan pada **Sistem Keuangan Sekolah** dan **Sistem Penggajian Karyawan**.
> Modul POS Koperasi akan dikembangkan pada **Phase 2** setelah sistem keuangan inti stabil.

| Phase | Modul | Status |
|-------|-------|--------|
| **Phase 1 (MVP)** | Core System, Penerimaan, Pengeluaran, Payroll, Dashboard | 🚀 Aktif |
| **Phase 2** | POS Koperasi, WhatsApp Gateway, Payment Gateway | 📅 Berikutnya |

### Identitas Visual
| Elemen | Kode Warna | RGB |
|--------|-----------|-----|
| Biru (Primer) | `#35A9E0` | R:53 G:168 B:224 |
| Hijau (Sekunder) | `#80B742` | R:128 G:183 B:66 |
| Orange (Aksen) | `#FB912B` | R:251 G:145 B:43 |

---

## 2. TECH STACK & ARSITEKTUR

### Stack Teknologi — Phase 1 (MVP)

| Layer | Teknologi |
|-------|-----------|
| **Backend Framework** | Laravel 11 |
| **Frontend Framework** | React.js via Inertia.js (SPA Architecture) |
| **Styling** | Tailwind CSS + Headless UI Components |
| **Database** | PostgreSQL |
| **PDF Generation** | barryvdh/laravel-dompdf |
| **Excel Export** | maatwebsite/laravel-excel |
| **RBAC** | spatie/laravel-permission |
| **Audit Log** | spatie/laravel-activitylog |
| **File Management** | spatie/laravel-medialibrary |
| **Notifikasi In-App** | Laravel Notifications (database driver) |
| **Charts** | Recharts (Phase 2) |

> **Phase 2 tambahan:** Zustand (state management POS cart), PosLayout, barcode listener

### Arsitektur Sistem
```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (React SPA)                  │
│  ┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Inertia.js│ │  React   │ │Tailwind  │ │  Headless UI │  │
│  │  (Router) │ │  Hooks   │ │  (Style) │ │ (Components) │  │
│  └───────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (Inertia Protocol)
┌────────────────────────▼────────────────────────────────────┐
│                     LARAVEL 11 BACKEND                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Controller│ │  Policy  │ │FormRequest│ │  Middleware  │  │
│  │  (HTTP)  │ │  (Auth)  │ │(Validate)│ │    (RBAC)    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Eloquent │ │ Observer │ │  DomPDF  │ │   Scheduler  │  │
│  │  (ORM)   │ │(Mutation)│ │  (PDF)   │ │  (Cron Job)  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                       PostgreSQL                            │
│  [students] [teachers] [accounts] [inbound_payments]       │
│  [outbound_requests] [payrolls] [tariffs] [rkas_budgets]   │
│  [invoices] [attendances] [users] [notifications]          │
│  [activity_log]                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. PERAN PENGGUNA (USER ROLES & PERMISSIONS)

### Matriks Hak Akses — Phase 1

| Modul / Fitur | Super Admin | Bendahara | Admin/HR | Kepala Sekolah | Yayasan |
|---|:---:|:---:|:---:|:---:|:---:|
| **Manajemen User & Role** | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| **Master Data Siswa** | ✅ CRUD | ✅ CRUD | ❌ | 👁️ View | 👁️ View |
| **Master Data Guru** | ✅ CRUD | ✅ CRUD | ✅ CRUD | 👁️ View | 👁️ View |
| **Master Rekening** | ✅ CRUD | ✅ CRUD | ❌ | 👁️ View | 👁️ View |
| **Master Tarif & RKAS** | ✅ CRUD | ✅ CRUD | ❌ | 👁️ View | 👁️ View |
| **Input Pembayaran SPP** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Approve Pembayaran** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Input Pengajuan Dana** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Konfirmasi Pencairan Dana** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Approve Pengajuan (TK)** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Approve Pengajuan (Yayasan)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Input Absensi Guru** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Generate Draft Payroll** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Approve Payroll** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Konfirmasi Pembayaran Gaji** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Cetak Slip Gaji** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Dashboard Laporan** | ✅ Full | 👁️ Terbatas | ❌ | ✅ Full | ✅ Full |
| **Export Laporan** | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Audit Log** | ✅ | ❌ | ❌ | ✅ | ✅ |

> **Catatan:** `super_admin` memiliki akses penuh ke seluruh sistem termasuk manajemen user, role, dan konfigurasi. Role ini tidak digunakan untuk operasional harian.

---

## 4. ARSITEKTUR DATABASE (SCHEMA LENGKAP)

> **Aturan Wajib:**
> - Semua tabel transaksional WAJIB menggunakan `SoftDeletes` (kolom `deleted_at`)
> - Semua field moneter menggunakan `DECIMAL(15,2)`
> - Kolom `sisa_hutang` dan `sisa_pagu` adalah **Laravel Accessor** (bukan kolom DB), dihitung secara dinamis via model

### 4.1 Master Data

#### Tabel `users`
```sql
id, name, email, password (bcrypt), remember_token,
email_verified_at, created_at, updated_at, deleted_at
-- Relasi: spatie/laravel-permission (model_has_roles, roles, permissions)
```

#### Tabel `students` (Data Siswa)
```sql
id, nis (unique), nama_lengkap, nama_panggilan,
tahun_angkatan (year),
jenis_siswa (enum: 'reguler', 'reguler_opsi2', 'fullday'),
nama_wali, no_hp_wali, status (enum: 'aktif', 'alumni', 'keluar'),
created_at, updated_at, deleted_at
```

#### Tabel `teachers` (Data Guru)
```sql
id, nip (unique), nama_lengkap, jabatan, no_hp,
gaji_pokok (decimal), bonus_hadir (decimal), denda_alfa (decimal),
tunjangan_tetap (decimal),
nama_bank (string, nullable), nomor_rekening_bank (string, nullable),
status (enum: 'aktif', 'nonaktif'),
created_at, updated_at, deleted_at
```

#### Tabel `accounts` (Rekening Sekolah)
```sql
id, nama_rekening, bank, nomor_rekening (unique),
saldo (decimal, default: 0),
jenis (enum: 'operasional', 'gaji'),
created_at, updated_at
-- Phase 2: tambah jenis 'koperasi' saat modul POS diaktifkan
```

#### Tabel `tariffs` (Tarif SPP & Biaya)
```sql
id, nama_tarif,
jenis_tarif (enum: 'spp', 'dsp', 'kegiatan_tahunan', 'seragam', 'pendaftaran', 'snack'),
jenis_siswa (enum: 'reguler', 'reguler_opsi2', 'fullday', 'all'),
nominal (decimal), tahun_berlaku (year),
created_at, updated_at
```

#### Tabel `rkas_budgets` (Anggaran RKAS)
```sql
id, kode_rkas, uraian, kategori_utama (string), sub_kategori (string),
pagu_anggaran (decimal), terpakai (decimal, default: 0),
-- sisa_pagu = pagu_anggaran - terpakai → dihitung via Laravel Accessor
tahun_anggaran (year), created_at, updated_at
-- Contoh kategori: 'Pengembangan Perizinan', 'Standar Isi', 'Standar Proses', 'Standar Pengelolaan'
```

### 4.2 Modul Inbound (Penerimaan)

#### Tabel `invoices` (Tagihan Siswa)
```sql
id, student_id (FK→students), tariff_id (FK→tariffs),
periode (date: YYYY-MM-01), nominal_tagihan (decimal),
nominal_terbayar (decimal, default: 0),
-- sisa_hutang = nominal_tagihan - nominal_terbayar → dihitung via Laravel Accessor
status (enum: 'unpaid', 'partial', 'paid'),
jatuh_tempo (date),
created_at, updated_at, deleted_at
-- Auto-generated via Laravel Scheduler setiap tanggal 1
```

#### Tabel `inbound_payments` (Penerimaan Pembayaran)
```sql
id, invoice_id (FK→invoices), student_id (FK→students),
account_id (FK→accounts),
total_bayar (decimal), jenis_bayar (enum: 'lunas', 'cicilan'),
jenis_transaksi (enum: 'tunai', 'transfer'),
catatan (text, nullable),
status_approval (enum: 'pending', 'approved', 'rejected'),
approved_by (FK→users, nullable), approved_at (timestamp, nullable),
dibuat_oleh (FK→users),
created_at, updated_at, deleted_at
-- Spatie Media Library: koleksi 'bukti_bayar'
```

### 4.3 Modul Outbound (Pengeluaran)

#### Tabel `outbound_requests` (Pengajuan Dana)
```sql
id, rkas_id (FK→rkas_budgets, nullable), account_id (FK→accounts),
judul_pengajuan (string), deskripsi (text),
nominal (decimal),
jenis_pengajuan (enum: 'sekolah', 'yayasan'),
status_approval (enum: 'pending', 'approved', 'revised', 'rejected', 'disbursed'),
catatan_reviewer (text, nullable),
approved_by (FK→users, nullable), approved_at (timestamp, nullable),
disbursed_by (FK→users, nullable), disbursed_at (timestamp, nullable),
dibuat_oleh (FK→users),
created_at, updated_at, deleted_at
-- Spatie Media Library: koleksi 'nota_rab' (multi-file: jpg, jpeg, png, pdf, max 2MB/file)
-- Status 'disbursed' dikonfirmasi oleh Bendahara setelah approved
```

### 4.4 Modul Payroll

#### Tabel `attendances` (Absensi Guru)
```sql
id, teacher_id (FK→teachers), admin_id (FK→users),
tanggal (date), status (enum: 'hadir', 'alfa', 'izin', 'sakit'),
keterangan (text, nullable),
created_at, updated_at
```

#### Tabel `payrolls` (Data Penggajian)
```sql
id, teacher_id (FK→teachers), periode (date: YYYY-MM-01),
jumlah_hadir (integer), jumlah_alfa (integer),
jumlah_izin (integer), jumlah_sakit (integer),
gaji_pokok (decimal), tunjangan (decimal),
bonus_kehadiran (decimal), potongan_alfa (decimal),
potongan_lain (decimal, default: 0),
total_take_home_pay (decimal),
catatan (text, nullable),
status_approval (enum: 'draft', 'approved', 'paid'),
approved_by (FK→users, nullable), approved_at (timestamp, nullable),
paid_by (FK→users, nullable), paid_at (timestamp, nullable),
created_at, updated_at, deleted_at
-- Rumus: total_thp = gaji_pokok + tunjangan + (hadir * bonus) - (alfa * denda)
-- Status 'paid' dikonfirmasi oleh Bendahara setelah pencairan gaji dilakukan
```

### 4.5 Notifikasi

#### Tabel `notifications` (Laravel Default)
```sql
-- Digunakan oleh Laravel Notifications (database driver)
-- Auto-generated via: php artisan notifications:table
id (uuid), type, notifiable_type, notifiable_id,
data (json), read_at (timestamp, nullable),
created_at, updated_at
```

> **Phase 2 — Tabel POS:**
> `products`, `pos_shifts`, `pos_sales`, `pos_sale_items` — akan dibuat saat pengembangan Phase 2.

---

## 5. ATURAN LOGIKA BISNIS KRITIS

### 5.1 Pattern Observer untuk Mutasi Saldo (CRITICAL — Anti Race Condition)
```
JANGAN mutasi saldo di Controller HTTP.

Observer yang aktif di Phase 1:
- InboundPaymentObserver → hook pada updated()
  → Jika status_approval: pending → approved: TAMBAH saldo account

- OutboundRequestObserver → hook pada updated()
  → Jika status_approval: approved → disbursed: KURANGI saldo account
  → Update rkas.terpakai += nominal (jika rkas_id != null)
  → CATATAN: saldo hanya dikurangi saat Bendahara konfirmasi pencairan (disbursed),
    BUKAN saat approved. approved = izin pimpinan, disbursed = uang keluar nyata.

- PayrollObserver → hook pada updated()
  → Jika status_approval: approved → paid: KURANGI saldo account gaji

Semua operasi saldo dibungkus DB::transaction() untuk atomicity.
```

### 5.2 State Machine Cicilan SPP
```
Invoice::nominal_tagihan = Rp X
Invoice::nominal_terbayar = Rp Y  (total yang sudah terbayar sebelumnya)
Inbound Payment Input: total_bayar = Rp Z  (pembayaran baru)

Setelah approved:
  UPDATE invoice.nominal_terbayar += Z

  IF nominal_terbayar >= nominal_tagihan → invoice.status = 'paid'
  IF nominal_terbayar < nominal_tagihan  → invoice.status = 'partial'

  sisa_hutang = nominal_tagihan - nominal_terbayar  ← dihitung via Accessor

Validasi Laravel FormRequest:
  - total_bayar > 0                          (anti-minus/nol)
  - total_bayar <= invoice.sisa_hutang       (anti-overpay)
```

### 5.3 Smart Routing Approval Pengeluaran
```
OutboundRequest.jenis_pengajuan == 'sekolah'
→ Notifikasi dikirim ke semua user dengan role: kepala_sekolah
→ Tombol Approve/Reject/Revisi hanya muncul untuk role: kepala_sekolah

OutboundRequest.jenis_pengajuan == 'yayasan'
→ Notifikasi dikirim ke semua user dengan role: yayasan
→ Tombol Approve/Reject/Revisi hanya muncul untuk role: yayasan

Setelah approved:
→ Notifikasi dikirim ke Bendahara (siap cair)
→ Bendahara konfirmasi pencairan → status berubah ke 'disbursed'
→ OutboundRequestObserver trigger: kurangi saldo + update RKAS
```

### 5.4 Validasi RKAS Budget
```
Sebelum OutboundRequest disimpan:
  IF rkas_id != null:
    sisa_pagu = rkas.pagu_anggaran - rkas.terpakai
    IF nominal > sisa_pagu → REJECT: "Nominal melebihi sisa pagu RKAS"

Setelah OutboundRequest DISBURSED (bukan saat approved):
  UPDATE rkas.terpakai += nominal
```

### 5.5 Auto-Invoice Scheduler
```
php artisan schedule:run  (setiap hari via server cron)

Command: GenerateMonthlyInvoices
→ Dieksekusi tanggal 1 setiap bulan
→ Loop semua students WHERE status = 'aktif'
→ Buat invoice berdasarkan tariff yang berlaku (jenis_siswa & tahun_angkatan)
→ Skip jika invoice periode tersebut sudah ada (idempotent)
```

### 5.6 Formula Kalkulasi Payroll
```
Rekap dari tabel attendances (periode bulan berjalan):
  jumlah_hadir = COUNT(tanggal) WHERE status = 'hadir'
  jumlah_alfa  = COUNT(tanggal) WHERE status = 'alfa'
  jumlah_izin  = COUNT(tanggal) WHERE status = 'izin'
  jumlah_sakit = COUNT(tanggal) WHERE status = 'sakit'

Ambil komponen gaji dari teacher:
  gaji_pokok, tunjangan_tetap, bonus_hadir, denda_alfa

Kalkulasi:
  bonus_kehadiran  = jumlah_hadir * bonus_hadir
  potongan_alfa    = jumlah_alfa  * denda_alfa
  total_thp        = gaji_pokok + tunjangan_tetap + bonus_kehadiran
                   - potongan_alfa - potongan_lain

Semua nilai disalin ke tabel payrolls (snapshot) agar tidak berubah
jika data guru diedit di kemudian hari.
```

---

## 6. STRUKTUR DIREKTORI PROYEK

```
si_tk_new/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   ├── Admin/
│   │   │   │   └── UserController.php           ← CRUD user & assign role
│   │   │   ├── MasterData/
│   │   │   │   ├── StudentController.php
│   │   │   │   ├── TeacherController.php
│   │   │   │   ├── AccountController.php
│   │   │   │   ├── TariffController.php
│   │   │   │   └── RkasBudgetController.php
│   │   │   ├── Inbound/
│   │   │   │   ├── InvoiceController.php
│   │   │   │   └── InboundPaymentController.php
│   │   │   ├── Outbound/
│   │   │   │   └── OutboundRequestController.php
│   │   │   ├── Payroll/
│   │   │   │   ├── AttendanceController.php
│   │   │   │   └── PayrollController.php
│   │   │   ├── Report/
│   │   │   │   └── ReportController.php
│   │   │   ├── NotificationController.php        ← Mark-as-read notifikasi
│   │   │   └── DashboardController.php
│   │   ├── Requests/                             ← FormRequest (satu per use-case)
│   │   │   ├── StoreInboundPaymentRequest.php
│   │   │   ├── StoreOutboundRequestRequest.php
│   │   │   ├── StorePayrollRequest.php
│   │   │   └── ...
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Student.php
│   │   ├── Teacher.php
│   │   ├── Account.php
│   │   ├── Tariff.php
│   │   ├── RkasBudget.php         ← Accessor: getSisaPaguAttribute()
│   │   ├── Invoice.php            ← Accessor: getSisaHutangAttribute()
│   │   ├── InboundPayment.php
│   │   ├── OutboundRequest.php
│   │   ├── Attendance.php
│   │   └── Payroll.php
│   ├── Observers/                 ← CRITICAL: satu-satunya tempat mutasi saldo
│   │   ├── InboundPaymentObserver.php
│   │   ├── OutboundRequestObserver.php
│   │   └── PayrollObserver.php
│   ├── Notifications/
│   │   ├── PembayaranPendingApproval.php
│   │   ├── PengajuanPendingApproval.php
│   │   ├── PengajuanReadyToDisburs.php
│   │   └── PayrollPendingApproval.php
│   ├── Helpers/
│   │   └── TerbilangHelper.php    ← Angka → Teks (untuk PDF)
│   └── Console/
│       └── Commands/
│           └── GenerateMonthlyInvoices.php
├── resources/
│   ├── js/
│   │   ├── Pages/
│   │   │   ├── Auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Index.jsx
│   │   │   ├── Admin/
│   │   │   │   └── Users/        ← Index, Create, Edit
│   │   │   ├── MasterData/
│   │   │   │   ├── Students/     ← Index, Create, Edit
│   │   │   │   ├── Teachers/     ← Index, Create, Edit
│   │   │   │   ├── Accounts/
│   │   │   │   ├── Tariffs/
│   │   │   │   └── RkasBudgets/
│   │   │   ├── Inbound/
│   │   │   │   ├── Invoices/     ← Index, Show (detail cicilan)
│   │   │   │   └── Payments/     ← Index, Create, Show (approval)
│   │   │   ├── Outbound/
│   │   │   │   └── Requests/     ← Index, Create, Show (approval + disbursement)
│   │   │   ├── Payroll/
│   │   │   │   ├── Attendance/   ← Index, Create (input per hari / bulk)
│   │   │   │   └── Salary/       ← Index, Show (approval + konfirmasi bayar)
│   │   │   └── Reports/
│   │   │       └── Index.jsx     ← Filter + export
│   │   ├── Components/
│   │   │   ├── DataTable.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── ApprovalActions.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── CurrencyInput.jsx
│   │   │   └── NotificationBell.jsx
│   │   └── Layouts/
│   │       └── AppLayout.jsx
│   └── views/
│       └── pdf/
│           ├── kwitansi.blade.php
│           ├── invoice-tagihan.blade.php
│           ├── voucher-pencairan.blade.php
│           └── slip-gaji.blade.php
└── database/
    ├── migrations/
    └── seeders/
        ├── RolePermissionSeeder.php
        ├── AccountSeeder.php
        ├── TariffSeeder.php
        └── RkasBudgetSeeder.php
```

---

## 7. BREAKDOWN EPIC & USER STORY (SCOPE MVP PHASE 1)

### EPIC 1: MASTER DATA & CORE SYSTEM
**Sprint 1 — Estimasi: 1 Minggu**

| # | User Story | Priority |
|---|-----------|----------|
| 1.1 | Setup proyek Laravel 11 + React Inertia + Tailwind + Docker DB | P0 |
| 1.2 | Install & konfigurasi seluruh package (spatie, dompdf, excel, medialibrary) | P0 |
| 1.3 | Buat semua migrations + Seeder (Roles, Permissions, Akun, Tarif, RKAS) | P0 |
| 1.4 | Implementasi RBAC Middleware di Laravel & proteksi route React | P0 |
| 1.5 | Halaman Login & Sistem Auth (dengan rate limiting 5x/menit) | P0 |
| 1.6 | CRUD Manajemen User & Assign Role (hanya Super Admin) | P0 |
| 1.7 | CRUD Master Data Siswa (soft-delete, filter jenis siswa & tahun angkatan) | P0 |
| 1.8 | CRUD Master Data Guru (komponen gaji, info rekening bank) | P0 |
| 1.9 | CRUD Master Rekening Sekolah | P0 |
| 1.10 | CRUD Master Tarif SPP & Biaya | P0 |
| 1.11 | CRUD Master RKAS dengan indikator progress pagu terpakai | P0 |
| 1.12 | Komponen NotificationBell (badge counter, mark-as-read) | P0 |
| 1.13 | Audit Logging otomatis via spatie/activitylog | P0 |

---

### EPIC 2: MODUL PENERIMAAN (INBOUND)
**Sprint 2 — Estimasi: 1.5 Minggu**

| # | User Story | Aktor | Priority |
|---|-----------|-------|----------|
| 2.1 | Artisan Command: generate tagihan SPP bulanan otomatis (idempotent) | Sistem (Cron) | P0 |
| 2.2 | Halaman daftar invoice per siswa (filter: status, periode, jenis siswa) | Bendahara | P0 |
| 2.3 | Form input pembayaran: pilih jenis transaksi (tunai/transfer), kalkulasi cicilan real-time | Bendahara | P0 |
| 2.4 | Upload bukti transfer (opsional, via spatie/medialibrary) | Bendahara | P0 |
| 2.5 | Validasi backend: anti-minus, anti-overpay, pengecekan status invoice | Sistem | P0 |
| 2.6 | Notifikasi in-app ke Kepsek saat pembayaran baru masuk (pending approval) | Sistem | P0 |
| 2.7 | Halaman review & approval/reject pembayaran untuk Kepala Sekolah | Kepsek | P0 |
| 2.8 | InboundPaymentObserver: mutasi saldo rekening saat status → approved | Sistem | P0 |
| 2.9 | Generate PDF Kwitansi (dengan fitur Terbilang) setelah approved | Sistem | P0 |
| 2.10 | Generate PDF Surat Tagihan untuk siswa menunggak | Bendahara | P0 |
| 2.11 | Riwayat pembayaran per siswa (timeline cicilan) | Bendahara/Kepsek | P1 |

---

### EPIC 3: MODUL PENGELUARAN (OUTBOUND)
**Sprint 3 — Estimasi: 1.5 Minggu**

| # | User Story | Aktor | Priority |
|---|-----------|-------|----------|
| 3.1 | Form pengajuan dana: judul, deskripsi, nominal, kategori RKAS, jenis (TK/Yayasan) | Bendahara | P0 |
| 3.2 | Multi-file upload bukti (nota/RAB): validasi mimes & max 2MB, maks 5 file | Bendahara | P0 |
| 3.3 | Validasi backend: cek saldo rekening & cek pagu RKAS sebelum submit | Sistem | P0 |
| 3.4 | Smart Routing: notifikasi ke Kepsek (sekolah) atau Yayasan (yayasan) | Sistem | P0 |
| 3.5 | Halaman review & approve/reject/revisi untuk Kepsek | Kepsek | P0 |
| 3.6 | Halaman review & approve/reject untuk Yayasan | Yayasan | P0 |
| 3.7 | Notifikasi ke Bendahara setelah approved (siap dicairkan) | Sistem | P0 |
| 3.8 | Halaman konfirmasi pencairan oleh Bendahara (status → disbursed) | Bendahara | P0 |
| 3.9 | OutboundRequestObserver: debit saldo + update RKAS terpakai saat disbursed | Sistem | P0 |
| 3.10 | Generate PDF Voucher Pencairan setelah disbursed | Sistem | P0 |
| 3.11 | Daftar riwayat pengajuan dengan filter status & periode | Bendahara/Kepsek | P1 |

---

### EPIC 4: MODUL PAYROLL
**Sprint 4 — Estimasi: 1 Minggu**

| # | User Story | Aktor | Priority |
|---|-----------|-------|----------|
| 4.1 | Form input absensi guru per hari (hadir/alfa/izin/sakit) dengan bulk-input per bulan | Admin/HR | P0 |
| 4.2 | Rekap absensi bulanan per guru (tabel ringkasan) | Admin | P0 |
| 4.3 | Generate draft payroll dari rekap absensi (formula otomatis, snapshot data guru) | Bendahara | P0 |
| 4.4 | Notifikasi ke Kepsek: draft payroll periode X siap direview | Sistem | P0 |
| 4.5 | Halaman review draft payroll untuk Kepsek (bisa ajukan revisi ke Admin) | Kepsek | P0 |
| 4.6 | Halaman konfirmasi pembayaran gaji oleh Bendahara (status → paid) | Bendahara | P0 |
| 4.7 | PayrollObserver: debit saldo account gaji saat status → paid | Sistem | P0 |
| 4.8 | Generate PDF Slip Gaji per guru (dengan Terbilang) | Bendahara | P0 |
| 4.9 | Cetak slip gaji massal (batch per periode, satu PDF semua guru) | Bendahara | P1 |

---

### EPIC 5: DASHBOARD & LAPORAN
**Sprint 5 — Estimasi: 1 Minggu**

| # | User Story | Aktor | Priority |
|---|-----------|-------|----------|
| 5.1 | Dashboard Neraca: saldo rekening aktif, pemasukan vs pengeluaran bulan ini | Kepsek/Yayasan | P0 |
| 5.2 | Widget pending approval (pembayaran, pengajuan dana, payroll) | Kepsek/Yayasan | P0 |
| 5.3 | Laporan Penerimaan: filter periode (mingguan/bulanan/semester), export PDF & Excel | Kepsek/Yayasan | P0 |
| 5.4 | Laporan Pengeluaran: filter per kategori RKAS & periode, export PDF & Excel | Kepsek/Yayasan | P0 |
| 5.5 | Laporan Payroll: rekap gaji semua guru per periode, export PDF & Excel | Kepsek | P0 |
| 5.6 | Laporan Tunggakan SPP: daftar siswa dengan invoice partial/unpaid | Bendahara | P1 |
| 5.7 | Halaman Audit Trail: riwayat aktivitas pengguna (siapa, apa, kapan) | Kepsek/Yayasan | P1 |

---

## 8. PHASE 2 — PENGEMBANGAN LANJUTAN (Post-MVP)

| Fitur | Deskripsi | Estimasi |
|-------|-----------|----------|
| **🛒 Modul POS Koperasi** | Kasir full-screen, barcode scanner, cart Zustand, shift kasir, stok produk, struk PDF | 2 minggu |
| **💬 WhatsApp Gateway** | Notifikasi tagihan & kwitansi ke WA orang tua (via Wablas/Fonnte) | 3-5 hari |
| **📧 Email Slip Gaji** | Kirim slip PDF terkunci (password = tanggal lahir) ke email guru | 2-3 hari |
| **📊 Import Absensi CSV** | Upload CSV dari mesin fingerprint untuk auto-fill absensi guru | 3-4 hari |
| **📈 Interactive Charts** | Grafik arus kas dengan Recharts di dashboard | 2-3 hari |
| **💳 Payment Gateway** | Midtrans/Xendit untuk SPP via VA/QRIS (webhook auto-approve) | 1-2 minggu |

---

## 9. TIMELINE PENGEMBANGAN

| Sprint | Fokus | Durasi | Target Selesai |
|--------|-------|--------|----------------|
| **Sprint 0** | Setup environment, Docker DB, instalasi semua package, konfigurasi Inertia+Vite | 3-5 hari | 5 Mei 2026 |
| **Sprint 1** | Master Data & Core System (RBAC, auth, semua CRUD master) | 1 minggu | 12 Mei 2026 |
| **Sprint 2** | Modul Inbound (auto-invoice, cicilan, approval, PDF kwitansi) | 1.5 minggu | 22 Mei 2026 |
| **Sprint 3** | Modul Outbound (pengajuan, approval, disbursement, PDF voucher) | 1.5 minggu | 5 Juni 2026 |
| **Sprint 4** | Modul Payroll (absensi, draft, approval, slip gaji PDF) | 1 minggu | 12 Juni 2026 |
| **Sprint 5** | Dashboard & Laporan (neraca, export PDF/Excel) | 1 minggu | 19 Juni 2026 |
| **UAT & Fix** | User Acceptance Testing bersama klien + perbaikan bug | 1 minggu | 26 Juni 2026 |
| **Go-Live** | Deploy ke server produksi, training pengguna | — | 30 Juni 2026 |

**Total Estimasi Phase 1 MVP:** ±7 Minggu
**Phase 2 (POS + fitur lanjutan):** mulai Juli 2026

---

## 10. SETUP & INSTALASI PROYEK

### 10.1 Docker — Development Database

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: si_tk_attauhid
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
docker compose up -d   # start PostgreSQL untuk development
```

### 10.2 Inisialisasi Proyek

```bash
# Buat proyek Laravel 11
composer create-project laravel/laravel si_tk_new

# Install package backend
composer require spatie/laravel-permission
composer require spatie/laravel-activitylog
composer require spatie/laravel-medialibrary
composer require barryvdh/laravel-dompdf
composer require maatwebsite/excel
composer require inertiajs/inertia-laravel

# Install frontend
npm install
npm install @inertiajs/react react react-dom
npm install @headlessui/react @heroicons/react
npm install clsx

# Publish assets
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan vendor:publish --tag="activitylog-migrations"
php artisan notifications:table
php artisan storage:link

# Konfigurasi .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=si_tk_attauhid
DB_USERNAME=postgres
DB_PASSWORD=secret
```

### 10.3 Urutan Migrasi

```
1.  users                     (built-in Laravel)
2.  spatie permission tables  (roles, permissions, model_has_roles, ...)
3.  notifications             (Laravel Notifications)
4.  accounts
5.  teachers
6.  students
7.  tariffs
8.  rkas_budgets
9.  invoices
10. inbound_payments + media tables
11. outbound_requests + media tables
12. attendances
13. payrolls
14. activity_log              (spatie)
```

### 10.4 Seeder Wajib

```php
// DatabaseSeeder.php — urutan eksekusi:
RolePermissionSeeder::class,   // roles & permissions
AccountSeeder::class,          // rekening operasional & gaji
TariffSeeder::class,           // tarif SPP TP 2025-2026
RkasBudgetSeeder::class,       // import dari RKAS TK.xlsx klien
```

---

## 11. STANDAR PENGEMBANGAN

### 11.1 Konvensi Naming

| Jenis | Konvensi | Contoh |
|-------|----------|--------|
| Controller | PascalCase + Controller | `InboundPaymentController` |
| Model | PascalCase Singular | `InboundPayment` |
| Migration | snake_case dengan timestamp | `2026_05_01_create_invoices_table` |
| Route name | dot.notation | `inbound.payments.approve` |
| Route URI | kebab-case | `/inbound-payments/{id}/approve` |
| React Page | PascalCase dalam folder | `Pages/Inbound/Payments/Index.jsx` |
| Inertia Prop | camelCase | `studentList`, `paymentData` |
| Notification Class | PascalCase + konteks | `PembayaranPendingApproval` |

### 11.2 Security Checklist

- [ ] Semua endpoint diproteksi middleware `auth` + `role:...`
- [ ] Semua form menggunakan CSRF token (otomatis via Inertia)
- [ ] Password di-hash dengan Bcrypt (default Laravel)
- [ ] Input file upload: validasi mimes + max size (2MB/file)
- [ ] Query via Eloquent (tidak raw SQL — hindari SQL Injection)
- [ ] Tidak ada data sensitif di JavaScript (hanya pass via Inertia props)
- [ ] Rate limiting pada endpoint login: maks 5 percobaan/menit
- [ ] Semua mutasi finansial dibungkus `DB::transaction()`
- [ ] Gate check: status harus `approved` sebelum bisa di-set `disbursed`

### 11.3 Performance

- Semua list dengan pagination (default 20 per halaman)
- Eager loading relasi (`with()`) wajib — hindari N+1 query
- Index database: semua foreign key + kolom `status`, `periode`, `created_at`
- Export Excel/PDF: synchronous (cukup untuk skala TK); tambah Queue jika lambat

### 11.4 Testing Minimal

- Feature test untuk setiap alur approval (Inbound, Outbound, Payroll)
- Unit test untuk kalkulasi: cicilan SPP, formula payroll, validasi pagu RKAS
- Gunakan database test yang nyata (PostgreSQL), tidak boleh mock Observer

---

## 12. DELIVERABLE & KRITERIA SELESAI

### Definition of Done per Modul

| Modul | Kriteria Selesai |
|-------|-----------------|
| **Master Data** | CRUD lengkap, soft-delete berfungsi, validasi form, audit log aktif |
| **Inbound** | Auto-invoice berjalan, cicilan tunai/transfer, approval flow, PDF kwitansi tercetak |
| **Outbound** | Multi-upload berfungsi, routing approval benar, disbursement flow, PDF voucher tercetak |
| **Payroll** | Kalkulasi otomatis dari absensi, approval draft, konfirmasi bayar, slip gaji PDF |
| **Dashboard** | Neraca real-time, widget approval, export PDF/Excel < 1 menit |

### Kriteria Sukses Produk

- ✅ 100% kwitansi, invoice, dan slip gaji dicetak melalui sistem
- ✅ Rp 0,- transaksi tanpa approval dan jejak aktor yang jelas
- ✅ Laporan keuangan bulanan dapat di-export dalam < 1 menit
- ✅ Tidak ada mutasi saldo di luar Observer + DB::transaction()

---

## 13. RISIKO & MITIGASI

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Race condition pada mutasi saldo | Saldo ganda / salah | Wajib `DB::transaction()` di Observer; mutasi HANYA di Observer |
| File upload besar | Server lambat/penuh | Limit max 2MB/file, maks 5 file per pengajuan |
| Invoice ganda per periode | Tagihan dobel ke siswa | Command `GenerateMonthlyInvoices` harus idempotent |
| Saldo rekening negatif | Keuangan tidak balance | Validasi `nominal <= saldo_rekening` di FormRequest |
| User salah role login | Kebocoran data | Middleware role + proteksi route React di semua halaman |
| Brute-force login | Akses tidak sah | Rate limiting 5 req/menit via Laravel throttle |
| Disbursement tanpa approved | Pengeluaran tidak sah | Gate check status sebelum aksi disbursed tersedia |
| Data payroll berubah retroaktif | Slip gaji tidak akurat | Snapshot semua komponen gaji ke tabel payrolls saat generate |

---

## 14. SKILLS & KNOWLEDGE YANG DIPERLUKAN

> Referensi kompetensi teknis yang perlu dikuasai sebelum/selama pengembangan. Ditandai dengan level prioritas: **[WAJIB]** harus dikuasai sebelum mulai, **[PENTING]** dipelajari saat sprint terkait, **[BONUS]** opsional.

### 14.1 Backend — Laravel 11

| Topik | Sub-Topik | Level |
|-------|-----------|-------|
| **Routing & Controller** | Resource routes, route groups, named routes, `route()` helper | WAJIB |
| **Middleware** | Custom middleware, `role:` middleware dari spatie, throttle | WAJIB |
| **Eloquent ORM** | Relationships (hasMany, belongsTo, hasManyThrough), Scopes, SoftDeletes | WAJIB |
| **Eloquent Accessor** | `getXxxAttribute()` / castable untuk field computed (sisa_hutang, sisa_pagu) | WAJIB |
| **Eager Loading** | `with()`, `withCount()`, `load()` — wajib untuk hindari N+1 | WAJIB |
| **FormRequest** | Custom validation rules, `authorize()`, `messages()`, `after()` hooks | WAJIB |
| **Observer Pattern** | `created()`, `updated()`, `deleted()` — registrasi di AppServiceProvider | WAJIB |
| **DB Transaction** | `DB::transaction(fn)`, rollback otomatis saat exception | WAJIB |
| **Laravel Scheduler** | `schedule()` di `Console/Kernel.php`, `everyMonth()`, `monthlyOn()` | PENTING |
| **Laravel Notifications** | Database driver, `Notifiable` trait, `toDatabase()`, mark-as-read | PENTING |
| **Spatie Permission** | `assignRole()`, `hasRole()`, `can()`, `@role` blade directive | WAJIB |
| **Spatie Activitylog** | `LogsActivity` trait, custom log name, `causedBy()`, `performedOn()` | PENTING |
| **Spatie Medialibrary** | `HasMedia`, `InteractsWithMedia`, koleksi, konversi, validasi | PENTING |
| **DomPDF** | Blade template PDF, `loadView()->stream()`, `setPaper()`, font embedding | PENTING |
| **Maatwebsite Excel** | `FromCollection` / `FromQuery` export, `WithHeadings`, `WithStyles` | PENTING |

### 14.2 Frontend — React + Inertia.js

| Topik | Sub-Topik | Level |
|-------|-----------|-------|
| **React Hooks** | `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef` | WAJIB |
| **Inertia.js** | `useForm()`, `router.visit()`, `router.post()`, shared props (`usePage`) | WAJIB |
| **Inertia Link** | `<Link>` component, `preserveState`, `preserveScroll`, `only` partial reload | PENTING |
| **Controlled Forms** | Input terkontrol, kalkulasi real-time (cicilan, kembalian) | WAJIB |
| **Tailwind CSS** | Utility classes, responsive prefix (`md:`, `lg:`), `clsx` untuk kondisional class | WAJIB |
| **Headless UI** | `Dialog`, `Disclosure`, `Menu`, `Transition` — accessible components | PENTING |
| **File Upload** | `<input type="file">` dengan Inertia `useForm`, preview, progress indicator | PENTING |
| **Currency Format** | `Intl.NumberFormat` untuk tampilan Rupiah, CurrencyInput component | WAJIB |
| **Notification Bell** | Polling atau shared props untuk badge counter, mark-as-read via Inertia | PENTING |

### 14.3 Database — PostgreSQL

| Topik | Sub-Topik | Level |
|-------|-----------|-------|
| **Migration Design** | `foreignId()->constrained()`, enum via string+check, nullable, default | WAJIB |
| **Indexing** | `$table->index()` pada FK, `status`, `periode` — kapan dan mengapa | PENTING |
| **Enum Handling** | Gunakan `string` + cast di model (bukan native enum PG) untuk fleksibilitas | WAJIB |
| **Soft Deletes** | `$table->softDeletes()`, `withTrashed()`, `onlyTrashed()`, `restore()` | WAJIB |
| **Decimal Precision** | `DECIMAL(15,2)` untuk semua field moneter — hindari float | WAJIB |

### 14.4 Pattern & Konsep Arsitektur

| Konsep | Penjelasan | Level |
|--------|-----------|-------|
| **RBAC** | Role-Based Access Control — satu user bisa punya banyak role, permission per aksi | WAJIB |
| **Observer Pattern** | Reaksi terhadap event model tanpa polusi Controller — pisahkan business logic | WAJIB |
| **State Machine** | Status invoice (unpaid→partial→paid), outbound (pending→approved→disbursed) | WAJIB |
| **Idempotency** | Operasi yang aman dijalankan berkali-kali — wajib untuk scheduler | PENTING |
| **Snapshot Pattern** | Salin nilai saat generate payroll agar tidak terpengaruh edit data master | WAJIB |
| **Approval Workflow** | Alur multi-step dengan notifikasi, guard per role, perubahan status | WAJIB |
| **Separation of Concerns** | Controller = HTTP, Observer = business event, FormRequest = validasi | WAJIB |

### 14.5 Tools & DevOps

| Tool | Kegunaan | Level |
|------|---------|-------|
| **Docker Compose** | Jalankan PostgreSQL di lokal tanpa install native | WAJIB |
| **Git + Conventional Commits** | Version control, commit message terstandar | WAJIB |
| **Vite** | Asset bundling, Hot Module Replacement (HMR) selama development | PENTING |
| **php artisan** | `make:model`, `make:controller`, `make:observer`, `make:notification` | WAJIB |
| **Tinker** | Testing query Eloquent, generate data manual, debug cepat | PENTING |

### 14.6 Referensi Belajar

```
Laravel 11 Documentation    → https://laravel.com/docs/11.x
Inertia.js Documentation    → https://inertiajs.com
Spatie Laravel Permission   → https://spatie.be/docs/laravel-permission
Spatie Activitylog          → https://spatie.be/docs/laravel-activitylog
Spatie Medialibrary         → https://spatie.be/docs/laravel-medialibrary
Maatwebsite Excel           → https://docs.laravel-excel.com
Headless UI (React)         → https://headlessui.com
Tailwind CSS                → https://tailwindcss.com/docs
React Docs                  → https://react.dev
```

---

## 15. DEVELOPMENT WORKFLOW

### 15.1 Pola Pengembangan per Modul (Urutan Wajib)

Setiap modul/fitur dikembangkan mengikuti urutan ini secara konsisten:

```
Step 1: SCHEMA REVIEW
  → Review schema database untuk tabel yang terlibat
  → Pastikan FK, enum, index, dan nullable sudah benar
  → Update PERENCANAAN_PENGEMBANGAN.md jika ada perubahan

Step 2: MIGRATION
  → php artisan make:migration create_xxx_table
  → Tulis kolom sesuai schema
  → php artisan migrate

Step 3: MODEL
  → php artisan make:model XxxModel
  → Definisikan: $fillable, $casts, $dates
  → Tambahkan: relationships (hasMany, belongsTo)
  → Tambahkan: Accessor untuk computed fields
  → Tambahkan: SoftDeletes jika tabel transaksional

Step 4: SEEDER / FACTORY (jika diperlukan)
  → php artisan make:seeder XxxSeeder
  → Isi data awal (tarif, rekening, RKAS, roles)
  → php artisan db:seed --class=XxxSeeder

Step 5: OBSERVER (khusus tabel dengan mutasi saldo)
  → php artisan make:observer XxxObserver --model=XxxModel
  → Implementasi hook updated() dengan DB::transaction()
  → Daftarkan di AppServiceProvider::boot()

Step 6: FORM REQUEST
  → php artisan make:request StoreXxxRequest
  → php artisan make:request UpdateXxxRequest
  → Tulis rules(), messages(), authorize()

Step 7: CONTROLLER
  → php artisan make:controller Folder/XxxController --resource
  → Implementasi: index(), create(), store(), show(), edit(), update(), destroy()
  → Gunakan Inertia::render() untuk semua response
  → Inject FormRequest, gunakan authorize via middleware

Step 8: ROUTE
  → Tambahkan di routes/web.php dalam group middleware(['auth', 'role:...'])
  → Gunakan Route::resource() atau Route::get/post secara eksplisit

Step 9: REACT PAGE
  → Buat file: resources/js/Pages/Folder/Xxx/Index.jsx
  → Buat file: resources/js/Pages/Folder/Xxx/Create.jsx (jika perlu)
  → Buat file: resources/js/Pages/Folder/Xxx/Show.jsx (jika perlu)
  → Gunakan useForm() dari Inertia untuk form submit
  → Gunakan komponen reusable: DataTable, StatusBadge, CurrencyInput

Step 10: TEST
  → Tulis feature test untuk happy path + edge case
  → Test approval flow: dari pending → approved → (disbursed/paid)
  → Verifikasi saldo terupdate dengan benar setelah Observer berjalan
```

### 15.2 Git Workflow

```bash
# Mulai sprint baru
git checkout main
git pull origin main
git checkout -b sprint/01-master-data

# Commit per fitur kecil (Conventional Commits)
git add app/Models/Student.php database/migrations/xxx_students.php
git commit -m "feat(student): add Student model and migration"

git add app/Http/Controllers/MasterData/StudentController.php
git commit -m "feat(student): add StudentController with resource methods"

git add resources/js/Pages/MasterData/Students/
git commit -m "feat(student): add Students Index and Create pages"

# Selesai sprint — merge ke main
git checkout main
git merge sprint/01-master-data --no-ff
git tag v0.1.0-sprint1

# Format Conventional Commits:
# feat(scope): deskripsi      → fitur baru
# fix(scope): deskripsi       → bug fix
# refactor(scope): deskripsi  → refactor tanpa perubahan perilaku
# chore(scope): deskripsi     → update config, package, migration
```

### 15.3 Alur Kerja Harian (Daily Workflow)

```
Pagi:
  1. git pull origin main
  2. docker compose up -d   (pastikan DB berjalan)
  3. php artisan serve       (start Laravel)
  4. npm run dev             (start Vite HMR)

Coding cycle:
  5. Pilih 1 user story dari sprint aktif
  6. Ikuti urutan: Schema → Migration → Model → ... → Test (Section 15.1)
  7. Test manual di browser untuk setiap step
  8. Commit setelah setiap step selesai (commit kecil, sering)

Akhir hari:
  9. Jalankan feature test yang relevan
  10. Push ke branch sprint aktif
  11. Update progress di dokumen ini jika ada perubahan schema/logika
```

### 15.4 Alur Sprint (Sprint Workflow)

```
SPRINT PLANNING (Awal Sprint)
  □ Review semua user story dalam epic
  □ Konfirmasi schema database tidak ada gap
  □ Setup branch: git checkout -b sprint/XX-nama-modul

DEVELOPMENT (Per User Story)
  □ Ikuti pola Step 1-10 (Section 15.1)
  □ Commit setelah setiap step
  □ Test manual + feature test

SPRINT REVIEW (Akhir Sprint)
  □ Demo semua user story P0 kepada diri sendiri / klien
  □ Jalankan semua test: php artisan test
  □ Fix semua bug yang ditemukan
  □ Merge ke main, buat tag versi
  □ Update PERENCANAAN_PENGEMBANGAN.md jika ada perubahan

SPRINT RETROSPECTIVE
  □ Catat apa yang berhasil dan apa yang perlu diperbaiki
  □ Sesuaikan estimasi sprint berikutnya
```

### 15.5 Checklist Pre-Go-Live

```
DATABASE
  □ Semua migration berhasil di server produksi
  □ Semua seeder dijalankan (roles, permissions, akun, tarif, RKAS)
  □ User super_admin dibuat dengan password kuat

APLIKASI
  □ APP_ENV=production, APP_DEBUG=false
  □ APP_KEY di-generate: php artisan key:generate
  □ Storage link dibuat: php artisan storage:link
  □ Cache di-optimize: php artisan optimize

KEAMANAN
  □ HTTPS aktif di server
  □ File .env tidak dapat diakses publik
  □ Rate limiting aktif pada endpoint /login
  □ Semua route memiliki middleware auth + role

FUNGSIONAL (UAT checklist)
  □ Login semua role berhasil
  □ Alur lengkap inbound payment (input → approval → kwitansi PDF)
  □ Alur lengkap outbound (pengajuan → approval → disbursement → voucher PDF)
  □ Generate payroll → approval → slip gaji PDF
  □ Export laporan PDF dan Excel berhasil
  □ Notifikasi in-app berfungsi antar role
  □ Audit log merekam semua aksi

TRAINING PENGGUNA
  □ Demo kepada Bendahara: alur pembayaran SPP dan pengajuan dana
  □ Demo kepada Admin/HR: input absensi guru
  □ Demo kepada Kepala Sekolah: approval pembayaran, pengajuan, payroll
  □ Demo kepada Yayasan: approval pengajuan, akses laporan
```

---

*Dokumen ini merupakan living document yang akan diperbarui seiring perkembangan proyek.*
*v1.0.0 — 30 April 2026: Initial draft*
*v1.1.0 — 30 April 2026: Perbaikan RBAC, disbursement flow, schema, struktur direktori*
*v1.2.0 — 30 April 2026: Fokus Phase 1 keuangan + payroll; POS ke Phase 2; tambah Skills & Development Workflow*
