import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    CalculatorIcon,
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
}).format(Number(amount) || 0);

export default function Index({ components = [], filters = {}, enums = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        kind: 'earning',
        frequency: 'recurring',
        formula: 'flat',
        category: '',
        default_nominal: '',
        description: '',
        is_active: true,
    });

    const openCreate = useCallback(() => {
        setEditData(null);
        reset();
        setIsModalOpen(true);
    }, [reset]);

    const openEdit = useCallback((c) => {
        setEditData(c);
        setData({
            name: c.name,
            kind: c.kind,
            frequency: c.frequency,
            formula: c.formula,
            category: c.category || '',
            default_nominal: c.default_nominal || '',
            description: c.description || '',
            is_active: c.is_active,
        });
        setIsModalOpen(true);
    }, [setData]);

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => closeModal();
        if (editData) {
            put(`/komponen-gaji/${editData.id}`, { onSuccess });
        } else {
            post('/komponen-gaji', { onSuccess });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    const handleDelete = (c) => {
        const msg = c.assignments_count > 0
            ? `Komponen "${c.name}" sudah dipakai di ${c.assignments_count} penugasan. Akan diarsipkan (non-aktif), tidak dihapus.`
            : `Yakin hapus komponen "${c.name}"?`;
        if (confirm(msg)) router.delete(`/komponen-gaji/${c.id}`);
    };

    const handleFilter = (key, value) => {
        router.get('/komponen-gaji', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout title="Komponen Gaji">
            <Head title="Master Komponen Gaji — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Master Komponen Gaji</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Kamus Pendapatan & Potongan
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={openCreate}
                    icon={<PlusIcon className="w-5 h-5" />}
                    className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 shrink-0"
                >
                    Tambah Komponen
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 mb-10">
                <div className="flex flex-wrap items-center gap-4">
                    <input
                        type="text"
                        placeholder="Cari nama komponen..."
                        defaultValue={filters?.search || ''}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter('search', e.target.value)}
                        className="flex-1 min-w-[240px] px-5 py-3 bg-gray-50 border-transparent rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                    <PremiumSelect
                        className="min-w-[180px]"
                        value={filters.kind || ''}
                        onChange={(e) => handleFilter('kind', e.target.value)}
                        options={[
                            { value: '', label: 'SEMUA JENIS' },
                            { value: 'earning', label: 'PENDAPATAN' },
                            { value: 'deduction', label: 'POTONGAN' },
                        ]}
                    />
                    <PremiumSelect
                        className="min-w-[180px]"
                        value={filters.frequency || ''}
                        onChange={(e) => handleFilter('frequency', e.target.value)}
                        options={[
                            { value: '', label: 'SEMUA SIKLUS' },
                            { value: 'recurring', label: 'RUTIN BULANAN' },
                            { value: 'temporary', label: 'SEKALI / SEMENTARA' },
                        ]}
                    />
                    <PremiumSelect
                        className="min-w-[180px]"
                        value={filters.is_active === false || filters.is_active === '0' ? '0' : (filters.is_active === true || filters.is_active === '1' ? '1' : '')}
                        onChange={(e) => handleFilter('is_active', e.target.value)}
                        options={[
                            { value: '', label: 'SEMUA STATUS' },
                            { value: '1', label: 'AKTIF' },
                            { value: '0', label: 'NON-AKTIF (ARSIP)' },
                        ]}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Komponen',
                            render: (row) => (
                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                                        row.kind === 'earning' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    )}>
                                        {row.kind === 'earning'
                                            ? <ArrowUpCircleIcon className="w-6 h-6" />
                                            : <ArrowDownCircleIcon className="w-6 h-6" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-900 leading-tight">{row.name}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.15em] uppercase">{row.category || '—'}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Jenis',
                            render: (row) => (
                                <span className={clsx(
                                    'inline-block px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest',
                                    row.kind === 'earning' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                )}>
                                    {row.kind === 'earning' ? 'PENDAPATAN' : 'POTONGAN'}
                                </span>
                            )
                        },
                        {
                            label: 'Siklus / Formula',
                            render: (row) => (
                                <div>
                                    <p className="text-sm font-black text-gray-700">{enums.frequency?.[row.frequency] || row.frequency}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{enums.formula?.[row.formula] || row.formula}</p>
                                </div>
                            )
                        },
                        {
                            label: 'Default',
                            render: (row) => (
                                <p className="text-sm font-black text-gray-700">
                                    {row.default_nominal ? formatCurrency(row.default_nominal) : '—'}
                                </p>
                            )
                        },
                        {
                            label: 'Dipakai',
                            render: (row) => (
                                <p className="text-sm font-black text-gray-700">{row.assignments_count || 0}× penugasan</p>
                            )
                        },
                        {
                            label: 'Status',
                            render: (row) => row.is_active
                                ? <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">AKTIF</span>
                                : <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">ARSIP</span>
                        }
                    ]}
                    data={components}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <button
                                onClick={() => openEdit(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 flex items-center justify-center transition-all"
                                title="Edit"
                            >
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDelete(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all"
                                title="Hapus / Arsipkan"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                />
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editData ? 'Edit Komponen Gaji' : 'Tambah Komponen Gaji'}
                description="Definisikan komponen pendapatan atau potongan yang nantinya bisa di-assign ke guru."
                icon={<CalculatorIcon className="w-5 h-5" />}
                maxWidth="2xl"
                footer={
                    <>
                        <Button type="submit" form="component-form" loading={processing}
                            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200">
                            {editData ? 'Update' : 'Simpan'}
                        </Button>
                        <Button type="button" onClick={closeModal} variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                            Batalkan
                        </Button>
                    </>
                }
            >
                <form id="component-form" onSubmit={submit} className="space-y-5">
                    <InputField
                        label="Nama Komponen"
                        name="name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="Contoh: Tunjangan Wali Kelas"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis</label>
                            <PremiumSelect
                                value={data.kind}
                                onChange={(e) => setData('kind', e.target.value)}
                                options={[
                                    { value: 'earning', label: 'PENDAPATAN (EARNING)' },
                                    { value: 'deduction', label: 'POTONGAN (DEDUCTION)' },
                                ]}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Siklus</label>
                            <PremiumSelect
                                value={data.frequency}
                                onChange={(e) => setData('frequency', e.target.value)}
                                options={[
                                    { value: 'recurring', label: 'RUTIN BULANAN' },
                                    { value: 'temporary', label: 'SEKALI / SEMENTARA' },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Formula Perhitungan</label>
                        <PremiumSelect
                            value={data.formula}
                            onChange={(e) => setData('formula', e.target.value)}
                            options={[
                                { value: 'flat', label: 'FLAT (Nominal × 1)' },
                                { value: 'per_attendance_day', label: 'PER HARI HADIR (Nominal × Jumlah Hari Hadir)' },
                                { value: 'per_alfa_day', label: 'PER HARI ALFA (Nominal × Jumlah Hari Alfa)' },
                            ]}
                        />
                        <p className="text-[10px] text-gray-400 font-bold ml-1">
                            Engine generate gaji akan kalikan nominal dengan jumlah hari sesuai formula.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Kategori (label laporan)"
                            name="category"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            error={errors.category}
                            placeholder="mis. tunjangan_jabatan"
                        />
                        <InputField
                            label="Default Nominal (opsional)"
                            name="default_nominal"
                            type="number"
                            value={data.default_nominal}
                            onChange={(e) => setData('default_nominal', e.target.value)}
                            error={errors.default_nominal}
                            prefix="Rp"
                            placeholder="0"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm py-3 px-4"
                            placeholder="Penjelasan singkat untuk admin lain..."
                        />
                    </div>

                    <label className="inline-flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">Aktif (bisa di-assign)</span>
                    </label>
                </form>
            </Modal>
        </AppLayout>
    );
}
