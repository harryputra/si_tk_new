import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import { DocumentCheckIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);
const formatDate = (s) => s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function AuditKepegawaian({ rows = [], by_category = [], summary = {} }) {
    return (
        <AppLayout title="Audit Kepegawaian">
            <Head title="Audit Kepegawaian — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Audit Kepegawaian</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Daftar Penugasan Aktif & Bukti SK
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Penugasan Aktif</p>
                    <p className="text-2xl font-black text-gray-900">{summary.total_active_assignments || 0}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                        <CheckCircleIcon className="w-4 h-4 inline mr-1" /> Dengan Bukti SK
                    </p>
                    <p className="text-2xl font-black text-emerald-700">{summary.with_evidence || 0}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">
                        <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" /> Tanpa Bukti SK
                    </p>
                    <p className="text-2xl font-black text-rose-700">{summary.without_evidence || 0}</p>
                </div>
            </div>

            {/* By category */}
            {by_category.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-10">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Total Biaya per Kategori</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {by_category.map((c, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{c.category}</p>
                                <p className="text-sm font-black text-gray-900">{formatCurrency(c.total)}</p>
                                <p className="text-[10px] text-gray-500 font-bold">{c.count}× penugasan</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detail */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Guru',
                            render: (row) => (
                                <div>
                                    <p className="text-sm font-black text-gray-900">{row.teacher_name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{row.teacher_nip} · {row.jabatan || '—'}</p>
                                </div>
                            )
                        },
                        {
                            label: 'Komponen',
                            render: (row) => (
                                <div>
                                    <p className="text-sm font-black text-gray-900">{row.component_name}</p>
                                    <p className={clsx('text-[10px] font-black uppercase tracking-widest', row.kind === 'earning' ? 'text-emerald-600' : 'text-rose-600')}>
                                        {row.kind === 'earning' ? 'PENDAPATAN' : 'POTONGAN'} · {row.category || '—'}
                                    </p>
                                </div>
                            )
                        },
                        { label: 'Nominal', render: (row) => <span className="text-sm font-black text-gray-900 tabular-nums">{formatCurrency(row.nominal)}</span> },
                        {
                            label: 'Periode',
                            render: (row) => (
                                <div>
                                    <p className="text-xs font-black text-gray-700">{formatDate(row.effective_from)}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">s/d {row.effective_until ? formatDate(row.effective_until) : 'tanpa batas'}</p>
                                </div>
                            )
                        },
                        {
                            label: 'SK',
                            render: (row) => (
                                <div>
                                    {row.sk_number && <p className="text-xs font-black text-gray-700">{row.sk_number}</p>}
                                    {row.sk_file ? (
                                        <a href={`/storage/${row.sk_file}`} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800">
                                            <DocumentCheckIcon className="w-3.5 h-3.5" /> Lihat
                                        </a>
                                    ) : (
                                        <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">
                                            <ExclamationTriangleIcon className="w-3.5 h-3.5 inline mr-1" />
                                            Tanpa Bukti
                                        </p>
                                    )}
                                </div>
                            )
                        },
                    ]}
                    data={rows}
                />
            </div>
        </AppLayout>
    );
}
