import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import { 
    BanknotesIcon, 
    PencilSquareIcon, 
    PlusIcon,
    TrashIcon,
    ArrowTrendingUpIcon,
    WalletIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Index({ accounts = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_rekening: '',
        bank: '',
        nomor_rekening: '',
        saldo: 0,
        jenis: 'operasional',
    });

    const handleEdit = useCallback((account) => {
        setEditData(account);
        setData({
            nama_rekening: account.nama_rekening,
            bank: account.bank,
            nomor_rekening: account.nomor_rekening,
            saldo: account.saldo,
            jenis: account.jenis,
        });
        setIsModalOpen(true);
    }, [setData]);

    const handleDelete = useCallback((id) => {
        if (confirm('Yakin ingin menghapus rekening ini?')) {
            router.delete(`/akun/${id}`);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(`/akun/${editData.id}`, { onSuccess: () => closeModal() });
        } else {
            post('/akun', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    const totalSaldo = accounts.reduce((acc, curr) => acc + parseFloat(curr.saldo || 0), 0);

    return (
        <AppLayout title="Data Rekening">
            <Head title="Manajemen Rekening — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Master Rekening</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Pusat Kendali Kas & Bank Sekolah</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shrink-0">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">TOTAL SALDO TERKONSOLIDASI</p>
                        <p className="text-xl font-black text-emerald-600 tracking-tight">{formatCurrency(totalSaldo)}</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 shrink-0"
                        icon={<PlusIcon className="w-5 h-5" />}
                    >
                        Tambah Rekening
                    </Button>
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
                            label: 'Informasi Rekening',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-emerald-100 shrink-0 transform -rotate-1">
                                        <WalletIcon className="w-6 h-6 transform rotate-1" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.nama_rekening || 'Rekening Baru'}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">{row.bank} · {row.nomor_rekening}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Saldo Terkini',
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-base font-black text-emerald-600 tracking-tight leading-tight mb-1">{formatCurrency(row.saldo || 0)}</p>
                                    <div className="flex items-center gap-1">
                                        <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-400" />
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">ACTIVE BALANCE</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Klasifikasi',
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        'px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]',
                                        row.jenis === 'operasional' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                    )}>
                                        {row.jenis?.toUpperCase()}
                                    </span>
                                </div>
                            )
                        }
                    ]}
                    data={accounts || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
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
                title={editData ? 'Edit Rekening' : 'Tambah Rekening Baru'}
                description={editData ? 'Perbarui informasi rekening di bawah ini.' : 'Daftarkan rekening baru untuk manajemen kas.'}
                icon={editData ? <PencilSquareIcon className="w-5 h-5" /> : <BanknotesIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="account-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200"
                        >
                            {editData ? 'Update Rekening' : 'Simpan Rekening'}
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
                <form id="account-form" onSubmit={submit} className="space-y-6">
                    <InputField
                        label="Nama Rekening"
                        name="nama_rekening"
                        required
                        value={data.nama_rekening}
                        onChange={e => setData('nama_rekening', e.target.value)}
                        error={errors.nama_rekening}
                        placeholder="Contoh: Operasional Sekolah"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Bank"
                            name="bank"
                            required
                            value={data.bank}
                            onChange={e => setData('bank', e.target.value)}
                            error={errors.bank}
                            placeholder="Contoh: BSI"
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Rekening</label>
                            <PremiumSelect
                                value={data.jenis}
                                onChange={e => setData('jenis', e.target.value)}
                                options={[
                                    { value: 'operasional', label: 'OPERASIONAL' },
                                    { value: 'gaji', label: 'GAJI' },
                                ]}
                            />
                        </div>
                    </div>
                    <InputField
                        label="Nomor Rekening"
                        name="nomor_rekening"
                        required
                        value={data.nomor_rekening}
                        onChange={e => setData('nomor_rekening', e.target.value)}
                        error={errors.nomor_rekening}
                        placeholder="Tanpa tanda baca"
                    />
                    <InputField
                        label="Saldo Awal"
                        name="saldo"
                        type="number"
                        required
                        prefix="Rp"
                        value={data.saldo}
                        onChange={e => setData('saldo', e.target.value)}
                        error={errors.saldo}
                        inputClassName="text-xl font-black text-emerald-700 tracking-tight"
                    />
                </form>
            </Modal>
        </AppLayout>
    );
}
