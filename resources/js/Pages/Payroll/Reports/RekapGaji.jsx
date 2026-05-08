import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import clsx from 'clsx';

const formatCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);

export default function RekapGaji({ rows = [], summary = {}, filters = {} }) {
    const handlePeriode = (e) => {
        router.get('/laporan-payroll/rekap', { periode: e.target.value }, { preserveState: true });
    };

    return (
        <AppLayout title="Rekapitulasi Gaji">
            <Head title="Rekapitulasi Gaji — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Rekapitulasi Gaji</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Total Belanja Pegawai per Periode
                    </p>
                </div>
                <input
                    type="month"
                    value={filters.periode || ''}
                    onChange={handlePeriode}
                    className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-100"
                />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <Card label="Jumlah Guru" value={summary.count} />
                <Card label="Total Pendapatan" value={formatCurrency(summary.sum_earning)} color="emerald" />
                <Card label="Total Potongan" value={formatCurrency(summary.sum_deduction)} color="rose" />
                <Card label="Total Belanja Gaji (THP)" value={formatCurrency(summary.sum_thp)} color="indigo" big />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
                <StatusCard label="Draft" value={summary.draft_count} color="amber" />
                <StatusCard label="Approved" value={summary.approved_count} color="emerald" />
                <StatusCard label="Paid" value={summary.paid_count} color="indigo" />
            </div>

            {/* Detail table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        { label: '#', render: (_, idx) => <span className="text-[10px] font-black text-gray-300">{idx + 1}</span> },
                        {
                            label: 'Guru',
                            render: (row) => (
                                <div>
                                    <p className="text-sm font-black text-gray-900">{row.teacher_name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{row.teacher_nip} · {row.jabatan || '—'}</p>
                                </div>
                            )
                        },
                        { label: 'Hadir/Alfa', render: (row) => <span className="text-xs font-black text-gray-700">{row.jumlah_hadir} / {row.jumlah_alfa}</span> },
                        { label: 'Pendapatan', render: (row) => <span className="text-sm font-black text-emerald-700 tabular-nums">{formatCurrency(row.total_earning)}</span> },
                        { label: 'Potongan', render: (row) => <span className="text-sm font-black text-rose-700 tabular-nums">{formatCurrency(row.total_deduction)}</span> },
                        { label: 'THP', render: (row) => <span className="text-sm font-black text-gray-900 tabular-nums">{formatCurrency(row.total_take_home_pay)}</span> },
                        {
                            label: 'Status',
                            render: (row) => (
                                <span className={clsx(
                                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                                    row.status_approval === 'paid' && 'bg-indigo-50 text-indigo-700',
                                    row.status_approval === 'approved' && 'bg-emerald-50 text-emerald-700',
                                    row.status_approval === 'draft' && 'bg-amber-50 text-amber-700'
                                )}>{row.status_approval}</span>
                            )
                        },
                    ]}
                    data={rows}
                    actions={(row) => (
                        <Link href={`/penggajian/${row.id}`} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800">
                            Detail →
                        </Link>
                    )}
                />
            </div>
        </AppLayout>
    );
}

function Card({ label, value, color = 'gray', big = false }) {
    const colors = {
        gray: 'bg-white text-gray-900',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        indigo: 'bg-gray-900 text-white',
    };
    return (
        <div className={clsx('rounded-2xl border border-gray-100 p-5', colors[color])}>
            <p className={clsx('text-[10px] font-black uppercase tracking-widest mb-1', color === 'indigo' ? 'text-gray-400' : 'text-gray-400')}>{label}</p>
            <p className={clsx('font-black tabular-nums', big ? 'text-2xl' : 'text-xl')}>{value}</p>
        </div>
    );
}

function StatusCard({ label, value, color }) {
    const colors = {
        amber: 'bg-amber-50 text-amber-700',
        emerald: 'bg-emerald-50 text-emerald-700',
        indigo: 'bg-indigo-50 text-indigo-700',
    };
    return (
        <div className={clsx('rounded-xl px-5 py-3', colors[color])}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black">{value || 0}</p>
        </div>
    );
}
