# Panduan Operasional — SI ERP TK Attauhid

Panduan praktis untuk **Admin TU/HR** dan **Bagian Keuangan (Bendahara)** dalam menjalankan tugas harian, mingguan, bulanan, dan tahunan di sistem.

---

## Daftar Isi

1. [Akun & Hak Akses](#1-akun--hak-akses)
2. [Login & Orientasi Awal](#2-login--orientasi-awal)
3. [Panduan Admin TU/HR](#3-panduan-admin-tuhr)
   - 3.1 [Setup Awal Sistem (Tahun Pertama)](#31-setup-awal-sistem-tahun-pertama)
   - 3.2 [Pendaftaran Siswa Baru](#32-pendaftaran-siswa-baru)
   - 3.3 [Manajemen Data Guru](#33-manajemen-data-guru)
   - 3.4 [Absensi Guru Harian](#34-absensi-guru-harian)
   - 3.5 [Komponen & Penugasan Gaji (Master Payroll)](#35-komponen--penugasan-gaji-master-payroll)
   - 3.6 [Generate Penggajian Bulanan](#36-generate-penggajian-bulanan)
   - 3.7 [Cetak Slip Gaji & Laporan Payroll](#37-cetak-slip-gaji--laporan-payroll)
   - 3.8 [Kelulusan Siswa Tingkat Akhir](#38-kelulusan-siswa-tingkat-akhir)
   - 3.9 [Kenaikan Kelas Tahunan](#39-kenaikan-kelas-tahunan)
4. [Panduan Bendahara (Bagian Keuangan)](#4-panduan-bendahara-bagian-keuangan)
   - 4.1 [Master Tarif Biaya](#41-master-tarif-biaya)
   - 4.2 [Penerbitan Tagihan SPP Bulanan](#42-penerbitan-tagihan-spp-bulanan)
   - 4.3 [Verifikasi & Konfirmasi Pembayaran Masuk](#43-verifikasi--konfirmasi-pembayaran-masuk)
   - 4.4 [Pemantauan Tunggakan](#44-pemantauan-tunggakan)
   - 4.5 [Pemutihan Tagihan (Waiver)](#45-pemutihan-tagihan-waiver)
   - 4.6 [Pembayaran Gaji Guru](#46-pembayaran-gaji-guru)
   - 4.7 [Pencairan Pengajuan Pengeluaran](#47-pencairan-pengajuan-pengeluaran)
   - 4.8 [Laporan Keuangan Bulanan](#48-laporan-keuangan-bulanan)
5. [Workflow Gabungan](#5-workflow-gabungan)
6. [Troubleshooting Umum](#6-troubleshooting-umum)

---

## 1. Akun & Hak Akses

Sistem menggunakan **5 jenis akun (role)** dengan hak akses berbeda. Hubungi `super_admin` untuk pembuatan akun baru.

| Role | Untuk Siapa | Kewenangan Utama |
|---|---|---|
| **super_admin** | IT / Owner sistem | Semua fitur + manajemen user |
| **admin_hr** | Admin TU / Tata Usaha | Master siswa & guru, absensi, generate payroll, generate tagihan |
| **bendahara** | Bagian Keuangan | Tagihan, pembayaran, pencairan, laporan keuangan, kelola rekening |
| **kepala_sekolah** | Kepala Sekolah | Approve pengajuan & payroll, view all reports |
| **yayasan** | Pengurus Yayasan | Approve pengajuan & payroll level yayasan, view reports |

> **Catatan:** Beberapa fitur memerlukan persetujuan berjenjang (misal: pengajuan pengeluaran disetujui Kepsek → Yayasan → dicairkan Bendahara). Sistem akan otomatis menyembunyikan menu yang tidak relevan dengan role Anda.

---

## 2. Login & Orientasi Awal

1. Buka browser → arahkan ke alamat sistem (contoh: `http://localhost:8000` untuk lokal, atau alamat server sekolah).
2. Masuk ke halaman **Login** → masukkan email & password.
3. Setelah login, halaman pertama adalah **Dashboard** dengan ringkasan operasional.
4. Menu utama ada di **sidebar kiri** — diurutkan dari fitur master data (atas) hingga laporan (bawah).

**Tips orientasi:**
- Setiap data yang ditambah/diubah akan menampilkan **notifikasi hijau** di atas halaman.
- Hampir semua tabel mendukung **search**, **filter**, dan **pagination** — manfaatkan untuk mempercepat kerja.
- Tombol berwarna **biru** = aksi utama, **kuning** = edit, **merah** = hapus, **hijau** = approve/eksekusi.

---

## 3. Panduan Admin TU/HR

### 3.1 Setup Awal Sistem (Tahun Pertama)

Lakukan **berurutan** sebelum operasional sekolah dimulai. Setelah ini, hanya perlu update saat ada perubahan.

| Langkah | Menu | Yang Harus Diisi |
|---|---|---|
| 1 | (Hanya super_admin) Tahun Ajaran | Buat tahun ajaran aktif (misal `2025/2026`) |
| 2 | (Hanya super_admin) Kelas | Daftar kelas: Playgroup, TK A-1, TK A-2, TK B-1, TK B-2, dst |
| 3 | **Data Guru** | Daftarkan semua guru dengan komponen gaji lengkap |
| 4 | **Data Siswa** | Daftarkan siswa, assign kelas |
| 5 | **Tarif Biaya** (oleh Bendahara) | Setup SPP, DSP, seragam, dll. Lihat [bagian 4.1](#41-master-tarif-biaya) |

### 3.2 Pendaftaran Siswa Baru

**Menu:** Sidebar → **Data Siswa** → tombol biru **Tambah Siswa**

1. Isi data wajib: NIS, Nama Lengkap, Tahun Angkatan, Jenis Siswa (Reguler/Reguler Opsi 2/Fullday), Nama Wali, Status.
2. (Opsional) Upload foto profil — drag-and-drop atau klik area foto.
3. (Opsional) Pilih **Kelas Saat Ini** kalau langsung di-assign ke kelas.
4. Klik **Simpan Siswa Baru**.

**Tips:**
- **NIS harus unik**. Kalau ada duplikat, sistem akan menolak.
- Filter "BELUM ADA KELAS" di halaman daftar untuk lihat siswa yang belum di-assign.
- Untuk update massal kelas, lihat [Kenaikan Kelas](#36-kenaikan-kelas-tahunan) di awal tahun ajaran.

### 3.3 Manajemen Data Guru

**Menu:** Sidebar → **Data Guru** → **Tambah Guru**

Komponen wajib:

- **Identitas:** NIP, Nama Lengkap, Jabatan, No HP
- **Komponen Gaji:**
  - Gaji Pokok (per bulan)
  - Tunjangan Tetap (per bulan)
  - Bonus Hadir (per hari hadir) — diberikan setiap hari guru hadir
  - Denda Alfa (per hari) — potongan untuk hari tidak hadir tanpa keterangan
- **Rekening:** Nama Bank + Nomor Rekening (untuk transfer gaji)

> **Penting:** Komponen gaji bersifat **dinamis**. Kalau ada kenaikan gaji, edit di sini sebelum generate payroll bulan berikutnya.

### 3.4 Absensi Guru Harian

**Menu:** Sidebar → **Absensi Guru**

**Frekuensi:** Setiap hari kerja (atau direkap mingguan).

1. Pilih tanggal.
2. Untuk setiap guru, tandai status: **Hadir**, **Izin**, **Sakit**, atau **Alfa**.
3. Simpan.

> Data absensi **menentukan komponen Bonus Hadir & Denda Alfa** saat generate payroll. Pastikan akurat sebelum tutup bulan.

### 3.5 Komponen & Penugasan Gaji (Master Payroll)

**Menu:** Sidebar → group **SDM & Payroll** → **Komponen Gaji** & **Penugasan Gaji**

Sistem payroll v2 (Track B) memakai struktur **dinamis**:

- **Komponen Gaji** = kamus pendapatan/potongan (mis. "Gaji Pokok", "Tunjangan Wali Kelas", "Iuran BPJS")
- **Penugasan Gaji** = assignment komponen ke guru tertentu dengan periode berlaku + bukti SK

**Setup Komponen** (Master TU):

1. **Menu:** Komponen Gaji → **Tambah Komponen**
2. Isi:
   - **Nama**: deskriptif, mis. "Tunjangan Wali Kelas"
   - **Jenis**: Pendapatan (earning) / Potongan (deduction)
   - **Siklus**: Rutin Bulanan / Sekali atau Sementara
   - **Formula**:
     - **Flat** — nominal × 1 (tetap per bulan, mis. gaji pokok, tunjangan tetap)
     - **Per Hari Hadir** — nominal × jumlah hari hadir (mis. bonus kehadiran Rp 10.000/hari)
     - **Per Hari Alfa** — nominal × jumlah hari alfa (mis. denda Rp 50.000/hari)
   - **Kategori** (opsional, untuk grouping laporan): mis. `tunjangan_jabatan`, `potongan_wajib`
   - **Default Nominal** (opsional)
3. Komponen yang sudah pernah dipakai **tidak bisa dihapus** — hanya diarsipkan (`is_active=false`).

**Setup Penugasan** (Master TU + dokumentasi SK):

1. **Menu:** Penugasan Gaji → **Tambah Penugasan**
2. Pilih: **Guru** + **Komponen** (sistem otomatis isi nominal default kalau ada)
3. Override **Nominal** kalau perlu (mis. tunjangan wali kelas Rp 350k khusus untuk guru senior)
4. **Berlaku Dari** (wajib) + **Berlaku Sampai** (opsional, kosong = tanpa batas)
5. **Nomor SK** + **Lampiran SK** (PDF/JPG max 5MB) — wajib untuk tunjangan jabatan/project
6. **Catatan** untuk audit
7. Klik Simpan

> **Akhiri penugasan** lebih awal: klik tombol oranye 🚫 di baris assignment → set `effective_until` ke hari ini. Row tetap tersimpan untuk audit.

### 3.6 Generate Penggajian Bulanan

**Frekuensi:** Sebulan sekali, biasanya akhir bulan setelah absensi tutup.

1. **Pastikan absensi bulan tersebut sudah lengkap** — cek di menu Absensi Guru.
2. **Menu:** Sidebar → **Penggajian** → tombol **Generate**.
3. Pilih bulan yang ingin di-generate.
4. Engine v2 otomatis menghitung per guru berdasarkan **PayrollAssignment** yang aktif di tanggal awal periode:
   - Untuk komponen **Flat** → nominal × 1
   - Untuk **Per Hari Hadir** → nominal × jumlah hari hadir di bulan itu
   - Untuk **Per Hari Alfa** → nominal × jumlah hari alfa
   - Total: Σ pendapatan − Σ potongan = **Take Home Pay**
5. Hasilnya muncul di tabel Penggajian dengan status `draft`.
6. **Status payroll:** `draft` → `approved` (Kepsek/Yayasan) → `paid` (Bendahara).

**Detail per Payroll & Penyesuaian Manual:**

Klik ikon **mata** di baris payroll → halaman Detail menampilkan **breakdown line items**:
- **Pendapatan** dan **Potongan** terpisah, lengkap dengan rumus, nominal, dan referensi SK
- Tombol **Tambah Item Manual** — untuk komponen ad-hoc (mis. "Tunjangan Project Outing Mei")
- Tombol **Edit / Hapus** per item — wajib isi **Alasan** (audit trail)

**Audit Trail:** Semua penyesuaian manual tercatat di section "Riwayat Penyesuaian" di halaman detail, termasuk:
- Aksi (added/edited/removed)
- Field yang berubah & nilai sebelum/sesudah
- Alasan dari admin
- Siapa & kapan

> **Lock setelah approve/paid:** Begitu payroll status berubah dari `draft`, item & nominal **tidak bisa diubah**. Generate ulang hanya akan men-skip payroll yang sudah locked. Kalau salah & ingin koreksi, hubungi super_admin untuk reset status ke draft.

### 3.7 Cetak Slip Gaji & Laporan Payroll

**Slip Gaji per Guru:**

Klik ikon **printer** di baris payroll, atau buka detail → tombol "Slip Gaji PDF". File PDF akan ter-download otomatis dengan format:
- Header (data guru + periode)
- Tabel Pendapatan + Tabel Potongan dengan rumus & SK reference
- Grand Total Take Home Pay
- Riwayat Penyesuaian (kalau ada)
- Tanda tangan Bendahara + Penerima

**Laporan Payroll** (group "Laporan" di sidebar):

| Menu | Isi | Untuk |
|---|---|---|
| **Rekap Gaji** | Per-guru: hadir/alfa, total earning, total deduction, THP, status approval | Yayasan — kontrol total belanja pegawai per bulan |
| **Mutasi Potongan** | Per-komponen (BPJS, Koperasi, dll): list guru + nominal yang dipotong | Bendahara — basis setoran ke pihak eksternal |
| **Audit Kepegawaian** | Daftar penugasan AKTIF + bukti SK + total per kategori | Auditor — cek apakah semua tunjangan punya dasar SK |

> **Audit Kepegawaian** menyorot assignments yang **tanpa bukti SK** dengan badge merah — wajib di-follow-up.

### 3.8 Kelulusan Siswa Tingkat Akhir

**Menu:** Sidebar → group **Akademik** → **Kelulusan**

**Frekuensi:** Akhir tahun ajaran (untuk siswa di tingkat terakhir, mis. TK B atau Kelas 6).

**Mekanisme:**

1. **Pilih Rombel** dari dropdown di header (mis. TK B-1, TK B-2, dst). Atau pilih "Semua Kelas" untuk lihat semuanya sekaligus.
2. **Sistem menampilkan dashboard:**
   - **Stats**: Total Siswa / Sudah Lunas / Masih Tunggakan / Total Tunggakan Rp
   - **Banner Promosi Massal** muncul kalau ada siswa siap luluskan (lunas)
   - **Tabel siswa** dengan kolom: Total Tagihan / Terbayar / Sisa Tunggakan / Status (✓ SIAP LULUS atau TUNGGAKAN)
3. **Untuk siswa LUNAS:**
   - Centang checkbox "Pilih" di kolom aksi
   - Klik tombol "**Proses Luluskan Massal**" → Modal konfirmasi → Eksekusi
   - Sistem otomatis:
     - `students.status` → `alumni`
     - `students.current_class_id` → `null` (lepas dari kelas)
     - `student_enrollments.status` → `graduated` (audit history)
4. **Untuk siswa BERTUNGGAKAN:**
   - Klik tombol **"Kebijakan"** di baris siswa tsb
   - Modal "Penyesuaian Kebijakan" muncul, pilih jenis:

| Jenis Kebijakan | Kapan Dipakai | Efek pada Tagihan |
|---|---|---|
| **Subsidi Yayasan** | Tagihan dibayar oleh dana internal yayasan | Tagihan dianggap LUNAS, dana yayasan tercatat |
| **Pemutihan** | Yatim/piatu/ekonomi sangat lemah | Tagihan dihapus total (saldo 0), tidak ada uang masuk |
| **Diskon Kelulusan** | Kebijakan parsial sesuai keputusan rapat | Sebagian tagihan dipotong sesuai nominal yang Admin masukkan |

   - **Wajib isi Keterangan / Instruksi Yayasan** (mis. *"Atas instruksi Pimpinan Yayasan No. SK/2026/05 — Siswa Yatim"*) — ini akan disimpan permanen di audit log
   - Klik "Terapkan Kebijakan" → sistem buat:
     - **InboundPayment** dengan `jenis_bayar='kebijakan'` (tidak ada uang fisik masuk)
     - **InvoiceAdjustment** record dengan `batch_id` & `admin_id` (audit trail)
     - Update invoice → status `paid` / `partial`
5. Setelah kebijakan diterapkan, status siswa berubah jadi LUNAS → bisa diluluskan via langkah 3.

**Laporan Kebijakan:**

Tombol **"Laporan Kebijakan"** di header (atau menu Kelulusan → Report) menampilkan:
- Total record penyesuaian
- Total nominal dihapuskan (Rp)
- Breakdown per jenis (subsidi/pemutihan/diskon)
- Tabel detail per siswa: nama, tagihan asli, jenis kebijakan, nominal dihapuskan, admin yang memproses, tanggal

> **Audit-friendly**: Kebijakan **tidak menghapus** record. Setiap tindakan membentuk row baru di `invoice_adjustments` + `inbound_payments` (tipe kebijakan). Ini bedakan "saldo nol karena bayar" vs "saldo nol karena kebijakan".

### 3.9 Kenaikan Kelas Tahunan

**Frekuensi:** Sekali setahun, di awal tahun ajaran baru (biasanya Juni/Juli).

**Menu:** Sidebar → **Kenaikan Kelas**

**Langkah:**

1. **Pilih konfigurasi:**
   - **Kelas Asal** — kelas yang akan dipromosikan (misal: TK A-1)
   - **Kelas Tujuan** — kelas yang dituju untuk yang naik (misal: TK B-1)
   - **Tahun Ajaran Tujuan** — pilih yang baru (misal: 2026/2027)
2. Klik **Cek Siswa & Tunggakan**.
3. Sistem menampilkan:
   - Total siswa di kelas asal
   - Berapa yang **lunas (siap naik)**
   - Berapa yang **bertunggakan** + total nominal piutang
4. **Periksa baris per baris:**
   - Default: semua dicentang dan ditandai **NAIK**
   - Kalau ada siswa yang **tinggal kelas**, ubah radio button ke **TINGGAL** (siswa akan tercatat sebagai `retained` di tahun ajaran baru, kelasnya tidak berubah)
   - Kalau ada siswa yang tidak diproses (misal pindah keluar / DO), uncheck checkbox-nya
5. **Pilihan tambahan:**
   - **Auto-terbitkan invoice tarif kelas tujuan** (default: aktif) — kalau dicentang, sistem otomatis generate invoice untuk semua tarif yang dikhususkan ke kelas tujuan, **hanya untuk siswa yang baru saja naik**
   - **Periode** — bulan invoice (default: bulan ini, biasanya disesuaikan ke bulan pertama tahun ajaran baru, misal Juli)
6. Klik **Eksekusi Kenaikan Kelas (N)**.
7. **Konfirmasi:**
   - Kalau ada siswa bertunggakan ikut dipilih, akan muncul peringatan merah — keputusan ada di Anda. **Tunggakan tidak akan terhapus** otomatis, tetap menempel ke siswa.
   - Konfirmasi → sistem eksekusi.

**Yang terjadi setelah eksekusi:**
- `current_class_id` siswa berubah ke kelas tujuan (untuk yang naik)
- Record `student_enrollments` baru tercatat (untuk audit history)
- Invoice tarif kelas tujuan otomatis diterbitkan (kalau opsi dicentang)
- Tunggakan kelas lama **tetap tercatat di sistem** dan akan muncul di [Dashboard Tunggakan](#44-pemantauan-tunggakan)

> **Idempoten:** Kalau Anda eksekusi 2x dengan tahun ajaran tujuan yang sama, sistem akan **skip** siswa yang sudah pernah dipromosikan — tidak akan duplikat. Aman untuk re-run kalau ada kendala.

---

## 4. Panduan Bendahara (Bagian Keuangan)

### 4.1 Master Tarif Biaya

**Menu:** Sidebar → **Tarif Biaya** → tombol **Tambah Tarif**

Setiap tarif terdiri dari komponen berikut:

| Field | Penjelasan |
|---|---|
| **Nama Tarif** | Deskriptif, misal "SPP Reguler 2025/2026" |
| **Kategori Biaya** | SPP, DSP, Kegiatan Tahunan, Seragam, Pendaftaran, Snack |
| **Tahun Berlaku** | Tahun penerapan tarif |
| **Siklus Tagihan** | Bulanan (SPP), Sekali Bayar (DSP), Tahunan (Seragam), Situasional (Ekskul) |
| **Tahun Ajaran** | Pilih dari daftar (kosongkan kalau berlaku umum) |
| **Peruntukan (Jenis Siswa)** | Semua / Reguler / Reguler Opsi 2 / Fullday |
| **Target Penerima** | **Berlaku Untuk Semua** / **Tingkat Tertentu** (mis. semua rombel TK A: TK A-1, TK A-2, dst) / **Rombel Tertentu Saja** (cuma TK A-1) / **Siswa Tertentu Saja** |
| **Nominal** | Nilai dalam Rupiah |

> **Bedakan TINGKAT vs ROMBEL:**
> - **Tingkat (level)** = Playgroup / TK A / TK B (atau Kelas 1, Kelas 2 untuk SD). Satu tingkat bisa punya banyak rombel.
> - **Rombel (rombongan belajar)** = ruang fisik tertentu, mis. TK A-1, TK A - Elang, dst.
>
> Pakai **Tingkat** kalau biaya berlaku merata seluruh tingkat (mis. SPP TK A 2025/2026 → suntik ke seluruh siswa di TK A-1, TK A-2, TK A - Elang, TK A - Merpati). Pakai **Rombel** kalau ada biaya khusus per rombel (mis. "Biaya Tahfidz" hanya untuk rombel TK A-1 yang fokus tahfidz).

**Best practice:**
- **Pisahkan tarif per tahun ajaran**. Jangan edit tarif lama, buat tarif baru. Ini menjaga riwayat keuangan tetap rapi.
- Untuk **SPP**, gunakan siklus **Bulanan** + Peruntukan sesuai jenis siswa. Misal: "SPP Fullday 2025/2026" Rp 800.000/bulan, "SPP Reguler 2025/2026" Rp 500.000/bulan.
- Untuk **DSP / Uang Pangkal**, siklus **Sekali Bayar** + target **Kelas Tertentu Saja** (misal Playgroup, untuk siswa baru masuk).

> **Snapshot pricing:** Saat tarif sudah pernah diterbitkan jadi invoice, perubahan nominal di tarif **tidak akan mengubah invoice yang sudah ada**. Aman untuk update tarif tanpa khawatir merusak tagihan lama.

### 4.2 Penerbitan Tagihan SPP Bulanan

**Frekuensi:** Awal setiap bulan (rekomendasi: tanggal 1).

**Cara A — Per Tarif (rekomendasi untuk tarif spesifik):**

1. **Menu:** Sidebar → **Tarif Biaya**.
2. Cari tarif yang ingin diterbitkan, klik tombol **bolt ⚡ hijau** di kolom aksi.
3. Modal muncul → masukkan **Periode (YYYY-MM)**, default bulan ini.
4. Klik konfirmasi.
5. Sistem akan:
   - Cari siswa aktif yang sesuai applicability tarif (kelas/jenis siswa)
   - Buat invoice baru dengan nominal **snapshot** dari tarif saat itu
   - **Skip** siswa yang sudah punya invoice untuk tarif+periode yang sama (idempoten)
6. Notifikasi muncul: "Tarif X — N invoice baru diterbitkan, M dilewati (sudah ada). Target siswa aktif: K."

**Cara B — Bulk untuk Semua Tarif Bulanan:**

1. **Menu:** Sidebar → **Tagihan (SPP)** → tombol **Generate Bills**.
2. Pilih bulan + tahun ajaran.
3. Sistem generate semua tarif `billing_cycle = monthly` ke siswa yang sesuai sekaligus.

> **Aman dijalankan ulang.** Idempoten — invoice yang sudah ada tidak akan duplikat.

### 4.3 Verifikasi & Konfirmasi Pembayaran Masuk

**Frekuensi:** Harian (cek dashboard pagi & sore).

**Alur (sesuai SOP keuangan):**

1. Wali siswa transfer ke rekening sekolah → upload bukti via WhatsApp/sistem.
2. **Menu:** Sidebar → **Pembayaran** → tombol **Catat Pembayaran Baru**.
3. Isi:
   - Pilih **Siswa** (search by NIS atau nama)
   - Pilih **Tagihan/Invoice** yang dibayar (dropdown menampilkan tagihan yang masih unpaid)
   - **Nominal Bayar** — bisa lunas atau cicilan
   - **Rekening Tujuan** — pilih rekening sekolah yang menerima transfer
   - Upload **Bukti Transfer**
   - Tanggal pembayaran
4. Status awal: `pending`.
5. Klik **Approve Pembayaran** setelah verifikasi mutasi rekening cocok.
6. Sistem otomatis:
   - Update `nominal_terbayar` di invoice
   - Ubah status invoice: `unpaid` → `partial` (kalau cicilan) atau `paid` (kalau lunas)
   - Catat di buku besar penerimaan

**Kalau pembayaran salah/fiktif:**
- Klik tombol **Reject** + isi alasan.

### 4.4 Pemantauan Tunggakan

**Menu:** Sidebar → **Dashboard Tunggakan**

**Frekuensi:** Mingguan (rekomendasi: setiap Senin).

**Yang ditampilkan:**

- **4 Card Ringkasan** di atas:
  - Jumlah siswa bertunggakan lama (highlight rose)
  - Total tunggakan kelas lama
  - Total tagihan kelas baru (kelas saat ini)
  - **Grand Total Kewajiban**
- **Tabel siswa** dengan kolom:
  - Nama Siswa
  - Kelas Sekarang
  - **Tunggakan Kelas Lama** (rose, prioritas tinggi — siswa sudah naik kelas tapi masih ada hutang dari kelas sebelumnya)
  - **Tagihan Kelas Baru** (amber — tagihan periode tahun ajaran berjalan yang belum dibayar)
  - **Total Kewajiban**

**Cara baca warna:**

| Warna Baris | Arti | Tindakan |
|---|---|---|
| Latar **rose/merah** + ⚠ | Ada tunggakan kelas lama | Prioritas tinggi — hubungi wali, ingatkan tunggakan menggantung |
| Tanda titik **amber** | Hanya ada tagihan tahun berjalan | Reminder rutin (SPP berjalan) |
| Ikon **✓ hijau** + LUNAS | Tidak ada hutang | Tidak perlu tindakan |

**Filter cepat:**
- **Kelas** → fokus ke 1 kelas tertentu
- **Status Piutang** → "ADA TUNGGAKAN LAMA" untuk daftar kritis
- **Search** → cari siswa spesifik

**Aksi:** Klik ikon **mata** di kolom aksi untuk melihat detail invoice siswa dan mencatat pembayaran/komunikasi dengan wali.

### 4.5 Pemutihan Tagihan (Waiver)

Untuk kasus khusus seperti siswa kurang mampu, beasiswa, atau diskon kebijakan kepsek/yayasan.

1. **Menu:** Sidebar → **Tagihan (SPP)** → klik invoice yang ingin diputihkan.
2. Klik tombol **Ajukan Pemutihan (Waiver)**.
3. Isi:
   - **Nominal pemutihan** (tidak boleh lebih besar dari sisa tagihan)
   - **Alasan** (wajib, didokumentasikan)
4. Status awal: `pending` → menunggu approval Kepsek/Yayasan.
5. Setelah disetujui:
   - `nominal_tagihan` invoice **berkurang** sebesar nominal waiver
   - Status invoice update otomatis (jadi `paid` kalau sudah cover)
6. Audit trail tercatat di tabel `invoice_waivers` dengan ID approver.

### 4.6 Pembayaran Gaji Guru

**Frekuensi:** Sebulan sekali setelah approval.

**Prasyarat:** Payroll bulanan sudah di-generate oleh Admin TU + sudah disetujui Kepsek/Yayasan (status `approved`).

1. **Menu:** Sidebar → **Penggajian**.
2. Filter periode bulan & status `approved`.
3. Per guru, klik **Bayar (Pay)**.
4. Pilih rekening sumber dana.
5. Sistem catat transaksi keluar + ubah status payroll → `paid`.
6. Cetak slip gaji jika perlu (template tersedia).

### 4.7 Pencairan Pengajuan Pengeluaran

**Menu:** Sidebar → **Pengajuan Pengeluaran**

**Alur lengkap (lihat juga UML di `dokumen_client/Flow Fitur ERP/`):**

1. Pengaju (Kepsek/Admin) membuat pengajuan: deskripsi, nominal, kategori biaya, RKAS terkait.
2. Status: `pending` → menunggu approval (Kepsek → Yayasan tergantung kebijakan).
3. Setelah `approved`, **Bendahara** mencairkan:
   - Klik tombol **Disburse**.
   - Pilih rekening sumber dana.
   - Upload bukti transfer.
4. Sistem catat outflow + tandai pengajuan `disbursed`.

### 4.8 Laporan Keuangan Bulanan

**Menu:** Sidebar → **Laporan**

Tersedia laporan:
- Penerimaan (per periode)
- Pengeluaran (per kategori, per RKAS)
- Tunggakan
- Payroll
- Kas akhir bulan

**Format export:** PDF (untuk ditandatangani) / cetak langsung dari browser.

> Rekomendasi: **tutup bulan tanggal 5 bulan berikutnya** — semua pembayaran tercatat, payroll tercairkan, baru cetak laporan.

---

## 5. Workflow Gabungan

### 5.1 Tutup Bulan

| Tanggal | Tindakan | PIC |
|---|---|---|
| Tgl 25 | Pastikan absensi guru bulan ini lengkap | Admin TU |
| Tgl 28 | Generate Penggajian bulan ini | Admin TU |
| Tgl 28-30 | Approval payroll | Kepsek → Yayasan |
| Tgl 1-5 bln berikut | Pencairan gaji + tutup buku | Bendahara |
| Tgl 1 bln berikut | Generate Tagihan SPP bulan baru | Bendahara |
| Tgl 5 | Cetak Laporan Bulanan | Bendahara |

### 5.2 Tutup Tahun Ajaran

| Bulan | Tindakan | PIC |
|---|---|---|
| Mei | Tutup absensi & payroll bulan terakhir | Admin TU + Bendahara |
| Juni | Buat Tarif baru untuk tahun ajaran berikutnya (dengan field Tahun Ajaran terisi) | Bendahara |
| Juni | Update master Kelas (kalau ada perubahan) | super_admin |
| Juli (awal) | **Eksekusi Kenaikan Kelas** (lihat [3.6](#36-kenaikan-kelas-tahunan)) | Admin TU |
| Juli | Verifikasi invoice tarif kelas tujuan ter-issue dengan benar | Bendahara |
| Juli | Cek **Dashboard Tunggakan** — siswa naik kelas yang masih ada tunggakan | Bendahara |
| Juli | Hubungi wali siswa bertunggakan, susun kesepakatan pelunasan | Bendahara |

### 5.3 Penanganan Tunggakan Menggantung (Cross-class Debt)

Skenario: Siswa naik dari Playgroup ke TK A-1, tapi masih ada SPP Playgroup belum dilunasi.

1. **Buka Dashboard Tunggakan** → filter "ADA TUNGGAKAN LAMA".
2. Identifikasi siswa & nominalnya.
3. Hubungi wali — sampaikan total kewajiban (kelas lama + kelas baru).
4. Kalau wali komit cicil:
   - Buat catatan komunikasi (manual log).
   - Catat setiap cicilan via menu **Pembayaran** dengan memilih invoice **kelas lama** dulu.
5. Kalau ada keringanan dari kepsek/yayasan:
   - Ajukan **Pemutihan (Waiver)** dengan alasan jelas.

---

## 6. Troubleshooting Umum

| Gejala | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Generate tagihan tidak muncul invoice baru | Sudah pernah di-generate sebelumnya (idempoten) | Cek menu Tagihan, filter periode yang sama. Kalau memang sudah ada, tidak perlu generate ulang |
| Siswa tidak muncul di hasil generate | Status `nonaktif` / `alumni` / kelas tidak match applicability tarif | Cek halaman Data Siswa — pastikan `status=aktif` & `current_class_id` benar |
| Tarif sudah diupdate tapi invoice lama tidak berubah | **Snapshot pricing** — by design, biar tidak salah tagih retroaktif | Issue invoice baru kalau memang mau pakai tarif baru |
| Dashboard Tunggakan grand total tidak match expectation | Ada pembayaran pending yang belum di-approve | Cek menu Pembayaran filter `pending`, approve dulu |
| Tombol approve/disburse tidak muncul | Role Anda tidak punya wewenang | Cek dengan super_admin, kemungkinan harus dilakukan role lain |
| Tagihan kelas baru = Rp 0 padahal ada SPP | Tarif belum di-issue ke periode bulan ini, ATAU tarif belum punya `Tahun Ajaran` | Issue invoice via tombol bolt ⚡ di Tarif Biaya, pastikan tarif punya Tahun Ajaran terisi |
| Kenaikan kelas error / siswa duplikat enrollment | Sudah pernah dieksekusi di tahun ajaran tujuan yang sama | Aman, sistem skip otomatis. Cek hasil di notifikasi flash |
| Halaman blank / loading terus | Server backend mati / connection PostgreSQL putus | Hubungi IT, biasanya restart Docker (`docker compose up -d`) |

---

## Catatan Versi

- **v1.0** — Mei 2026 — Panduan awal mencakup Fase 1 (Tariff Generator), Fase 2 (Promotion Workflow), Fase 3 (Dashboard Tunggakan).

> Untuk pertanyaan teknis/bug, hubungi tim developer melalui kanal yang disepakati.
