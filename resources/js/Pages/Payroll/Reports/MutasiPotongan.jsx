import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronDownIcon, ChevronRightIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);

export default function MutasiPotongan({ rows = [], summary = {}, filters = {} }) {
    const [expanded, setExpanded] = useState({});

    const handlePeriode = (e) => {
        router.get('/laporan-payroll/mutasi-potongan', { periode: e.target.value }, { preserveState: true });
    };

    const toggle = (idx) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

    return (
        <AppLayout title="Mutasi Potongan">
            <Head title="Mutasi Potongan — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mutasi Potongan</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Daftar Potongan Gaji untuk Setoran Eksternal (BPJS, Koperasi, dll)
                    </p>
                </div>
                <input
                    type="month"
                    value={filters.periode || ''}
                    onChange={handlePeriode}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-rose-100"
                />
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jenis Potongan</p>
                    <p className="text-2xl font-black text-gray-900">{summary.total_components || 0}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Total Potongan</p>
                    <p className="text-2xl font-black text-rose-700">{formatCurrency(summary.grand_total)}</p>
                </div>
            </div>

            {/* List per komponen */}
            <div className="space-y-4 mb-10">
                {rows.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <p className="text-sm text-gray-400 font-black uppercase tracking-widest">Tidak ada potongan di periode ini.</p>
                    </div>
                )}
                {rows.map((row, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <button
                            onClick={() => toggle(idx)}
                            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <ArrowDownCircleIcon className="w-6 h-6 text-rose-600" />
                                <div className="text-left">
                                    <p className="text-base font-black text-gray-900">{row.component_name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        {row.category} · {row.count_teachers} guru
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-black text-rose-700 tabular-nums">{formatCurrency(row.total_amount)}</span>
                                {expanded[idx]
                                    ? <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                    : <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
                            </div>
                        </button>
                        {expanded[idx] && (
                            <div className="border-t border-gray-100 bg-gray-50/50 divide-y divide-gray-100">
                                {row.detail.map((d, i) => (
                                    <div key={i} className="px-6 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{d.teacher_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">NIP {d.nip}</p>
                                        </div>
                                        <span className="text-sm font-black text-rose-700 tabular-nums">{formatCurrency(d.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AppLayout>
    );
}
