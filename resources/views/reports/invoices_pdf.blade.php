<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Tagihan</title>
    <style>
        @page {
            margin: 1cm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10px;
            color: #2d3748;
            line-height: 1.5;
        }
        .header {
            text-align: left;
            margin-bottom: 30px;
            border-bottom: 2px solid #edf2f7;
            padding-bottom: 15px;
            position: relative;
        }
        .header-logo {
            position: absolute;
            right: 0;
            top: 0;
            font-size: 24px;
            font-weight: 900;
            color: #3182ce;
        }
        .title {
            font-size: 20px;
            font-weight: 900;
            margin: 0;
            color: #1a202c;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .subtitle {
            font-size: 11px;
            color: #718096;
            margin: 5px 0 0 0;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            background-color: #f7fafc;
            color: #4a5568;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 8px;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #edf2f7;
            padding: 10px 8px;
        }
        td {
            border-bottom: 1px solid #edf2f7;
            padding: 8px;
            vertical-align: middle;
        }
        .text-right {
            text-align: right;
        }
        .font-black {
            font-weight: bold;
            color: #1a202c;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 9999px;
            font-size: 8px;
            font-weight: 900;
            display: inline-block;
        }
        .status-lunas {
            background-color: #f0fff4;
            color: #276749;
        }
        .status-belum {
            background-color: #fff5f5;
            color: #9b2c2c;
        }
        .footer {
            position: fixed;
            bottom: -30px;
            left: 0;
            right: 0;
            font-size: 8px;
            color: #a0aec0;
            text-align: center;
        }
        .page-number:after {
            content: counter(page);
        }
    </style>
</head>
<body>
    <div class="footer">
        Halaman <span class="page-number"></span> | SI ERP TK Attauhid - Laporan Keuangan
    </div>

    <div class="header">
        <div style="float: left; width: 80%;">
            <h2 style="margin: 0; color: #1a202c; font-size: 18px; font-weight: 900; text-transform: uppercase;">
                {{ $school->name ?? 'TK ATTAUHID' }}
            </h2>
            <p style="margin: 2px 0; font-size: 9px; color: #4a5568;">
                {{ $school->address ?? 'Alamat Sekolah Belum Diatur' }}
            </p>
            <p style="margin: 2px 0; font-size: 8px; color: #718096;">
                Telp: {{ $school->phone ?? '-' }} | Email: {{ $school->email ?? '-' }} | Web: {{ $school->website ?? '-' }}
            </p>
        </div>
        <div style="float: right; text-align: right; width: 20%;">
            <div style="font-size: 24px; font-weight: 900; color: #3182ce; opacity: 0.2;">REPORT</div>
        </div>
        <div style="clear: both;"></div>
        <div style="margin-top: 15px; border-bottom: 3px double #edf2f7;"></div>
        
        <div style="margin-top: 20px;">
            <h1 class="title">Laporan Tagihan Siswa</h1>
            <p class="subtitle">Rekapitulasi Keuangan Operasional Sekolah</p>
            <p class="subtitle" style="font-weight: normal; margin-top: 10px;">
                Dicetak oleh: {{ auth()->user()->name ?? 'Administrator' }} <br>
                Waktu Cetak: {{ \Carbon\Carbon::now()->translatedFormat('d F Y, H:i') }}
            </p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th width="30">NO</th>
                <th>SISWA</th>
                <th>JENIS TAGIHAN</th>
                <th width="100">PERIODE</th>
                <th class="text-right">NOMINAL</th>
                <th class="text-right">SISA HUTANG</th>
                <th width="80" style="text-align: center;">STATUS</th>
            </tr>
        </thead>
        <tbody>
            @forelse($invoices as $index => $invoice)
                <tr>
                    <td style="text-align: center; color: #a0aec0;">{{ $index + 1 }}</td>
                    <td>
                        <span class="font-black">{{ optional($invoice->student)->nama_lengkap ?? '-' }}</span> <br>
                        <span style="font-size: 8px; color: #718096;">NIS: {{ optional($invoice->student)->nis ?? '-' }}</span>
                    </td>
                    <td>{{ optional($invoice->tariff)->nama_tarif ?? 'Tarif Umum' }}</td>
                    <td>{{ \Carbon\Carbon::parse($invoice->periode)->translatedFormat('F Y') }}</td>
                    <td class="text-right font-black">Rp {{ number_format($invoice->nominal_tagihan, 0, ',', '.') }}</td>
                    <td class="text-right" style="color: #e53e3e; font-weight: bold;">
                        Rp {{ number_format($invoice->nominal_tagihan - $invoice->nominal_terbayar, 0, ',', '.') }}
                    </td>
                    <td style="text-align: center;">
                        @if($invoice->status == 'paid')
                            <span class="status-badge status-lunas">LUNAS</span>
                        @elseif($invoice->status == 'partial')
                            <span class="status-badge" style="background-color: #fffaf0; color: #9c4221;">CICILAN</span>
                        @else
                            <span class="status-badge status-belum">BELUM BAYAR</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #a0aec0;">Tidak ada data tagihan yang ditemukan.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
