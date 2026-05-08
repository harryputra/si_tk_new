import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import Button from '@/Components/Button';
import { 
    ClipboardDocumentListIcon, 
    PencilSquareIcon, 
    PlusIcon,
    TrashIcon,
    TagIcon,
    Bars3CenterLeftIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Index({ categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        description: '',
    });

    const handleEdit = useCallback((category) => {
        setEditData(category);
        setData({
            name: category.name,
            code: category.code,
            description: category.description || '',
        });
        setIsModalOpen(true);
    }, [setData]);

    const handleDelete = useCallback((id) => {
        if (confirm('Yakin ingin menghapus kategori biaya ini?')) {
            router.delete(`/kategori-biaya/${id}`);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(`/kategori-biaya/${editData.id}`, { onSuccess: () => closeModal() });
        } else {
            post('/kategori-biaya', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    return (
        <AppLayout title="Master Kategori Biaya">
            <Head title="Kategori Biaya — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kategori Biaya</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Klasifikasi Pengeluaran & Anggaran</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shrink-0">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">TOTAL KATEGORI</p>
                        <p className="text-xl font-black text-emerald-600 tracking-tight">{categories.length} Items</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 shrink-0"
                        icon={<PlusIcon className="w-5 h-5" />}
                    >
                        Tambah Kategori
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Kode',
                            render: (row) => (
                                <span className="text-[10px] font-black text-gray-300 font-mono tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    {row.code}
                                </span>
                            )
                        },
                        {
                            label: 'Nama Kategori',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-emerald-100 shrink-0 transform rotate-1">
                                        <TagIcon className="w-6 h-6 transform -rotate-1" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.name}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase truncate max-w-[300px]">
                                            {row.description || 'TIDAK ADA DESKRIPSI'}
                                        </p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Dibuat Pada',
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-800 leading-tight mb-1">
                                        {new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-left">SISTEM RECORD</p>
                                </div>
                            )
                        }
                    ]}
                    data={categories}
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
                title={editData ? 'Edit Kategori Biaya' : 'Tambah Kategori Baru'}
                description={editData ? 'Perbarui informasi kategori biaya di bawah ini.' : 'Daftarkan kategori biaya baru untuk pengelompokan anggaran.'}
                icon={editData ? <PencilSquareIcon className="w-5 h-5" /> : <ClipboardDocumentListIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="category-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200"
                        >
                            {editData ? 'Update Kategori' : 'Simpan Kategori'}
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
                <form id="category-form" onSubmit={submit} className="space-y-6">
                    <InputField
                        label="Kode Kategori"
                        name="code"
                        required
                        value={data.code}
                        onChange={e => setData('code', e.target.value.toUpperCase())}
                        error={errors.code}
                        placeholder="Contoh: OPS, GAJI, SARPRAS"
                        inputClassName="font-mono font-bold tracking-widest text-emerald-600"
                    />
                    
                    <InputField
                        label="Nama Kategori"
                        name="name"
                        required
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="Contoh: Operasional Sekolah"
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi / Catatan</label>
                        <textarea
                            className="w-full rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-sm py-4 px-5 min-h-[120px]"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Berikan penjelasan singkat mengenai kategori ini..."
                        />
                        {errors.description && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.description}</p>}
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
