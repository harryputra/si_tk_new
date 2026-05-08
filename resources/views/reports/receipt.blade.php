<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bukti Pembayaran - {{ $pembayaran->id }}</title>
    <style>
        @page {
            size: A5 landscape;
            margin: 0;
        }
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 30px;
            background: #fff;
        }
        .container {
            width: 100%;
            border: 1px solid #eee;
            padding: 20px;
            position: relative;
        }
        .header {
            text-align: center;
            border-bottom: 2px double #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
        }
        .header p {
            margin: 2px 0;
            font-size: 10px;
        }
        .receipt-title {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            text-decoration: underline;
            margin-bottom: 20px;
        }
        .details {
            width: 100%;
            margin-bottom: 20px;
        }
        .details td {
            padding: 3px 0;
            vertical-align: top;
        }
        .label {
            width: 120px;
        }
        .colon {
            width: 15px;
        }
        .amount-box {
            border: 1px solid #333;
            padding: 10px;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
        }
        .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature {
            text-align: center;
            width: 150px;
        }
        .signature-name {
            margin-top: 60px;
            border-top: 1px solid #333;
            padding-top: 5px;
            font-weight: bold;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            color: rgba(0,0,0,0.05);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
            white-space: nowrap;
        }
        @media print {
            .no-print { display: none; }
        }
    </style>
</head>
<body onload="window.print()">
    <div class="no-print" style="margin-bottom: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer;">Cetak Sekarang</button>
        <button onclick="window.close()" style="padding: 10px 20px; cursor: pointer;">Tutup</button>
    </div>

    <div class="container">
        <div class="watermark">PAID / LUNAS</div>
        
        <div class="header">
            <h1>TK ISLAM ATTAUHID</h1>
            <p>Jl. Raya Attauhid No. 123, Kota Administrasi, Indonesia</p>
            <p>Telp: (021) 1234567 | Email: info@tk-attauhid.sch.id</p>
        </div>

        <div class="receipt-title">BUKTI PEMBAYARAN (KWITANSI)</div>

        <table class="details">
            <tr>
                <td class="label">No. Transaksi</td>
                <td class="colon">:</td>
                <td style="font-weight: bold;">PAY-{{ str_pad($pembayaran->id, 6, '0', STR_PAD_LEFT) }}</td>
            </tr>
            <tr>
                <td class="label">Tanggal</td>
                <td class="colon">:</td>
                <td>{{ \Carbon\Carbon::parse($pembayaran->approved_at)->format('d F Y') }}</td>
            </tr>
            <tr>
                <td class="label">Diterima Dari</td>
                <td class="colon">:</td>
                <td style="font-weight: bold;">{{ strtoupper($pembayaran->student->nama_lengkap) }} ({{ $pembayaran->student->nis ?: 'CALON SISWA' }})</td>
            </tr>
            <tr>
                <td class="label">Untuk Pembayaran</td>
                <td class="colon">:</td>
                <td>{{ $pembayaran->invoice->tariff->nama_tarif }} 
                    @if($pembayaran->invoice->periode)
                        - {{ \Carbon\Carbon::parse($pembayaran->invoice->periode)->format('F Y') }}
                    @endif
                </td>
            </tr>
            <tr>
                <td class="label">Metode / Bank</td>
                <td class="colon">:</td>
                <td>{{ strtoupper($pembayaran->jenis_transaksi) }} {{ $pembayaran->account ? ' / ' . $pembayaran->account->bank : '' }}</td>
            </tr>
        </table>

        <div>Terbilang: <i>"{{ ucfirst(\Illuminate\Support\Str::of(number_format($pembayaran->total_bayar, 0, '', ''))->words(100)) }} Rupiah"</i></div>
        
        <div class="amount-box">
            Rp {{ number_format($pembayaran->total_bayar, 0, ',', '.') }},-
        </div>

        <div class="footer">
            <div class="signature">
                <p>Orang Tua / Wali</p>
                <div class="signature-name">( .................... )</div>
            </div>
            <div class="signature">
                <p>Petugas Administrasi</p>
                <div class="signature-name">{{ strtoupper($pembayaran->approvedBy->name ?? 'Admin') }}</div>
            </div>
        </div>
    </div>
</body>
</html>
