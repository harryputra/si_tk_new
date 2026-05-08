import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);

export default function RkasCashFlow({ months = [], summary = {}, filters = {} }) {
    const handleTahun = (e) => {
        router.get('/laporan-rkas/cash-flow', { tahun: e.target.value }, { preserveState: true });
    };

    const yearEndBalance = summary.estimated_year_end_balance || 0;
    const isPositiveProjection = yearEndBalance >= 0;

    return (
        <AppLayout title="Cash Flow Projection">
            <Head title="Cash Flow Projection RKAS — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Cash Flow Projection</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        TA {summary.tahun} · Aktual + Estimasi (Januari–Desember)
                    </p>
                </div>
                <input
                    type="number"
                    value={filters.tahun || ''}
                    onChange={handleTahun}
                    placeholder="Tahun"
                    className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 w-32"
                />
            </div>

            {/* Top summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <Card label="Target Pendapatan" value={summary.total_target_pendapatan} icon={<ArrowDownCircleIcon className="w-5 h-5" />} color="emerald" />
                <Card label="Realisasi Pendapatan" value={summary.total_realisasi_pendapatan} icon={<ArrowDownCircleIcon className="w-5 h-5" />} color="emerald" highlight />
                <Card label="Pagu Pengeluaran" value={summary.total_pagu_pengeluaran} icon={<ArrowUpCircleIcon className="w-5 h-5" />} color="rose" />
                <Card label="Realisasi Pengeluaran" value={summary.total_realisasi_pengeluaran} icon={<ArrowUpCircleIcon className="w-5 h-5" />} color="rose" highlight />
            </div>

            {/* Year-end projection */}
            <div className={clsx(
                'rounded-3xl p-6 mb-10 border-2',
                isPositiveProjection ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            )}>
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        'w-14 h-14 rounded-2xl flex items-center justify-center',
                        isPositiveProjection ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    )}>
                        {isPositiveProjection
                            ? <ArrowTrendingUpIcon className="w-7 h-7" />
                            : <ArrowTrendingDownIcon className="w-7 h-7" />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            ESTIMASI SALDO AKHIR TAHUN {summary.tahun}
                        </p>
                        <p className={clsx('text-3xl font-black tabular-nums', isPositiveProjection ? 'text-emerald-700' : 'text-rose-700')}>
                            {formatCurrency(yearEndBalance)}
                        </p>
                        <p className="text-xs text-gray-500 font-bold mt-1">
                            Estimasi: Rp {Number(summary.est_per_month_in || 0).toLocaleString('id-ID')}/bln masuk · Rp {Number(summary.est_per_month_out || 0).toLocaleString('id-ID')}/bln keluar (sisa {summary.months_remaining} bulan)
                        </p>
                    </div>
                </div>
            </div>

            {/* Monthly table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-5 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                    <ChartBarIcon className="w-5 h-5 text-gray-400" />
                    <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">Per Bulan — Kas Masuk vs Keluar</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/60 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Bulan</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-emerald-600 uppercase tracking-widest">Masuk</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-rose-600 uppercase tracking-widest">Keluar</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Net</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-700 uppercase tracking-widest">Saldo Kumulatif</th>
                            </tr>
                        </thead>
                        <tbody>
                            {months.map(m => (
                                <tr key={m.bulan} className={clsx(
                                    'border-b border-gray-100',
                                    !m.is_historical && 'bg-blue-50/30'
                                )}>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-gray-900">{m.bulan_name}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {m.is_historical
                                            ? <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest">AKTUAL</span>
                                            : <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest">ESTIMASI</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm font-black text-emerald-700 tabular-nums">{formatCurrency(m.masuk)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-sm font-black text-rose-700 tabular-nums">{formatCurrency(m.keluar)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className={clsx(
                                            'text-sm font-black tabular-nums',
                                            m.net >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                        )}>
                                            {m.net >= 0 ? '+' : ''}{formatCurrency(m.net)}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className={clsx(
                                            'text-base font-black tabular-nums',
                                            m.saldo_kumulatif >= 0 ? 'text-gray-900' : 'text-rose-700'
                                        )}>
                                            {formatCurrency(m.saldo_kumulatif)}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-[10px] text-gray-400 font-bold text-center mt-4 mb-10">
                Catatan: Bulan dengan status ESTIMASI adalah proyeksi linier dari sisa pagu/target dibagi rata bulan tersisa.
                Untuk akurasi lebih tinggi, generate ulang setelah ada data historis baru.
            </p>
        </AppLayout>
    );
}

function Card({ label, value, icon, color, highlight }) {
    const colors = {
        emerald: highlight ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        rose: highlight ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 border border-rose-100',
    };
    return (
        <div className={clsx('rounded-2xl px-5 py-4', colors[color])}>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <p className={clsx('text-[10px] font-black uppercase tracking-widest', highlight ? 'text-white/80' : 'opacity-70')}>{label}</p>
            </div>
            <p className="text-xl font-black tabular-nums">{formatCurrency(value)}</p>
        </div>
    );
}
