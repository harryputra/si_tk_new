import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import Button from '@/Components/Button';
import { 
    UsersIcon, 
    PencilSquareIcon, 
    PlusIcon,
    TrashIcon,
    TagIcon,
    IdentificationIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Index({ types = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
        description: '',
    });

    const handleEdit = useCallback((type) => {
        setEditData(type);
        setData({
            name: type.name,
            code: type.code,
            description: type.description || '',
        });
        setIsModalOpen(true);
    }, [setData]);

    const handleDelete = useCallback((id) => {
        if (confirm('Yakin ingin menghapus jenis siswa ini?')) {
            router.delete(`/jenis-siswa/${id}`);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(`/jenis-siswa/${editData.id}`, { onSuccess: () => closeModal() });
        } else {
            post('/jenis-siswa', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    return (
        <AppLayout title="Master Jenis Siswa">
            <Head title="Jenis Siswa — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Jenis Siswa</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Klasifikasi Kategori Pendaftaran</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-100 shrink-0"
                    icon={<PlusIcon className="w-5 h-5" />}
                >
                    Tambah Jenis
                </Button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Kode',
                            render: (row) => (
                                <span className="text-[10px] font-black text-amber-600 font-mono tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                                    {row.code}
                                </span>
                            )
                        },
                        {
                            label: 'Kategori Siswa',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-300 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-amber-50 shrink-0">
                                        <IdentificationIcon className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.name}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase truncate max-w-[300px]">
                                            {row.description || 'TIDAK ADA DESKRIPSI'}
                                        </p>
                                    </div>
                                </div>
                            )
                        }
                    ]}
                    data={types}
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
                title={editData ? 'Edit Jenis Siswa' : 'Tambah Jenis Siswa Baru'}
                description="Klasifikasi ini akan menentukan skema tarif yang berlaku."
                icon={<TagIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="type-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-100"
                        >
                            {editData ? 'Update Data' : 'Simpan Jenis'}
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
                <form id="type-form" onSubmit={submit} className="space-y-6">
                    <InputField
                        label="Kode Jenis"
                        name="code"
                        required
                        value={data.code}
                        onChange={e => setData('code', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        error={errors.code}
                        placeholder="Contoh: reguler, fullday, beasiswa"
                        inputClassName="font-mono font-bold tracking-widest text-amber-600"
                    />
                    
                    <InputField
                        label="Nama Jenis Siswa"
                        name="name"
                        required
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="Contoh: Reguler Opsi 1"
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi / Catatan</label>
                        <textarea
                            className="w-full rounded-2xl border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-sm py-4 px-5 min-h-[120px]"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Berikan penjelasan mengenai kategori pendaftaran ini..."
                        />
                        {errors.description && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.description}</p>}
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
