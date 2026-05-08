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
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Index({ accounts = [], filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        name: '',
        kind: 'pengeluaran',
        parent_id: '',
        description: '',
        is_active: true,
    });

    const openCreate = useCallback(() => {
        setEditData(null);
        reset();
        setIsModalOpen(true);
    }, [reset]);

    const openEdit = useCallback((a) => {
        setEditData(a);
        setData({
            kode: a.kode,
            name: a.name,
            kind: a.kind,
            parent_id: a.parent_id || '',
            description: a.description || '',
            is_active: a.is_active,
        });
        setIsModalOpen(true);
    }, [setData]);

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => closeModal();
        if (editData) {
            put(`/rkas-account/${editData.id}`, { onSuccess });
        } else {
            post('/rkas-account', { onSuccess });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    const handleDelete = (a) => {
        if (confirm(`Hapus akun "${a.kode} ${a.name}"? Kalau sudah dipakai, akan diarsipkan.`)) {
            router.delete(`/rkas-account/${a.id}`);
        }
    };

    const handleFilter = (key, value) => {
        router.get('/rkas-account', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };

    // Untuk parent picker — filter by kind yg dipilih
    const parentOptions = accounts.filter(a => a.kind === data.kind && a.id !== editData?.id);

    return (
        <AppLayout title="Akun RKAS (COA)">
            <Head title="Master Akun RKAS — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Master Akun RKAS</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Chart of Accounts · Pendapatan & Pengeluaran (8 SNP)
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={openCreate}
                    icon={<PlusIcon className="w-5 h-5" />}
                    className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 shrink-0"
                >
                    Tambah Akun
                </Button>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 mb-10">
                <div className="flex flex-wrap items-center gap-4">
                    <input
                        type="text"
                        placeholder="Cari kode atau nama akun..."
                        defaultValue={filters?.search || ''}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter('search', e.target.value)}
                        className="flex-1 min-w-[240px] px-5 py-3 bg-gray-50 border-transparent rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                    <PremiumSelect
                        className="min-w-[200px]"
                        value={filters.kind || ''}
                        onChange={(e) => handleFilter('kind', e.target.value)}
                        options={[
                            { value: '', label: 'SEMUA SISI' },
                            { value: 'pendapatan', label: 'PENDAPATAN' },
                            { value: 'pengeluaran', label: 'PENGELUARAN' },
                        ]}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Kode',
                            render: (row) => (
                                <span className={clsx(
                                    "text-[10px] font-black font-mono tracking-widest px-3 py-1.5 rounded-lg border",
                                    row.kind === 'pendapatan' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                                )}>
                                    {row.kode}
                                </span>
                            )
                        },
                        {
                            label: 'Nama Akun',
                            render: (row) => (
                                <div className={clsx("flex items-center gap-3", row.level > 0 && "ml-6")}>
                                    {row.kind === 'pendapatan' ? <ArrowDownCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" /> : <ArrowUpCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />}
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{row.name}</p>
                                        {row.parent_kode && (
                                            <p className="text-[10px] text-gray-400 font-bold">↳ child of {row.parent_kode} {row.parent_name}</p>
                                        )}
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Sisi',
                            render: (row) => (
                                <span className={clsx(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                    row.kind === 'pendapatan' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                )}>
                                    {row.kind}
                                </span>
                            )
                        },
                        {
                            label: 'Status',
                            render: (row) => row.is_active
                                ? <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">AKTIF</span>
                                : <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest">ARSIP</span>
                        },
                    ]}
                    data={accounts || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <button onClick={() => openEdit(row)} className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 flex items-center justify-center" title="Edit">
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(row)} className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center" title="Hapus / Arsipkan">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                />
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editData ? 'Edit Akun RKAS' : 'Tambah Akun RKAS'}
                description="Akun adalah master pos di Chart of Accounts. Hanya struktur."
                icon={<ChartBarIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button type="submit" form="account-form" loading={processing}
                            className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200">
                            {editData ? 'Update' : 'Simpan'}
                        </Button>
                        <Button type="button" onClick={closeModal} variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                            Batal
                        </Button>
                    </>
                }
            >
                <form id="account-form" onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Kode"
                            name="kode"
                            required
                            value={data.kode}
                            onChange={(e) => setData('kode', e.target.value)}
                            error={errors.kode}
                            placeholder="mis. 5.4.1"
                            inputClassName="font-mono font-bold"
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sisi</label>
                            <PremiumSelect
                                value={data.kind}
                                onChange={(e) => { setData('kind', e.target.value); setData('parent_id', ''); }}
                                options={[
                                    { value: 'pengeluaran', label: 'PENGELUARAN' },
                                    { value: 'pendapatan', label: 'PENDAPATAN' },
                                ]}
                            />
                        </div>
                    </div>
                    <InputField
                        label="Nama"
                        name="name"
                        required
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="mis. Belanja Pegawai - Gaji Guru"
                    />
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent (opsional, untuk hierarki)</label>
                        <PremiumSelect
                            value={data.parent_id}
                            onChange={(e) => setData('parent_id', e.target.value)}
                            options={[
                                { value: '', label: '-- ROOT (tanpa parent) --' },
                                ...parentOptions.map(a => ({ value: String(a.id), label: `${a.kode} ${a.name}` })),
                            ]}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm py-3 px-4"
                        />
                    </div>
                    <label className="inline-flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">Aktif (bisa dipakai)</span>
                    </label>
                </form>
            </Modal>
        </AppLayout>
    );
}
