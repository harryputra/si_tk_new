import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import {
    ChartBarIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
    DocumentTextIcon,
    ArrowUpRightIcon,
    ClockIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Index({ budgets = [], filters = {}, accounts = [], summary = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [originalPagu, setOriginalPagu] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kind: 'pengeluaran',
        rkas_account_id: '',
        kode_rkas: '',
        uraian: '',
        kategori_utama: '',
        sub_kategori: '',
        pagu_anggaran: 0,
        tahun_anggaran: filters.tahun || new Date().getFullYear(),
        revision_reason: '',
    });

    const handleEdit = useCallback((budget) => {
        setEditData(budget);
        setOriginalPagu(parseFloat(budget.pagu_anggaran || 0));
        setData({
            kind: budget.kind || 'pengeluaran',
            rkas_account_id: budget.rkas_account_id || '',
            kode_rkas: budget.kode_rkas,
            uraian: budget.uraian,
            kategori_utama: budget.kategori_utama || '',
            sub_kategori: budget.sub_kategori || '',
            pagu_anggaran: budget.pagu_anggaran,
            tahun_anggaran: budget.tahun_anggaran,
            revision_reason: '',
        });
        setIsModalOpen(true);
    }, [setData]);

    const handleApprove = useCallback((id) => {
        if (confirm('Setujui & aktifkan anggaran ini? Setelah aktif, hanya bisa dirubah dengan revisi resmi (akan revert ke draft).')) {
            router.post(`/rkas/${id}/approve`);
        }
    }, []);

    const handleArchive = useCallback((id) => {
        if (confirm('Arsipkan anggaran ini? Tidak bisa dipakai lagi untuk pengajuan baru.')) {
            router.post(`/rkas/${id}/archive`);
        }
    }, []);

    const handleFilter = useCallback((key, value) => {
        router.get('/rkas', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    }, [filters]);

    const handleRecompute = useCallback((id) => {
        if (confirm('Hitung ulang nilai "terpakai" dari sum pengajuan disbursed? Ini hanya untuk recovery kalau data drift.')) {
            router.post(`/rkas/${id}/recompute-terpakai`);
        }
    }, []);

    const handleDelete = useCallback((id) => {
        if (confirm('Yakin ingin menghapus anggaran ini?')) {
            router.delete(`/rkas/${id}`);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(`/rkas/${editData.id}`, { onSuccess: () => closeModal() });
        } else {
            post('/rkas', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    const sumPendapatanTarget = summary?.pendapatan?.total_target || 0;
    const sumPendapatanRealisasi = summary?.pendapatan?.total_realisasi || 0;
    const sumPengeluaranPagu = summary?.pengeluaran?.total_pagu || 0;
    const sumPengeluaranRealisasi = summary?.pengeluaran?.total_realisasi || 0;

    const targetButton = () => {
        const initialKind = filters.kind === 'pendapatan' ? 'pendapatan' : 'pengeluaran';
        setData('kind', initialKind);
        setIsModalOpen(true);
    };

    return (
        <AppLayout title="Master RKAS">
            <Head title="Manajemen RKAS — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Anggaran RKAS</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Rencana Kegiatan & Anggaran Sekolah · TA {filters.tahun || new Date().getFullYear()}
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={targetButton}
                    className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 shrink-0"
                    icon={<PlusIcon className="w-5 h-5" />}
                >
                    Tambah Anggaran
                </Button>
            </div>

            {/* Dual Summary Cards: Pendapatan vs Pengeluaran */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ArrowDownCircleIcon className="w-7 h-7 text-emerald-700" />
                        <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Pendapatan</h3>
                    </div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Target</p>
                    <p className="text-2xl font-black text-emerald-700 mb-3">{formatCurrency(sumPendapatanTarget)}</p>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Realisasi</p>
                    <p className="text-lg font-black text-emerald-700">{formatCurrency(sumPendapatanRealisasi)}</p>
                    {sumPendapatanTarget > 0 && (
                        <div className="mt-2 w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${Math.min((sumPendapatanRealisasi / sumPendapatanTarget) * 100, 100)}%` }} />
                        </div>
                    )}
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ArrowUpCircleIcon className="w-7 h-7 text-rose-700" />
                        <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest">Pengeluaran</h3>
                    </div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Pagu (Limit)</p>
                    <p className="text-2xl font-black text-rose-700 mb-3">{formatCurrency(sumPengeluaranPagu)}</p>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Realisasi</p>
                    <p className="text-lg font-black text-rose-700">{formatCurrency(sumPengeluaranRealisasi)}</p>
                    {sumPengeluaranPagu > 0 && (
                        <div className="mt-2 w-full h-2 bg-rose-100 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${Math.min((sumPengeluaranRealisasi / sumPengeluaranPagu) * 100, 100)}%` }} />
                        </div>
                    )}
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 mb-10 flex flex-wrap items-center gap-4">
                <PremiumSelect
                    className="min-w-[180px]"
                    value={filters.kind || ''}
                    onChange={(e) => handleFilter('kind', e.target.value)}
                    options={[
                        { value: '', label: 'SEMUA SISI' },
                        { value: 'pendapatan', label: 'PENDAPATAN' },
                        { value: 'pengeluaran', label: 'PENGELUARAN' },
                    ]}
                />
                <PremiumSelect
                    className="min-w-[180px]"
                    value={filters.status || ''}
                    onChange={(e) => handleFilter('status', e.target.value)}
                    options={[
                        { value: '', label: 'SEMUA STATUS' },
                        { value: 'draft', label: 'DRAFT' },
                        { value: 'active', label: 'AKTIF' },
                        { value: 'archived', label: 'ARSIP' },
                    ]}
                />
                <PremiumSelect
                    className="min-w-[160px]"
                    value={filters.tahun || new Date().getFullYear()}
                    onChange={(e) => handleFilter('tahun', e.target.value)}
                    options={[
                        { value: '2023', label: 'TAHUN 2023' },
                        { value: '2024', label: 'TAHUN 2024' },
                        { value: '2025', label: 'TAHUN 2025' },
                        { value: '2026', label: 'TAHUN 2026' },
                        { value: '2027', label: 'TAHUN 2027' },
                    ]}
                />
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Sisi & Status',
                            render: (row) => (
                                <div className="flex flex-col gap-1.5">
                                    <span className={clsx(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit",
                                        row.kind === 'pendapatan' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                    )}>
                                        {row.kind === 'pendapatan'
                                            ? <ArrowDownCircleIcon className="w-3 h-3" />
                                            : <ArrowUpCircleIcon className="w-3 h-3" />}
                                        {row.kind || 'pengeluaran'}
                                    </span>
                                    <span className={clsx(
                                        "inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit",
                                        row.status === 'active' && "bg-emerald-100 text-emerald-700",
                                        row.status === 'approved' && "bg-blue-100 text-blue-700",
                                        row.status === 'draft' && "bg-amber-100 text-amber-700",
                                        row.status === 'archived' && "bg-gray-100 text-gray-500",
                                    )}>
                                        {row.status || 'active'}
                                    </span>
                                </div>
                            )
                        },
                        {
                            label: 'Kode',
                            render: (row) => (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-700 font-mono tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        {row.kode_rkas || '0.0.0'}
                                    </span>
                                    {row.rkas_account?.kode && (
                                        <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest">
                                            COA: {row.rkas_account.kode} {row.rkas_account.name}
                                        </span>
                                    )}
                                </div>
                            )
                        },
                        {
                            label: 'Deskripsi Anggaran',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-blue-100 shrink-0 transform rotate-1">
                                        <DocumentTextIcon className="w-6 h-6 transform -rotate-1" />
                                    </div>
                                    <div className="flex-1 min-w-0 max-w-[400px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-base font-black text-gray-900 tracking-tight leading-tight">
                                                {row.uraian && row.uraian.length > 60 
                                                    ? `${row.uraian.substring(0, 60)}...` 
                                                    : (row.uraian || 'Uraian Kosong')}
                                            </p>
                                            {row.uraian && row.uraian.length > 60 && (
                                                <button 
                                                    onClick={() => setDetailData(row)}
                                                    className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest whitespace-nowrap"
                                                >
                                                    Lihat Detail
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">{row.kategori_utama} · {row.sub_kategori || 'GENERAL'}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Pagu & Realisasi',
                            render: (row) => {
                                const pagu = parseFloat(row.pagu_anggaran || 0);
                                const terpakai = parseFloat(row.terpakai || 0);
                                const pct = pagu > 0 ? Math.min((terpakai / pagu) * 100, 100) : 0;
                                const isOver = terpakai > pagu;
                                
                                return (
                                    <div className="min-w-[200px]">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-sm font-black text-gray-900 tracking-tight leading-tight">{formatCurrency(pagu)}</p>
                                            <p className={clsx(
                                                "text-[10px] font-black tracking-widest uppercase",
                                                isOver ? "text-rose-500" : "text-gray-300"
                                            )}>
                                                {pct.toFixed(0)}% USED
                                            </p>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                            <div 
                                                className={clsx(
                                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                                    isOver ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.2)]"
                                                )}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <ArrowUpRightIcon className="w-3 h-3 text-gray-300" />
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">REALISASI: {formatCurrency(terpakai)}</p>
                                        </div>
                                    </div>
                                );
                            }
                        }
                    ]}
                    data={budgets || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            {/* Approve button — muncul kalau status=draft */}
                            {row.status === 'draft' && (
                                <button
                                    onClick={() => handleApprove(row.id)}
                                    className="px-4 h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all"
                                    title="Setujui & Aktifkan"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    APPROVE
                                </button>
                            )}
                            {/* Archive button — muncul kalau status=active */}
                            {row.status === 'active' && (
                                <button
                                    onClick={() => handleArchive(row.id)}
                                    className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-all"
                                    title="Arsipkan"
                                >
                                    <ArchiveBoxIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => setHistoryData(row)}
                                className={clsx(
                                    "w-11 h-11 rounded-xl bg-white border flex items-center justify-center transition-all group relative",
                                    (row.revisions?.length || 0) > 0
                                        ? "border-violet-200 text-violet-600 hover:bg-violet-50"
                                        : "border-gray-200 text-gray-300"
                                )}
                                title={`${row.revisions?.length || 0} revisi tercatat`}
                            >
                                <ClockIcon className="w-5 h-5" />
                                {(row.revisions?.length || 0) > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                        {row.revisions.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => handleRecompute(row.id)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all group"
                                title="Hitung Ulang Terpakai (recovery)"
                            >
                                <ArrowPathIcon className="w-5 h-5 transition-transform group-hover:rotate-180" />
                            </button>
                            <button
                                onClick={() => handleEdit(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 flex items-center justify-center transition-all group"
                                title="Edit Data"
                            >
                                <PencilSquareIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
                            </button>
                            <button
                                onClick={() => handleDelete(row.id)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all group"
                                title="Hapus Data"
                            >
                                <TrashIcon className="w-5 h-5 transition-transform group-hover:scale-90" />
                            </button>
                        </div>
                    )}
                />
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editData ? 'Edit Anggaran RKAS' : 'Tambah Anggaran RKAS'}
                description={editData ? 'Perbarui informasi pos anggaran RKAS di bawah ini.' : 'Daftarkan pos anggaran baru untuk tahun anggaran terpilih.'}
                icon={editData ? <PencilSquareIcon className="w-5 h-5" /> : <ChartBarIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="rkas-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200"
                        >
                            {editData ? 'Update Anggaran' : 'Simpan Anggaran Baru'}
                        </Button>
                        <Button 
                            type="button" 
                            onClick={closeModal} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Batalkan
                        </Button>
                    </>
                }
            >
                <form id="rkas-form" onSubmit={submit} className="space-y-6">
                    {/* Kind: Pendapatan/Pengeluaran selector */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => { setData('kind', 'pendapatan'); setData('rkas_account_id', ''); }}
                            className={clsx(
                                "p-4 rounded-2xl border-2 transition-all text-left",
                                data.kind === 'pendapatan'
                                    ? "border-emerald-400 bg-emerald-50"
                                    : "border-gray-100 hover:border-emerald-200"
                            )}
                        >
                            <ArrowDownCircleIcon className={clsx("w-7 h-7 mb-2", data.kind === 'pendapatan' ? "text-emerald-600" : "text-gray-300")} />
                            <p className={clsx("text-sm font-black", data.kind === 'pendapatan' ? "text-emerald-700" : "text-gray-500")}>PENDAPATAN</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Target uang masuk (SPP, BOS, hibah)</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setData('kind', 'pengeluaran'); setData('rkas_account_id', ''); }}
                            className={clsx(
                                "p-4 rounded-2xl border-2 transition-all text-left",
                                data.kind === 'pengeluaran'
                                    ? "border-rose-400 bg-rose-50"
                                    : "border-gray-100 hover:border-rose-200"
                            )}
                        >
                            <ArrowUpCircleIcon className={clsx("w-7 h-7 mb-2", data.kind === 'pengeluaran' ? "text-rose-600" : "text-gray-300")} />
                            <p className={clsx("text-sm font-black", data.kind === 'pengeluaran' ? "text-rose-700" : "text-gray-500")}>PENGELUARAN</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Plafon belanja (gaji, listrik, kegiatan)</p>
                        </button>
                    </div>

                    {/* COA picker — filtered by kind */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Akun (Chart of Accounts)
                        </label>
                        <PremiumSelect
                            value={data.rkas_account_id}
                            onChange={(e) => setData('rkas_account_id', e.target.value)}
                            options={[
                                { value: '', label: '-- TANPA AKUN COA (legacy/lain-lain) --' },
                                ...(accounts || []).filter(a => a.kind === data.kind).map(a => ({
                                    value: String(a.id),
                                    label: `${'  '.repeat(a.level || 0)}${a.kode} ${a.name}`,
                                })),
                            ]}
                        />
                        <p className="text-[10px] text-gray-400 font-bold ml-1">
                            Pilih akun terdekat dgn pos ini. Atau biarkan kosong kalau pos generik.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Kode RKAS (internal)"
                            name="kode_rkas"
                            required
                            value={data.kode_rkas}
                            onChange={e => setData('kode_rkas', e.target.value)}
                            error={errors.kode_rkas}
                            placeholder="1.1.1"
                            inputClassName="font-mono font-bold tracking-widest text-blue-600"
                        />
                        <InputField
                            label="Tahun Anggaran"
                            name="tahun_anggaran"
                            type="number"
                            required
                            value={data.tahun_anggaran}
                            onChange={e => setData('tahun_anggaran', e.target.value)}
                            error={errors.tahun_anggaran}
                        />
                    </div>
                    
                    <InputField
                        label="Uraian / Deskripsi Anggaran"
                        name="uraian"
                        required
                        value={data.uraian}
                        onChange={e => setData('uraian', e.target.value)}
                        error={errors.uraian}
                        placeholder="Contoh: Honor Guru Bantu"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Kategori Utama"
                            name="kategori_utama"
                            required
                            value={data.kategori_utama}
                            onChange={e => setData('kategori_utama', e.target.value)}
                            error={errors.kategori_utama}
                            placeholder="Contoh: Honorarium"
                        />
                        <InputField
                            label="Sub Kategori"
                            name="sub_kategori"
                            value={data.sub_kategori}
                            onChange={e => setData('sub_kategori', e.target.value)}
                            error={errors.sub_kategori}
                            placeholder="Opsional"
                        />
                    </div>

                    <InputField
                        label="Pagu Anggaran (Limit)"
                        name="pagu_anggaran"
                        type="number"
                        required
                        prefix="Rp"
                        value={data.pagu_anggaran}
                        onChange={e => setData('pagu_anggaran', e.target.value)}
                        error={errors.pagu_anggaran}
                        inputClassName="text-xl font-black text-blue-600 tracking-tight"
                    />

                    {/* Revision reason — muncul saat edit + pagu berubah dari nilai original */}
                    {editData && originalPagu !== null && parseFloat(data.pagu_anggaran || 0) !== originalPagu && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">
                                    <ClockIcon className="w-4 h-4 inline mr-1" />
                                    REVISI ANGGARAN — ALASAN WAJIB
                                </p>
                                <p className="text-xs text-amber-800">
                                    Pagu berubah {formatCurrency(originalPagu)} → {formatCurrency(data.pagu_anggaran)}.
                                    Akan tercatat di audit log dengan alasan ini.
                                </p>
                            </div>
                            <textarea
                                value={data.revision_reason}
                                onChange={(e) => setData('revision_reason', e.target.value)}
                                rows={2}
                                required
                                className="w-full rounded-xl border-amber-300 focus:border-amber-500 focus:ring-amber-500 text-sm py-3 px-4"
                                placeholder='mis. "Penambahan pagu sesuai SK Yayasan No. 25/2026 — kebutuhan renovasi kelas"'
                            />
                            {errors.revision_reason && (
                                <p className="text-xs font-bold text-rose-600 ml-1">{errors.revision_reason}</p>
                            )}
                        </div>
                    )}
                </form>
            </Modal>

            {/* HISTORY MODAL */}
            <Modal
                show={!!historyData}
                onClose={() => setHistoryData(null)}
                title={`Riwayat Revisi — ${historyData?.kode_rkas || ''}`}
                description={historyData?.uraian}
                icon={<ClockIcon className="w-5 h-5" />}
                maxWidth="2xl"
                footer={
                    <Button type="button" onClick={() => setHistoryData(null)} variant="secondary"
                        className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                        Tutup
                    </Button>
                }
            >
                {(historyData?.revisions?.length || 0) === 0 ? (
                    <p className="text-center text-sm text-gray-400 font-bold py-8">
                        Belum ada revisi tercatat untuk pos ini.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {historyData.revisions.map(r => (
                            <div key={r.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-widest">
                                        {r.field_changed}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold">
                                        {new Date(r.created_at).toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-gray-700 mb-1">
                                    {r.field_changed === 'pagu_anggaran'
                                        ? <>Rp {Number(r.old_value).toLocaleString('id-ID')} → Rp {Number(r.new_value).toLocaleString('id-ID')}</>
                                        : <>{r.old_value || '(kosong)'} → {r.new_value || '(kosong)'}</>}
                                </p>
                                <p className="text-sm text-gray-900 italic">"{r.reason}"</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-1">oleh {r.changed_by || '—'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
 
            {/* DETAIL MODAL */}
            <Modal
                show={!!detailData}
                onClose={() => setDetailData(null)}
                title="Detail Anggaran RKAS"
                description={`Informasi lengkap untuk kode: ${detailData?.kode_rkas || ''}`}
                icon={<DocumentTextIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <Button type="button" onClick={() => setDetailData(null)} variant="secondary"
                        className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                        Tutup
                    </Button>
                }
            >
                {detailData && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Uraian / Deskripsi Lengkap</p>
                            <p className="text-lg font-black text-gray-900 leading-tight">
                                {detailData.uraian}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-100 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kategori Utama</p>
                                <p className="text-xs font-bold text-gray-900">{detailData.kategori_utama}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sub Kategori</p>
                                <p className="text-xs font-bold text-gray-900">{detailData.sub_kategori || '-'}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Pagu Anggaran</p>
                                    <p className="text-xl font-black text-blue-600">{formatCurrency(detailData.pagu_anggaran)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tahun</p>
                                    <p className="text-xl font-black text-blue-600">{detailData.tahun_anggaran}</p>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-blue-200/50 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{ width: `${detailData.persentase_terpakai}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <p className="text-[9px] font-bold text-blue-500 uppercase">Terpakai: {formatCurrency(detailData.terpakai)}</p>
                                <p className="text-[9px] font-bold text-blue-500 uppercase">{detailData.persentase_terpakai}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
