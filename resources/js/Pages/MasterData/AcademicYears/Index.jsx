import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import Button from '@/Components/Button';
import { 
    AcademicCapIcon, 
    PencilSquareIcon, 
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Index({ academic_years = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        is_active: false,
    });

    const handleEdit = useCallback((ay) => {
        setEditData(ay);
        setData({
            name: ay.name,
            is_active: !!ay.is_active,
        });
        setIsModalOpen(true);
    }, [setData]);

    const handleDelete = useCallback((id) => {
        if (confirm('Yakin ingin menghapus tahun ajaran ini?')) {
            router.delete(`/tahun-ajaran/${id}`);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(`/tahun-ajaran/${editData.id}`, { onSuccess: () => closeModal() });
        } else {
            post('/tahun-ajaran', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    return (
        <AppLayout title="Master Tahun Ajaran">
            <Head title="Tahun Ajaran — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tahun Ajaran</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Periode Akademik Aktif & Riwayat</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 shrink-0"
                    icon={<PlusIcon className="w-5 h-5" />}
                >
                    Tambah Tahun Ajaran
                </Button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Tahun Ajaran',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-100 shrink-0 transform -rotate-1">
                                        <AcademicCapIcon className="w-6 h-6 transform rotate-1" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.name}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">ACADEMIC YEAR PERIOD</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Status',
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    {row.is_active ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">AKTIF SEKARANG</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-400">
                                            <XCircleIcon className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">NON-AKTIF</span>
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    ]}
                    data={academic_years}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <button
                                onClick={() => handleEdit(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center transition-all group"
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
                title={editData ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}
                description="Pastikan format tahun ajaran benar (contoh: 2024/2025)."
                icon={<AcademicCapIcon className="w-5 h-5" />}
                maxWidth="md"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="academic-year-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200"
                        >
                            {editData ? 'Update Data' : 'Simpan Tahun Ajaran'}
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
                <form id="academic-year-form" onSubmit={submit} className="space-y-6">
                    <InputField
                        label="Nama Tahun Ajaran"
                        name="name"
                        required
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        error={errors.name}
                        placeholder="Contoh: 2025/2026"
                        autoFocus
                    />
                    
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <input
                            id="is_active"
                            type="checkbox"
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                        />
                        <label htmlFor="is_active" className="text-sm font-bold text-gray-700">
                            Set sebagai Tahun Ajaran Aktif
                        </label>
                    </div>
                    {data.is_active && (
                        <p className="text-[10px] text-amber-600 font-bold italic ml-1">
                            * Menjadikan tahun ini aktif akan menonaktifkan tahun ajaran lainnya.
                        </p>
                    )}
                </form>
            </Modal>
        </AppLayout>
    );
}
