<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Slip Gaji - {{ $payroll->teacher->nama_lengkap }} - {{ \Carbon\Carbon::parse($payroll->periode)->translatedFormat('F Y') }}</title>
    <style>
        @page { margin: 25mm 18mm; }
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #1a1a1a; font-size: 11pt; line-height: 1.5; }
        .header { text-align: center; border-bottom: 3px double #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 16pt; color: #2563eb; letter-spacing: 1px; }
        .header h2 { margin: 4px 0 0; font-size: 12pt; font-weight: normal; color: #666; }
        .meta-table { width: 100%; margin-bottom: 18px; border-collapse: collapse; }
        .meta-table td { padding: 4px 8px; font-size: 10pt; }
        .meta-table td:first-child { font-weight: bold; width: 28%; color: #555; }
        .meta-table td:nth-child(3) { font-weight: bold; width: 22%; color: #555; }
        .section-title { font-weight: bold; font-size: 11pt; color: #1a1a1a; padding: 6px 0 4px; border-bottom: 2px solid #1a1a1a; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10pt; }
        table.items th, table.items td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #ddd; }
        table.items th { background: #f5f5f5; font-weight: bold; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }
        table.items td.num { text-align: right; }
        .total-row td { font-weight: bold; border-top: 2px solid #1a1a1a; border-bottom: 2px solid #1a1a1a; background: #fafafa; }
        .grand-total { margin-top: 18px; padding: 14px 18px; background: #f0f9ff; border-left: 5px solid #2563eb; }
        .grand-total .label { font-size: 10pt; color: #555; text-transform: uppercase; letter-spacing: 1px; }
        .grand-total .amount { font-size: 18pt; font-weight: bold; color: #2563eb; }
        .signature { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature .col { width: 45%; text-align: center; font-size: 10pt; }
        .signature .name-line { margin-top: 50px; border-top: 1px solid #1a1a1a; padding-top: 4px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 9pt; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
        .ref { font-size: 8pt; color: #777; font-style: italic; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SLIP GAJI</h1>
        <h2>SI ERP TK Attauhid</h2>
    </div>

    <table class="meta-table">
        <tr>
            <td>Nama</td>
            <td>: {{ $payroll->teacher->nama_lengkap }}</td>
            <td>NIP</td>
            <td>: {{ $payroll->teacher->nip }}</td>
        </tr>
        <tr>
            <td>Jabatan</td>
            <td>: {{ $payroll->teacher->jabatan ?? '—' }}</td>
            <td>Periode</td>
            <td>: {{ \Carbon\Carbon::parse($payroll->periode)->translatedFormat('F Y') }}</td>
        </tr>
        <tr>
            <td>Hari Hadir</td>
            <td>: {{ $payroll->jumlah_hadir }} hari</td>
            <td>Hari Alfa</td>
            <td>: {{ $payroll->jumlah_alfa }} hari</td>
        </tr>
    </table>

    @php
        $earnings = $payroll->items->where('kind', 'earning');
        $deductions = $payroll->items->where('kind', 'deduction');
        $sumEarning = $earnings->sum('amount');
        $sumDeduction = $deductions->sum('amount');
    @endphp

    <div class="section-title">Pendapatan</div>
    <table class="items">
        <thead>
            <tr>
                <th style="width: 50%">Komponen</th>
                <th style="width: 25%">Perhitungan</th>
                <th style="width: 25%; text-align: right;">Jumlah (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($earnings as $item)
                <tr>
                    <td>
                        {{ $item->description }}
                        @if($item->sk_number_snapshot)
                            <div class="ref">Ref. SK: {{ $item->sk_number_snapshot }}</div>
                        @endif
                        @if($item->is_manual)
                            <div class="ref">[Penyesuaian Manual]</div>
                        @endif
                    </td>
                    <td>
                        @if($item->formula === 'flat')
                            Flat
                        @else
                            {{ number_format($item->unit_count, 0, ',', '.') }} × {{ number_format($item->unit_nominal, 0, ',', '.') }}
                        @endif
                    </td>
                    <td class="num">{{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="3" style="text-align: center; color: #999; padding: 12px;">Tidak ada item pendapatan.</td></tr>
            @endforelse
            <tr class="total-row">
                <td colspan="2">Total Pendapatan</td>
                <td class="num">{{ number_format($sumEarning, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="section-title">Potongan</div>
    <table class="items">
        <thead>
            <tr>
                <th style="width: 50%">Komponen</th>
                <th style="width: 25%">Perhitungan</th>
                <th style="width: 25%; text-align: right;">Jumlah (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($deductions as $item)
                <tr>
                    <td>
                        {{ $item->description }}
                        @if($item->sk_number_snapshot)
                            <div class="ref">Ref: {{ $item->sk_number_snapshot }}</div>
                        @endif
                        @if($item->is_manual)
                            <div class="ref">[Penyesuaian Manual]</div>
                        @endif
                    </td>
                    <td>
                        @if($item->formula === 'flat')
                            Flat
                        @else
                            {{ number_format($item->unit_count, 0, ',', '.') }} × {{ number_format($item->unit_nominal, 0, ',', '.') }}
                        @endif
                    </td>
                    <td class="num">{{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="3" style="text-align: center; color: #999; padding: 12px;">Tidak ada potongan.</td></tr>
            @endforelse
            <tr class="total-row">
                <td colspan="2">Total Potongan</td>
                <td class="num">{{ number_format($sumDeduction, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="grand-total">
        <span class="label">Gaji Bersih (Take Home Pay):</span>
        <span class="amount" style="float: right;">Rp {{ number_format($payroll->total_take_home_pay, 0, ',', '.') }}</span>
        <div style="clear: both;"></div>
    </div>

    @if($payroll->adjustments->count() > 0)
        <div class="section-title">Riwayat Penyesuaian Manual</div>
        <table class="items">
            <thead>
                <tr><th>Tanggal</th><th>Aksi</th><th>Alasan</th><th>Oleh</th></tr>
            </thead>
            <tbody>
                @foreach($payroll->adjustments as $adj)
                    <tr>
                        <td>{{ $adj->created_at->translatedFormat('d M Y H:i') }}</td>
                        <td>{{ ucfirst($adj->action) }}</td>
                        <td>{{ $adj->reason }}</td>
                        <td>{{ $adj->changedBy?->name ?? '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="signature">
        <div class="col">
            <div>Bandung, {{ now()->translatedFormat('d F Y') }}</div>
            <div style="margin-top: 4px;">Bendahara,</div>
            <div class="name-line">{{ $payroll->paidBy?->name ?? '..............................' }}</div>
        </div>
        <div class="col">
            <div>Penerima,</div>
            <div class="name-line">{{ $payroll->teacher->nama_lengkap }}</div>
        </div>
    </div>

    <div class="footer">
        Slip ini dicetak otomatis dari Sistem Informasi ERP TK Attauhid pada {{ now()->translatedFormat('d F Y H:i') }}.<br>
        Status: {{ strtoupper($payroll->status_approval) }} · Payroll ID: #{{ $payroll->id }}
    </div>
</body>
</html>
