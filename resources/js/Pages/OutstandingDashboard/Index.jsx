import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import PremiumSelect from '@/Components/PremiumSelect';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
}).format(Number(amount) || 0);

const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(Number(n) || 0);

export default function Index({
    students = { data: [], links: [] },
    classes = [],
    filters = {},
    totals = {},
}) {
    const [searchInput, setSearchInput] = useState(filters?.search || '');
    const searchTimeoutRef = useRef(null);

    const handleFilter = useCallback((key, value) => {
        router.get('/tunggakan-dashboard', { ...filters, [key]: value, page: 1 }, { preserveState: true, preserveScroll: true });
    }, [filters]);

    const handleSearchInputChange = useCallback((value) => {
        setSearchInput(value || '');
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            handleFilter('search', value || '');
        }, 500);
    }, [handleFilter]);

    const handleClearSearch = useCallback(() => {
        setSearchInput('');
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        handleFilter('search', '');
    }, [handleFilter]);

    useEffect(() => () => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    }, []);

    const rows = students?.data || [];

    return (
        <AppLayout title="Dashboard Tunggakan">
            <Head title="Dashboard Tunggakan Lintas Kelas — SI ERP TK Attauhid" />

            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Tunggakan</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Pantauan Tunggakan Lintas Kelas & Tahun Ajaran
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-rose-50 border border-rose-100 rounded-2xl px-6 py-5">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Siswa Bertunggakan Lama</p>
                    <p className="text-3xl font-black text-rose-700 tracking-tight">{formatNumber(totals.students_with_old_debt)}</p>
                    <p className="text-[10px] text-rose-300 font-black tracking-widest mt-2">DARI {formatNumber(totals.students_count)} SISWA</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl px-6 py-5">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Total Tunggakan Kelas Lama</p>
                    <p className="text-2xl font-black text-rose-700 tracking-tight">{formatCurrency(totals.total_old_debt)}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-5">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Total Tagihan Kelas Baru</p>
                    <p className="text-2xl font-black text-amber-700 tracking-tight">{formatCurrency(totals.total_current_debt)}</p>
                </div>
                <div className="bg-gray-900 border border-gray-900 rounded-2xl px-6 py-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Grand Total Kewajiban</p>
                    <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(totals.grand_total)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex-1 relative group">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama siswa atau NIS..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent rounded-[1.5rem] text-sm font-black text-gray-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-200 transition-all placeholder:text-gray-300 placeholder:font-bold"
                            value={searchInput}
                            onChange={(e) => handleSearchInputChange(e.target.value)}
                        />
                        {searchInput && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <PremiumSelect
                            className="min-w-[200px]"
                            value={filters.current_class_id || ''}
                            onChange={(e) => handleFilter('current_class_id', e.target.value)}
                            options={[
                                { value: '', label: 'SEMUA KELAS' },
                                { value: 'none', label: 'BELUM ADA KELAS' },
                                ...classes.map(c => ({
                                    value: String(c.id),
                                    label: `${(c.name || '').toUpperCase()} — ${(c.level || '').toUpperCase()}`,
                                })),
                            ]}
                        />
                        <PremiumSelect
                            className="min-w-[220px]"
                            value={filters.debt_status || ''}
                            onChange={(e) => handleFilter('debt_status', e.target.value)}
                            options={[
                                { value: '', label: 'SEMUA STATUS PIUTANG' },
                                { value: 'has_old', label: 'ADA TUNGGAKAN LAMA' },
                                { value: 'only_current', label: 'HANYA TAGIHAN BARU' },
                                { value: 'clear', label: 'LUNAS SEMUA' },
                            ]}
                        />
                        <PremiumSelect
                            className="min-w-[160px]"
                            value={filters.per_page || '25'}
                            onChange={(e) => handleFilter('per_page', e.target.value)}
                            options={[
                                { value: '10', label: 'TAMPILKAN 10' },
                                { value: '25', label: 'TAMPILKAN 25' },
                                { value: '50', label: 'TAMPILKAN 50' },
                                { value: '100', label: 'TAMPILKAN 100' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] w-12">#</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Siswa</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Kelas Sekarang</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Tunggakan Kelas Lama</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Tagihan Kelas Baru</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Kewajiban</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center text-sm text-gray-400 font-black uppercase tracking-[0.2em]">
                                        Tidak ada data sesuai filter.
                                    </td>
                                </tr>
                            ) : rows.map((s, idx) => {
                                const hasOldDebt = Number(s.debt_old) > 0;
                                const hasCurrentDebt = Number(s.debt_current) > 0;
                                const isClear = !hasOldDebt && !hasCurrentDebt;

                                return (
                                    <tr
                                        key={s.id}
                                        className={clsx(
                                            'border-b border-gray-100 transition-colors',
                                            hasOldDebt
                                                ? 'bg-rose-50/50 hover:bg-rose-50'
                                                : isClear
                                                    ? 'hover:bg-emerald-50/30'
                                                    : 'hover:bg-gray-50'
                                        )}
                                    >
                                        <td className="px-6 py-5 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                            {((students.current_page || 1) - 1) * (students.per_page || 25) + idx + 1}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                {hasOldDebt ? (
                                                    <ExclamationTriangleIcon className="w-5 h-5 text-rose-500 shrink-0" />
                                                ) : isClear ? (
                                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 ml-1.5" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-gray-900 tracking-tight leading-tight">{s.nama_lengkap}</p>
                                                    <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">NIS: {s.nis || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {s.current_class_name ? (
                                                <div>
                                                    <p className="text-sm font-black text-gray-800 leading-tight">{s.current_class_name}</p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{s.current_class_level}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">— BELUM ADA —</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {hasOldDebt ? (
                                                <p className="text-sm font-black text-rose-700 tracking-tight">{formatCurrency(s.debt_old)}</p>
                                            ) : (
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">LUNAS</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {hasCurrentDebt ? (
                                                <p className="text-sm font-black text-amber-700 tracking-tight">{formatCurrency(s.debt_current)}</p>
                                            ) : (
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">—</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <p className={clsx(
                                                'text-base font-black tracking-tight',
                                                hasOldDebt ? 'text-rose-700' : isClear ? 'text-emerald-600' : 'text-amber-700'
                                            )}>
                                                {isClear ? formatCurrency(0) : formatCurrency(s.debt_total)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <Link
                                                href={`/tagihan?student_id=${s.id}`}
                                                className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                                                title="Lihat Tagihan"
                                            >
                                                <EyeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                {rows.length > 0 && (
                    <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                            {students.from || 0}—{students.to || 0} dari {students.total || 0}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(students?.links || []).map((link, idx) => {
                                let label = link.label;
                                if (label.toLowerCase().includes('prev') || label.toLowerCase().includes('sebelum')) label = 'PREVIOUS';
                                else if (label.toLowerCase().includes('next') || label.toLowerCase().includes('berikut')) label = 'NEXT';

                                return (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={clsx(
                                            'min-w-[44px] h-11 px-4 inline-flex items-center justify-center text-[11px] font-black rounded-2xl transition-all uppercase tracking-widest',
                                            link.active
                                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                                                : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50 hover:text-gray-600',
                                            !link.url && 'opacity-20 cursor-not-allowed'
                                        )}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
