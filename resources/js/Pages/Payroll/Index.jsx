import React, { useCallback, useRef, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Button from '@/Components/Button';
import PremiumSelect from '@/Components/PremiumSelect';
import {
    BanknotesIcon,
    CheckCircleIcon,
    PrinterIcon,
    ArrowPathIcon,
    CalendarIcon,
    UserCircleIcon,
    AcademicCapIcon,
    ClockIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Index({ payrolls = [], filters = {} }) {
    const totalThp = payrolls.reduce((acc, curr) => acc + parseFloat(curr.total_take_home_pay || 0), 0);

    const handleGenerate = useCallback(() => {
        if (confirm(`Generate draft gaji untuk periode ${filters.periode || 'bulan ini'}?`)) {
            router.post('/penggajian/generate', { periode: filters.periode });
        }
    }, [filters.periode]);

    const handlePeriodChange = useCallback((value) => {
        router.get('/penggajian', { periode: value }, { preserveState: true });
    }, []);

    return (
        <AppLayout title="Penggajian Guru">
            <Head title="Manajemen Penggajian — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Penggajian Guru</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Pusat Manajemen Payroll & Honorarium Staf</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shrink-0">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">TOTAL PAYROLL PERIODE INI</p>
                        <p className="text-xl font-black text-indigo-600 tracking-tight">{formatCurrency(totalThp)}</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleGenerate}
                        className="px-8 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 shrink-0 border-none"
                        icon={<ArrowPathIcon className="w-5 h-5" />}
                    >
                        Generate Draft Gaji
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Periode Penggajian</p>
                        <input 
                            type="month" 
                            value={filters.periode || ''}
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-sm font-black text-gray-900 focus:ring-0 cursor-pointer uppercase tracking-tight"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3 bg-indigo-50/50 px-5 py-3 rounded-2xl border border-indigo-100">
                    <AcademicCapIcon className="w-5 h-5 text-indigo-400" />
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                        {payrolls.length} GURU TERDAFTAR
                    </p>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: '#',
                            render: (_, index) => (
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    {index + 1}
                                </span>
                            )
                        },
                        { 
                            label: 'Informasi Guru', 
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-100 shrink-0 transform -rotate-1">
                                        <div className="rotate-1">{row.teacher?.nama_lengkap?.charAt(0) || 'G'}</div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.teacher?.nama_lengkap || 'Staf Pengajar'}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">
                                            {new Date(row.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            )
                        },
                        { 
                            label: 'Statistik Kehadiran', 
                            render: (row) => (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">HADIR: {row.jumlah_hadir}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">ALFA: {row.jumlah_alfa}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-1">
                                        <ClockIcon className="w-3 h-3 text-gray-300" />
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">RECORDED ATTENDANCE</p>
                                    </div>
                                </div>
                            )
                        },
                        { 
                            label: 'THP Bersih', 
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-base font-black text-indigo-600 tracking-tight leading-tight mb-1">{formatCurrency(row.total_take_home_pay || 0)}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">TAKE HOME PAY</p>
                                </div>
                            )
                        },
                        { 
                            label: 'Verifikasi', 
                            render: (row) => <StatusBadge status={row.status_approval || 'draft'} />
                        },
                    ]}
                    data={payrolls || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            {row.status_approval === 'draft' && (
                                <button 
                                    onClick={() => confirm('Setujui draft gaji ini?') && router.post(`/penggajian/${row.id}/approve`)}
                                    className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center gap-2 group border-none"
                                >
                                    <CheckCircleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    APPROVE
                                </button>
                            )}
                            {row.status_approval === 'approved' && (
                                <button 
                                    onClick={() => confirm('Konfirmasi pembayaran gaji?') && router.post(`/penggajian/${row.id}/pay`)}
                                    className="h-11 px-6 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2 group border-none"
                                >
                                    <BanknotesIcon className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                                    BAYAR GAJI
                                </button>
                            )}
                            <Link
                                href={`/penggajian/${row.id}`}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all group"
                                title="Detail & Penyesuaian"
                            >
                                <EyeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </Link>
                            <a
                                href={`/penggajian/${row.id}/slip`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all group"
                                title="Cetak Slip Gaji (PDF)"
                            >
                                <PrinterIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </a>
                        </div>
                    )}
                />
            </div>
        </AppLayout>
    );
}
