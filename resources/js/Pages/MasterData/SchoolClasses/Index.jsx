import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import { 
    Bars3Icon, 
    PencilSquareIcon, 
    PlusIcon,
    TrashIcon,
    UserCircleIcon,
    AcademicCapIcon,
    DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Index({ classes = [], teachers = [], academicYears = [], filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        level: '',
        capacity: 25,
        teacher_id: '',
        academic_year_id: filters.academic_year_id || '',
    });

    const { data: cloneData, setData: setCloneData, post: postClone, processing: cloneProcessing } = useForm({
        source_year_id: '',
        target_year_id: filters.academic_year_id || '',
    });

    const handleEdit = useCallback((cls) => {
        setEditData(cls);
        setData({
            name: cls.name,
            level: cls.level,
            capacity: cls.capacity || 25,
            teacher_id: cls.teacher_id || '',
            academic_year_id: cls.academic_year_id || '',
        });
        setIsModalOpen(true);
    }, [setData]);

    const handleDelete = useCallback((id) => {
        if (confirm('Yakin ingin menghapus kelas ini?')) {
            router.delete(`/kelas/${id}`);
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(`/kelas/${editData.id}`, { onSuccess: () => closeModal() });
        } else {
            post('/kelas', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    const handleFilterYear = (yearId) => {
        router.get('/kelas', { academic_year_id: yearId }, { preserveState: true });
    };

    const submitClone = (e) => {
        e.preventDefault();
        postClone('/kelas/clone', { onSuccess: () => setIsCloneModalOpen(false) });
    };

    return (
        <AppLayout title="Master Data Kelas">
            <Head title="Manajemen Kelas — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Data Kelas</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Daftar Kelas & Wali Kelas</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-64">
                        <PremiumSelect
                            value={filters.academic_year_id || ''}
                            onChange={(e) => handleFilterYear(e.target.value)}
                            options={academicYears.map(y => ({ value: y.id, label: y.name + (y.is_active ? ' (AKTIF)' : '') }))}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => setIsCloneModalOpen(true)}
                        className="px-6 py-4 rounded-2xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm shrink-0"
                        icon={<DocumentDuplicateIcon className="w-5 h-5" />}
                    >
                        Clone Rombel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-cyan-200 shrink-0"
                        icon={<PlusIcon className="w-5 h-5" />}
                    >
                        Tambah Kelas
                    </Button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Informasi Kelas',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-cyan-100 shrink-0 transform rotate-2">
                                        <Bars3Icon className="w-6 h-6 transform -rotate-2" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.name}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">LEVEL: {row.level || 'N/A'}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Wali Kelas',
                            render: (row) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0">
                                        <UserCircleIcon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-800 truncate leading-tight mb-0.5">
                                            {row.teacher?.nama_lengkap || 'Belum Ditentukan'}
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">WALI KELAS RESMI</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Kapasitas Rombel',
                            render: (row) => {
                                const capacity = row.capacity || 25;
                                const filled = row.students_count || 0;
                                const remaining = capacity - filled;
                                const percentage = Math.min(100, Math.round((filled / capacity) * 100));
                                
                                let statusColor = 'bg-emerald-500';
                                let textColor = 'text-emerald-600';
                                if (percentage >= 100) {
                                    statusColor = 'bg-rose-500';
                                    textColor = 'text-rose-600';
                                } else if (percentage >= 80) {
                                    statusColor = 'bg-amber-400';
                                    textColor = 'text-amber-600';
                                }

                                return (
                                    <div className="w-full min-w-[200px]">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-sm font-black text-gray-800 leading-tight">Sisa {remaining} Kursi</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Terisi {filled} dari {capacity}</p>
                                            </div>
                                            <span className={clsx("text-xs font-black", textColor)}>
                                                {percentage}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className={clsx("h-2.5 rounded-full transition-all duration-1000", statusColor)} 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            }
                        }
                    ]}
                    data={classes}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <button
                                onClick={() => handleEdit(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 hover:border-cyan-200 flex items-center justify-center transition-all group"
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
                title={editData ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
                description="Tentukan nama kelas dan pilih wali kelas yang bertanggung jawab."
                icon={<AcademicCapIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="class-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-cyan-200"
                        >
                            {editData ? 'Update Kelas' : 'Simpan Kelas'}
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
                <form id="class-form" onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Nama Kelas"
                            name="name"
                            required
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="Contoh: TK A - Merpati"
                            autoFocus
                        />
                        <InputField
                            label="Level / Jenjang"
                            name="level"
                            required
                            value={data.level}
                            onChange={e => setData('level', e.target.value)}
                            error={errors.level}
                            placeholder="Contoh: TK A"
                        />
                        <InputField
                            label="Kapasitas Rombel"
                            name="capacity"
                            type="number"
                            required
                            min="1"
                            value={data.capacity}
                            onChange={e => setData('capacity', e.target.value)}
                            error={errors.capacity}
                            placeholder="Contoh: 25"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Ajaran</label>
                        <PremiumSelect
                            value={data.academic_year_id}
                            onChange={e => setData('academic_year_id', e.target.value)}
                            error={errors.academic_year_id}
                            options={[
                                { value: '', label: '-- PILIH TAHUN AJARAN --' },
                                ...academicYears.map(y => ({ value: y.id, label: y.name }))
                            ]}
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Wali Kelas</label>
                        <PremiumSelect
                            value={data.teacher_id}
                            onChange={e => setData('teacher_id', e.target.value)}
                            error={errors.teacher_id}
                            options={[
                                { value: '', label: '-- PILIH WALI KELAS --' },
                                ...teachers.map(t => ({ value: t.id, label: t.nama_lengkap }))
                            ]}
                        />
                    </div>
                </form>
            </Modal>

            {/* Clone Modal */}
            <Modal
                show={isCloneModalOpen}
                onClose={() => setIsCloneModalOpen(false)}
                title="Clone Rombel dari Tahun Sebelumnya"
                description="Salin semua struktur kelas dari tahun ajaran sumber ke tahun ajaran tujuan. Siswa tidak akan disalin, hanya rombel kosong."
                icon={<DocumentDuplicateIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="clone-form" 
                            loading={cloneProcessing} 
                            className="px-10 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-cyan-200"
                        >
                            Jalankan Clone
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => setIsCloneModalOpen(false)} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Batalkan
                        </Button>
                    </>
                }
            >
                <form id="clone-form" onSubmit={submitClone} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Ajaran Sumber (Copy Dari)</label>
                        <PremiumSelect
                            value={cloneData.source_year_id}
                            onChange={e => setCloneData('source_year_id', e.target.value)}
                            options={[
                                { value: '', label: '-- PILIH SUMBER --' },
                                ...academicYears.map(y => ({ value: y.id, label: y.name }))
                            ]}
                        />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Ajaran Tujuan (Paste Ke)</label>
                        <PremiumSelect
                            value={cloneData.target_year_id}
                            onChange={e => setCloneData('target_year_id', e.target.value)}
                            options={[
                                { value: '', label: '-- PILIH TUJUAN --' },
                                ...academicYears.map(y => ({ value: y.id, label: y.name }))
                            ]}
                        />
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
