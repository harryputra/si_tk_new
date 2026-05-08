import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import { DocumentCheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const fmt = (v) => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(v || 0);

const JENIS_COLORS = {
    subsidi_yayasan: 'bg-blue-50 text-blue-600 border-blue-100',
    pemutihan: 'bg-purple-50 text-purple-600 border-purple-100',
    diskon_kelulusan: 'bg-amber-50 text-amber-600 border-amber-100',
};

const JENIS_LABELS = {
    subsidi_yayasan: 'Subsidi Yayasan',
    pemutihan: 'Pemutihan',
    diskon_kelulusan: 'Diskon Kelulusan',
};

export default function Report({ adjustments = [], summary = {} }) {
    return (
        <AppLayout title="Laporan Penyesuaian Kebijakan">
            <Head title="Laporan Kebijakan — SI ERP TK Attauhid" />

            {/* Header */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Laporan Penyesuaian Tagihan</h2>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Rekapitulasi Kebijakan Kelulusan — Arsip Yayasan</p>
                </div>
                <a href="/kelulusan" className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-[10px] uppercase tracking-widest transition-colors shrink-0">
                    ← Kembali ke Kelulusan
                </a>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Penyesuaian</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{summary.total_records || 0}</p>
                </div>
                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Nominal Dihapuskan</p>
                    <p className="text-2xl font-black text-rose-600 tracking-tight">{fmt(summary.total_nominal)}</p>
                </div>
                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Berdasarkan Jenis</p>
                    <div className="space-y-2">
                        {(summary.by_jenis || []).map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-600">{item.label} ({item.count}x)</span>
                                <span className="text-xs font-black text-gray-900">{fmt(item.total)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detail Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <DataTable
                    columns={[
                        { label: 'Nama Siswa', render: (row) => (
                            <div className="min-w-0">
                                <p className="text-sm font-black text-gray-900 truncate tracking-tight">{row.student?.nama_lengkap || '-'}</p>
                                <p className="text-[10px] text-gray-400 font-bold tracking-widest">{row.student?.nis}</p>
                            </div>
                        )},
                        { label: 'Tagihan Asli', render: (row) => <span className="text-sm font-bold text-gray-700">{fmt(row.nominal_asli)}</span> },
                        { label: 'Jenis Kebijakan', render: (row) => (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${JENIS_COLORS[row.jenis_kebijakan] || 'bg-gray-50 text-gray-600'}`}>
                                {JENIS_LABELS[row.jenis_kebijakan] || row.jenis_kebijakan}
                            </span>
                        )},
                        { label: 'Nominal Dihapuskan', render: (row) => <span className="text-sm font-black text-rose-600">{fmt(row.nominal_adjustment)}</span> },
                        { label: 'Admin', render: (row) => (
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-violet-500 shrink-0" />
                                <span className="text-xs font-bold text-gray-700">{row.admin?.name || '-'}</span>
                            </div>
                        )},
                        { label: 'Tanggal', render: (row) => (
                            <span className="text-xs font-bold text-gray-500">
                                {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-'}
                            </span>
                        )},
                    ]}
                    data={adjustments}
                />
            </div>
        </AppLayout>
    );
}
