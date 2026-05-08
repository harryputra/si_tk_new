import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);

export default function RkasVariance({ pendapatan = {}, pengeluaran = {}, filters = {} }) {
    const [expanded, setExpanded] = useState({});

    const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    const handleTahun = (e) => {
        router.get('/laporan-rkas/variance', { tahun: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout title="Laporan Variance RKAS">
            <Head title="Laporan Variance Anggaran vs Realisasi — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Variance Anggaran vs Realisasi</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        TA {filters.tahun} · Pendapatan & Pengeluaran per Standar
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

            {/* Pendapatan Section */}
            <KindSection
                title="PENDAPATAN"
                icon={<ArrowDownCircleIcon className="w-7 h-7" />}
                color="emerald"
                kindLabel="Target"
                varianceLabel="Surplus/(Kurang)"
                data={pendapatan}
                expanded={expanded}
                onToggle={toggle}
                kindKey="pendapatan"
            />

            {/* Pengeluaran Section */}
            <div className="mt-12">
                <KindSection
                    title="PENGELUARAN"
                    icon={<ArrowUpCircleIcon className="w-7 h-7" />}
                    color="rose"
                    kindLabel="Pagu"
                    varianceLabel="Sisa/(Over)"
                    data={pengeluaran}
                    expanded={expanded}
                    onToggle={toggle}
                    kindKey="pengeluaran"
                />
            </div>
        </AppLayout>
    );
}

function KindSection({ title, icon, color, kindLabel, varianceLabel, data, expanded, onToggle, kindKey }) {
    const colorClasses = {
        emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', accent: 'text-emerald-600' },
        rose: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', accent: 'text-rose-600' },
    };
    const c = colorClasses[color];

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', c.bg, c.text)}>
                    {icon}
                </div>
                <h3 className={clsx('text-2xl font-black tracking-tight', c.text)}>{title}</h3>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <SummaryCard label={kindLabel} value={data.sum_pagu} color={color} />
                <SummaryCard label="Realisasi" value={data.sum_realisasi} color={color} />
                <SummaryCard label={varianceLabel} value={data.sum_variance} color={data.sum_variance < 0 ? 'rose' : 'emerald'} highlight />
            </div>

            {(data.over_count > 0 || data.under_count > 0) && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs font-bold text-amber-800">
                        {color === 'rose' && data.over_count > 0 && `${data.over_count} pos OVER BUDGET. `}
                        {color === 'emerald' && data.under_count > 0 && `${data.under_count} pos belum capai target.`}
                    </p>
                </div>
            )}

            {/* Groups by COA root */}
            <div className="space-y-3">
                {(data.groups || []).length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                        <p className="text-sm text-gray-400 font-black uppercase tracking-widest">Tidak ada data {title.toLowerCase()} di tahun ini.</p>
                    </div>
                )}
                {(data.groups || []).map((g, idx) => {
                    const groupKey = `${kindKey}_${g.coa_root_kode}_${idx}`;
                    const isExpanded = expanded[groupKey];
                    const groupVariancePct = g.sum_pagu > 0 ? Math.round((g.sum_variance / g.sum_pagu) * 100) : 0;
                    return (
                        <div key={groupKey} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => onToggle(groupKey)}
                                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {isExpanded
                                        ? <ChevronDownIcon className="w-5 h-5 text-gray-400 shrink-0" />
                                        : <ChevronRightIcon className="w-5 h-5 text-gray-400 shrink-0" />}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-base font-black text-gray-900 truncate">{g.coa_root_name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{g.coa_root_kode} · {g.items.length} pos</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{kindLabel}</p>
                                        <p className="text-sm font-black text-gray-700">{formatCurrency(g.sum_pagu)}</p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Realisasi</p>
                                        <p className={clsx('text-sm font-black', c.text)}>{formatCurrency(g.sum_realisasi)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{varianceLabel}</p>
                                        <p className={clsx(
                                            'text-sm font-black',
                                            g.sum_variance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                        )}>
                                            {formatCurrency(g.sum_variance)}
                                            {g.sum_pagu > 0 && <span className="text-[10px] ml-1">({groupVariancePct}%)</span>}
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50/30 divide-y divide-gray-100">
                                    {g.items.map(item => (
                                        <div key={item.id} className={clsx(
                                            "px-6 py-4 flex items-center justify-between gap-4",
                                            item.is_over && "bg-rose-50/40",
                                            item.is_under && "bg-amber-50/40"
                                        )}>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-black text-gray-900 truncate">{item.uraian}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {item.kode_rkas}
                                                    {item.coa_kode && ` · COA ${item.coa_kode}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-6 shrink-0 text-right">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-700">{formatCurrency(item.pagu)}</p>
                                                </div>
                                                <div>
                                                    <p className={clsx('text-xs font-black', c.text)}>{formatCurrency(item.realisasi)}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{item.pct_realisasi}%</p>
                                                </div>
                                                <div>
                                                    <p className={clsx(
                                                        'text-xs font-black',
                                                        item.variance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                                    )}>
                                                        {formatCurrency(item.variance)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SummaryCard({ label, value, color, highlight }) {
    const colors = {
        emerald: highlight ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700',
        rose: highlight ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700',
    };
    return (
        <div className={clsx('rounded-2xl border border-gray-100 px-6 py-5', colors[color])}>
            <p className={clsx('text-[10px] font-black uppercase tracking-widest mb-1', highlight ? 'text-white/80' : 'opacity-60')}>{label}</p>
            <p className="text-2xl font-black tabular-nums">{formatCurrency(value)}</p>
        </div>
    );
}
