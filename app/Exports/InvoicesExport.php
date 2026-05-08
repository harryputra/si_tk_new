<?php

namespace App\Exports;

use App\Models\Invoice;
use App\Models\SchoolSetting;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InvoicesExport implements FromQuery, WithMapping, WithHeadings, ShouldAutoSize, WithStyles, WithEvents
{
    protected $filters;
    protected $school;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
        $this->school = SchoolSetting::first();
    }

    public function query()
    {
        $query = Invoice::with(['student', 'tariff']);

        if (!empty($this->filters['student_id'])) {
            $query->where('student_id', $this->filters['student_id']);
        }
        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }
        if (!empty($this->filters['school_class_id'])) {
            $query->whereHas('student', function ($q) {
                $q->where('current_class_id', $this->filters['school_class_id']);
            });
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            ['LAPORAN TAGIHAN SISWA'],
            [$this->school->name ?? 'TK ATTAUHID'],
            [$this->school->address ?? '-'],
            ['Telp: ' . ($this->school->phone ?? '-') . ' | Email: ' . ($this->school->email ?? '-')],
            [''], // Spacer
            [
                'ID Tagihan',
                'Siswa',
                'NIS',
                'Jenis Tagihan',
                'Periode',
                'Nominal Tagihan',
                'Sisa Hutang',
                'Status',
                'Jatuh Tempo',
                'Metadata Audit (Internal Only)',
            ]
        ];
    }

    public function map($invoice): array
    {
        return [
            $invoice->id,
            $invoice->student->nama_lengkap ?? '-',
            $invoice->student->nis ?? '-',
            $invoice->tariff->nama_tarif ?? 'Tarif Umum',
            $invoice->periode->format('F Y'),
            (float) $invoice->nominal_tagihan,
            (float) ($invoice->nominal_tagihan - $invoice->nominal_terbayar),
            strtoupper($invoice->status),
            $invoice->jatuh_tempo ? $invoice->jatuh_tempo->format('d/m/Y') : '-',
            'Exported by: ' . (auth()->user()->name ?? 'System') . ' | ' . now()->format('d/m/Y H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Security: Protect the sheet to prevent easy manipulation
        $sheet->getProtection()->setPassword('SECURE_ATTAUHID_' . date('Y'));
        $sheet->getProtection()->setSheet(true);
        $sheet->getProtection()->setSort(true);
        $sheet->getProtection()->setInsertRows(false);
        $sheet->getProtection()->setFormatCells(false);

        return [
            1 => ['font' => ['bold' => true, 'size' => 16]],
            2 => ['font' => ['bold' => true, 'size' => 14]],
            3 => ['font' => ['italic' => true, 'size' => 10]],
            4 => ['font' => ['size' => 9, 'color' => ['rgb' => '64748B']]],
            6 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E40AF'] // Brand Blue
                ]
            ],
            'J' => ['font' => ['italic' => true, 'size' => 8, 'color' => ['rgb' => '94A3B8']]], // Metadata column styling
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                // Merge rows for title and school info
                $event->sheet->mergeCells('A1:J1');
                $event->sheet->mergeCells('A2:J2');
                $event->sheet->mergeCells('A3:J3');
                $event->sheet->mergeCells('A4:J4');
                
                // Alignment
                $event->sheet->getDelegate()->getStyle('A1:A4')->getAlignment()->setHorizontal('center');
            },
        ];
    }
}
