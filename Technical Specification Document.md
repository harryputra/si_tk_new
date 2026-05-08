# 📑 Technical Specification Document - SI ERP TK Attauhid

## 🏗️ Architecture Overview
*   **Backend:** Laravel 11 (PHP 8.2+)
*   **Frontend:** React 19 + Inertia.js (SPA Workflow)
*   **Styling:** Tailwind CSS (Premium Modern Dashboard Aesthetic - "Premium Dashboard v2.0")
*   **Automation:** Laravel Scheduler & Observer Pattern.

## 🛠️ Module Implementation Details

### 1. High-End Analytics Dashboard
*   **Statistics Engine:** Agregasi real-time untuk Saldo Kas, Total Siswa, Guru, dan Akumulasi Tunggakan SPP.
*   **Activity Feed:** Visualisasi transaksi terbaru (Penerimaan & Pengeluaran).

### 2. Financial Flows (Tested & Verified)
*   **Inbound Flow:** Pembayaran tagihan otomatis mengupdate saldo rekening dan status invoice via `InboundPaymentObserver`.
*   **Outbound Flow:** Pengajuan dana otomatis mengurangi saldo rekening dan menambah `terpakai` pada RKAS via `OutboundRequestObserver`.
*   **Validation:** Pengecekan sisa pagu anggaran dan saldo rekening dilakukan secara ketat di level Controller dan Observer.

### 3. Payroll & Attendance
*   **Presensi:** Pencatatan harian yang terintegrasi dengan penghasilan bulanan. Mendukung toggle status (Hadir, Izin, Sakit, Alfa) dengan auto-save via `useCallback` dan `onBlur` memo.
*   **Payroll:** Perhitungan gaji bersih otomatis (THP) dengan sistem denda/bonus berbasis kehadiran. Fitur "Generate Draft" untuk automatisasi rekapitulasi bulanan.

### 4. Navigation & Layout (Updated)
*   **Active State Logic:** Menggunakan `usePage().url` untuk deteksi link aktif pada Sidebar guna menjamin konsistensi visual di lingkungan SPA.
*   **Stability:** Penanganan `ReferenceError` pada semua modul utama melalui standarisasi import React hooks (`useCallback`, `useMemo`, `useEffect`).
*   **Event Handling:** Optimalisasi input pencarian pada modul finansial dengan dukungan debounced search (500ms) dan event `onKeyPress` (Enter).

### 5. Premium Dashboard v2.0 - Standardization (Full Refactor)
Telah dilakukan refaktoring menyeluruh pada semua modul utama untuk mencapai standar estetika "Premium Dashboard v2.0":

*   **Inbound/Invoices & Payments:** Transformasi total menjadi estetika fintech-grade dengan nominal skala besar (text-5xl) dan status tracking yang presisi.
*   **MasterData (Siswa, Guru, Rekening, Tarif, RKAS):** 
    *   **High-Fidelity Tables:** Implementasi DataTable dengan sequential numbering, avatar-style icon renderers, dan action drawers yang konsisten.
    *   **Contextual Stats:** Penambahan kartu statistik pada header setiap modul (e.g., Total Siswa Aktif, Total Saldo Terkonsolidasi, Pagu Anggaran).
    *   **Modern Modals:** Standarisasi form input menggunakan `PremiumSelect`, `InputField` premium, dan layout grid yang responsif.
*   **Outbound/Requests:** Implementasi sisa pagu tracking secara visual di dalam modal pengajuan dan sistem approval yang intuitif.

### 6. Action Button Standardization (Uniformity Sync)
Telah dilakukan penyeragaman tombol aksi di seluruh modul list data mengikuti standar `Inbound/Invoices`:

*   **Detail Button:** Menggunakan `EyeIcon`, ukuran `w-11 h-11`, warna biru premium (`hover:text-blue-600 hover:bg-blue-50`), dan title "Lihat Detail".
*   **Edit Button:** Menggunakan `PencilSquareIcon`, ukuran `w-11 h-11`, warna amber premium (`hover:text-amber-600 hover:bg-amber-50`), dan title "Edit Data".
*   **Delete Button:** Menggunakan `TrashIcon`, ukuran `w-11 h-11`, warna rose premium (`hover:text-rose-600 hover:bg-rose-50`), dan title "Hapus Data".
*   **Primary Actions:** Tombol utama (Bayar, Approve, Cairkan) distandarisasi dengan tinggi `h-11`, sudut membulat `rounded-xl`, dan bayangan mendalam (*deep shadows*).

### 7. Academic Architecture & Dynamic Billing System
*   **Academic Structure:** Pengenalan entitas `AcademicYear`, `SchoolClass`, dan `StudentEnrollment` untuk mendukung sistem kenaikan kelas (Promotion) secara granular.
*   **Dynamic Tariff Configuration:** Model `Tariff` dan form UI kini mendukung konfigurasi kompleks melalui `billing_cycle` (bulanan, tahunan, situasional) dan `applicability` (semua siswa, kelas tertentu, siswa spesifik).
*   **Billing Engine:** Fitur "Generate Bills" (`InvoiceController@generateBills`) memungkinkan administrasi membuat tagihan massal untuk bulan tertentu dengan mematuhi aturan spesifik tarif dan penempatan siswa (current_class).
*   **Financial Compliance & Waivers:** Implementasi fitur Pemutihan (Waivers) dengan multi-level approval (`InvoiceWaiver` model). Termasuk UI interaktif di halaman Detail Tagihan untuk pengajuan langsung yang terintegrasi dengan kalkulasi sisa hutang.
*   **Standardized PDF Reporting:** Integrasi `barryvdh/laravel-dompdf` untuk mengekspor status piutang siswa ke dalam format PDF yang siap audit.

### 8. UI/UX Standard Architecture (Reference: UI_UX_Standard_Design.md)
Telah ditetapkan standar desain resmi sebagai acuan pengembangan fitur masa depan:
*   **Design Tokens:** Konsistensi penggunaan radius `rounded-[2.5rem]` untuk container utama dan `rounded-2xl` untuk komponen interaktif.
*   **Color Logic:** Penggunaan HSL tailored colors (Blue-600 untuk aksi, Emerald untuk sukses, Rose untuk tunggakan/bahaya).
*   **Navigation Experience:** Setiap nama siswa di seluruh tabel (Tagihan, Pembayaran, Master Data) wajib bersifat klik-able (`Link`) dengan efek hover dinamis (ganti warna & rotasi avatar).
*   **Tabbed Interface:** Standarisasi penggunaan tab pada halaman detail (e.g., Detail Siswa) untuk memisahkan domain data (Profil vs Akademik vs Keuangan).

### 9. Profile Photo Management
*   **Secure File Handling:** Implementasi upload foto profil untuk entitas `Student` dan `Teacher`. Menggunakan strategi *file renaming* otomatis (menggabungkan `timestamp`, `NIS`/`NIP`, dan nama asli file) di level Controller untuk mencegah resiko tertimpanya file (*overwrite*) jika user mengupload file dengan nama yang sama.
*   **Storage Architecture:** File disimpan secara terstruktur di disk `public` (direktori `storage/app/public/students/photos` dan `teachers/photos`) dan dilink (`php artisan storage:link`) agar mudah diakses frontend.
*   **Dynamic UI Components:** Integrasi form modal dengan `useForm` Inertia untuk mendeteksi upload secara reaktif dengan fitur *live preview* (via `URL.createObjectURL`). Render foto telah diterapkan di `DataTable` dan `Show.jsx` lengkap dengan sistem *fallback* ke visualisasi inisial-gradient otomatis bila foto tidak ada.

### 10. Interactive Billing Issuance (UI Standard Sync)
*   **Legacy Refactor:** Migrasi total dari `window.prompt()` ke sistem `Modal` kustom untuk fitur "Terbitkan Invoice".
*   **UX Enhancements:** Penambahan boks informasi kontekstual (`emerald-50` theme) untuk memberikan kejelasan sebelum eksekusi tagihan massal.
*   **Uniformity:** Standarisasi input periode menggunakan `InputField` dengan validasi regex format `YYYY-MM` terintegrasi pada alur `onSuccess` Inertia.

### 11. Master Kategori Biaya (Dynamic Expenditure Classification)
*   **Centralized Taxonomy:** Pengenalan entitas `ExpenseCategory` untuk mengelola klasifikasi pengeluaran secara dinamis, menggantikan input free-text pada modul RKAS.
*   **Audit-Ready Codes:** Setiap kategori memiliki kode unik (e.g., `OPS`, `SARPRAS`) untuk mempermudah integrasi pelaporan dan tracking anggaran.
*   **Soft Deletes:** Implementasi penghapusan logis untuk menjaga integritas data historis pada transaksi `OutboundRequest` dan `RkasBudget`.

### 12. Academic & Student Master Data (Flexible Institutional Structure)
*   **Academic Years:** Manajemen siklus tahun ajaran dengan fitur "Active Period Switch" untuk menentukan konteks penagihan global.
*   **School Classes:** Pengelolaan entitas kelas (TK A, TK B) lengkap dengan relasi ke Wali Kelas (Teacher).
*   **Student Types:** Transformasi `jenis_siswa` dari hardcoded enum menjadi master data dinamis (`reguler`, `fullday`, dll) untuk skema tarif yang lebih fleksibel.
*   **UI Standard:** Menggunakan palet warna tematik (Indigo untuk Tahun Ajaran, Cyan untuk Kelas, Amber untuk Jenis Siswa) untuk mempermudah navigasi visual.

### 13. Advanced Sidebar UX (Grouping & State Persistence)
*   **Categorized Navigation:** Menu dikelompokkan ke dalam 6 kategori logis (Utama, Akademik, Master Data, Keuangan, SDM, Laporan) untuk mengurangi beban kognitif pengguna.
*   **Collapsible Interface:** Sidebar dapat dimini-mize (collapsed) menjadi mode ikon saja untuk memperluas area kerja konten utama.
*   **Persistence Layer:** Status sidebar (collapsed/expanded) disimpan di `localStorage`, memastikan preferensi pengguna tetap terjaga setelah refresh halaman.
*   **Aesthetic Polish:** Implementasi custom scrollbar, transisi halus (300ms ease), dan penataan tipografi yang lebih tajam menggunakan font-black dan uppercase tracking.

### 14. Student Graduation & Policy Adjustment (Transparent Financial Closure)
*   **Pre-Graduation Audit:** Halaman khusus menampilkan daftar siswa kelas akhir beserta akumulasi tunggakan real-time, dengan filter per kelas.
*   **Policy Adjustment Mechanism:** Tiga jenis kebijakan penyesuaian tagihan:
    *   `subsidi_yayasan` — Tagihan dilunasi menggunakan dana internal yayasan.
    *   `pemutihan` — Penghapusan total tagihan (yatim/piatu, ekonomi).
    *   `diskon_kelulusan` — Pemotongan parsial sebagai kebijakan kelulusan.
*   **Fiktif Payment Trail:** Setiap penyesuaian menghasilkan `InboundPayment` dengan `jenis_bayar=kebijakan` yang ter-*approve* otomatis, disertai `InvoiceAdjustment` sebagai audit record.
*   **Graduation Guard:** Sistem menolak kelulusan siswa yang masih memiliki saldo tunggakan > 0.
*   **Yayasan Accountability Report:** Laporan rekapitulasi penyesuaian menampilkan nama siswa, tagihan asli, jenis kebijakan, nominal yang dihapuskan, dan admin penanggung jawab.

### 15. Class Promotion & Capacity Management (Kenaikan Kelas & Rombel Dinamis)
*   **Dynamic Capacity Constraint:** Penambahan parameter `capacity` pada entitas `SchoolClass` untuk mengontrol kuota maksimal siswa per rombel (default: 25).
*   **Visual Capacity Tracking:** Implementasi progress bar interaktif pada "Manajemen Kelas" yang mengkalkulasi `students_count` terhadap `capacity` secara real-time. Indikator warna berubah berdasarkan utilisasi (Hijau = Aman, Kuning = Penuh >80%, Merah = Overcapacity).
*   **Re-registration Workflow (Conceptual):** Alur kenaikan kelas berbasis pelunasan tunggakan dan registrasi ulang, mencegah admin melakukan *mapping* siswa ke kelas yang penuh atau meloloskan siswa dengan status menunggak.

### 16. Penerimaan Siswa Baru (PPDB / Admissions)
*   **Prospective Registration:** Penambahan status `calon` dan `registration_number` pada tabel `students` untuk mengisolasi entitas pendaftar dari siswa aktif. `nis` dikonfigurasi nullable untuk calon siswa.
*   **Automated Initial Billing:** Registrasi otomatis membuat "Tagihan Awal" (Biaya Pendaftaran / Uang Pangkal) dengan menggunakan konfigurasi `Tariff` berstatus situasional.
*   **Capacity-Aware Activation:** Proses konversi `calon` menjadi `aktif` membutuhkan validasi ganda: (1) Sisa Tagihan Rp 0, dan (2) Ketersediaan kursi (`students_count < capacity`) pada rombel yang dipilih. Sistem otomatis men-generate NIS dan membuatkan `StudentEnrollment` setelah lulus validasi.

## 🚦 Testing & QA
*   **Automated Tests:** `FinancialFlowTest` berhasil memvalidasi alur Inbound dan Outbound (15 assertions passed).
*   **Graduation Flow:** Verifikasi manual alur 5-tahap: Cek Saldo → Input Kebijakan → Verifikasi Lunas → Eksekusi Lulus → Cetak Laporan.
*   **DB Transaction Integrity:** Semua operasi adjustment menggunakan `DB::beginTransaction()` untuk menjamin atomicity.
*   **Bug Fixes:**
    *   Fix scoping issue pada `AppLayout` navigation.
    *   Fix layout shift saat transisi sidebar expand/collapse.
*   **Environment:** Pengujian dilakukan menggunakan PostgreSQL & Vite Asset Rebuild (`npm run build`).

---

### 17. Modul Manajemen Rombel, Kenaikan Kelas & Plotting
*   **Two-Step Student Advancement:** Memecah alur kenaikan kelas menjadi dua fase independen: (1) **Registrasi Ulang (Promotion)** — Validasi kelayakan finansial dan akademik, memindahkan siswa ke antrean pemetaan. (2) **Pemetaan Kelas (Plotting)** — Penempatan siswa dari antrean ke Rombel spesifik.
*   **Plotting Queue Architecture:** Penambahan model `PlottingQueue` untuk menampung siswa yang telah "lulus" daftar ulang namun belum memiliki kelas fisik. Ini mengisolasi data siswa yang sedang dalam transisi tahun ajaran.
*   **Capacity-Aware Mapping:** Dashboard Pemetaan menyediakan visualisasi *real-time* sisa kuota tiap Rombel. Sistem secara otomatis melakukan kalkulasi massal: `(Jumlah Siswa Terpilih + Kapasitas Terisi) <= Total Kapasitas`.
*   **Post-Mapping Automation:** Trigger otomatis saat pemetaan disimpan: 
    1.  `StudentEnrollment` dibuat dengan status `active`.
    2.  `current_class_id` pada model `Student` diperbarui (Sinkronisasi Dashboard Wali Kelas).
    3.  `InvoiceGenerator` memicu penagihan rutin (SPP/Uang Makan) berdasarkan tarif yang berlaku di Rombel tujuan.
*   **Audit Trail & Flexibility:** Mendukung penanganan siswa mutasi masuk yang langsung masuk ke `PlottingQueue` setelah pembayaran biaya masuk tervalidasi.

### 18. Optimalisasi UI/UX: Sidebar Scroll Persistence
*   **Stateful Sidebar:** Implementasi `useRef` dan `sessionStorage` pada `AppLayout` untuk merekam posisi *vertical scroll* sidebar. 
*   **Navigation UX:** Memastikan saat admin berpindah menu (khususnya menu di bagian bawah), posisi sidebar tetap konsisten dan tidak kembali ke atas (*reset*), memberikan pengalaman navigasi yang mulus dalam alur kerja ERP yang padat.

### 19. Penyesuaian Data RKAS (Case Study Optimization)
*   **Realistic Budget Categories:** Mengganti data dummy generic dengan kategori anggaran sekolah yang nyata (Kegiatan Belajar Mengajar, Sarpras, SDM, Operasional).
*   **Standardized Descriptions:** Uraian anggaran kini menggunakan istilah yang mudah dipahami seperti "Pengadaan ATK Siswa", "Pemeliharaan Gedung", dan "Workshop Guru" untuk memperkuat konteks studi kasus.
*   **Structured Seeding:** Implementasi `RkasBudgetSeeder` untuk memastikan data RKAS konsisten di seluruh tahun anggaran (2024-2026) dengan pengkodean yang terstandar (e.g., 1.1, 2.1).

*   **Smart Truncation & Detail View:** Mengimplementasikan pemotongan otomatis (*truncation*) pada uraian RKAS yang melebihi 60 karakter untuk menjaga kerapian tabel. Ditambahkan tombol "Lihat Detail" yang memicu modal untuk menampilkan informasi lengkap pos anggaran (Deskripsi utuh, Kategori, Pagu, dan Realisasi).

---
*   **Fixed Column Width:** Membatasi lebar maksimal kolom deskripsi menjadi 400px untuk menjaga proporsi visual tabel tetap seimbang dan profesional.

---
### 20. Optimalisasi Filter & UI Tagihan
*   **Class-Based Filtering:** Menambahkan filter "Pilih Kelas" pada halaman Tagihan untuk memudahkan Admin memantau status pembayaran per rombongan belajar (Rombel).
*   **Compact Pagination Filter:** Mengganti label teks "TAMPILKAN" dengan icon yang lebih bersih (`Bars3BottomLeftIcon`) dan memperkecil ukuran filter *per_page* untuk memberikan lebih banyak ruang visual pada kontrol pencarian.
*   **Component Enhancement:** Memperbarui `PremiumSelect` agar mendukung properti `icon` secara native untuk estetika yang lebih premium.

---
*   **High-Contrast Active State:** Mengintensifkan indikator visual pada filter yang aktif. Komponen yang terpilih kini berubah menjadi **biru solid dengan teks putih** (High Contrast), sehingga Admin dapat secara instan mengidentifikasi status filter.
*   **Type-Safe Labeling:** Memperbaiki logika perbandingan value (menggunakan `String()` conversion) sehingga label "PILIH OPSI" benar-benar berganti menjadi nama kelas/opsi yang dipilih, meskipun terdapat perbedaan tipe data (integer vs string) antara database dan URL parameter.

### 21. Standardisasi UI/UX Data Siswa
*   **Premium Filter Migration:** Migrasi seluruh filter pada halaman Data Siswa (Status, Angkatan, Kelas) ke standar `PremiumSelect` terbaru yang mendukung icon dan indikator *High-Contrast*.
*   **Contextual Icons:** Penambahan icon spesifik (Funnel, Calendar, AcademicCap) pada masing-masing filter untuk mempermudah identifikasi visual cepat.
*   **Compact Pagination:** Implementasi filter jumlah data berbasis icon (`Bars3BottomLeftIcon`) untuk konsistensi antarmuka dengan modul keuangan.

### 22. Revitalisasi Dashboard Admin (Strategic Cockpit)
*   **Financial KPI Tracking:** Menambahkan pemantauan *Monthly Income* (Penerimaan Lunas) dan *Monthly Expense* (Pengeluaran Disbursed) secara real-time untuk memberikan gambaran arus kas bulanan.
*   **Budget Health Monitoring:** Implementasi indikator persentase penggunaan RKAS berbasis visual progress bar, memudahkan Admin memantau sisa pagu anggaran tahunan secara instan.
*   **Quick Actions & Alerts:** Sistem peringatan dini untuk pembayaran yang belum diverifikasi dan pengajuan dana yang menunggu persetujuan (Pending Tasks).
*   **Demographic Insights:** Penambahan statistik komposisi siswa berdasarkan jenis layanan (Reguler/Fullday) sebagai basis pengambilan keputusan akademik.

---
### 23. Infrastructure & Port Management (Environment Stability)
*   **Database Port Re-routing:** Melakukan resolusi konflik pada port `5433` yang terdeteksi telah digunakan oleh container proyek lain (`lsp_db_pg`). Infrastruktur diperbarui menggunakan port `5434:5432` pada `docker-compose.yml`.
*   **Environment Synchronization:** Sinkronisasi variabel `DB_PORT=5434` pada file `.env` untuk memastikan konektivitas Laravel ke database PostgreSQL tetap terjaga di lingkungan pengembangan yang padat.
*   **System Runner Automation:** Implementasi dan verifikasi alur pengecekan sistem melalui `run.bat` yang mencakup validasi PHP, Composer, NPM, Docker Container, dan ketersediaan Port (8000 & 5173).
*   **Vite HMR Conflict Handling:** Penanganan otomatis konflik port pada Vite dev server (auto-switch dari 5173 ke 5174) tervalidasi untuk memastikan integrasi Frontend tetap berjalan lancar.

### 24. Production Deployment Architecture (trinpolman Standard)
*   **Consolidated Container:** Menggunakan arsitektur single-container untuk Web (Nginx) dan App (PHP-FPM) yang dikelola oleh Supervisor. Hal ini memastikan integritas folder `vendor` dan performa yang lebih stabil.
*   **Immutable Image:** Kode aplikasi dipaketkan langsung ke dalam Docker Image tanpa volume mount pada folder kode, menjamin konsistensi antara environment build dan runtime.
*   **Service Stack:**
    *   `si_tk_app`: PHP 8.2 + Nginx + Supervisor (Port 8100).
    *   `si_tk_db`: PostgreSQL 16 (Port internal 5432, Host 5434).
    *   `si_tk_redis`: Redis Cache & Session.
*   **Cloudflare Integration:** Mendukung Real IP detection dan HTTPS termination via Cloudflare Tunnel.

---
*Updated: 2026-05-09 | Production Ready Architecture by Antigravity Architect*


