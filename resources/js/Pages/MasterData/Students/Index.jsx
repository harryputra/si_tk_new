import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import SelectField from '@/Components/SelectField';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import { 
    UserPlusIcon, 
    PencilSquareIcon, 
    MagnifyingGlassIcon, 
    XMarkIcon, 
    TrashIcon, 
    EyeIcon,
    CameraIcon,
    ArrowPathIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    FunnelIcon,
    Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';
import ImageUpload from '@/Components/ImageUpload';
import clsx from 'clsx';

export default function Index({ students = { data: [], links: [] }, filters = {}, classes = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [searchInput, setSearchInput] = useState(filters?.search || '');
    const searchTimeoutRef = useRef(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nis: '',
        nama_lengkap: '',
        nama_panggilan: '',
        tahun_angkatan: new Date().getFullYear().toString(),
        jenis_siswa: 'reguler',
        nama_wali: '',
        no_hp_wali: '',
        status: 'aktif',
        current_class_id: '',
        photo: null,
    });

    const handleFilter = useCallback((key, value) => {
        router.get('/siswa', { ...filters, [key]: value }, { preserveState: true });
    }, [filters]);

    const handleSearchSubmit = useCallback((e) => {
        if (e) e.preventDefault();
        handleFilter('search', searchInput);
    }, [handleFilter, searchInput]);

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

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, []);

    const handleEdit = (student) => {
        setEditData(student);
        setData({
            nis: student.nis,
            nama_lengkap: student.nama_lengkap,
            nama_panggilan: student.nama_panggilan || '',
            tahun_angkatan: student.tahun_angkatan,
            jenis_siswa: student.jenis_siswa,
            nama_wali: student.nama_wali,
            no_hp_wali: student.no_hp_wali || '',
            status: student.status,
            current_class_id: student.current_class_id || '',
            photo: null, // Don't populate photo on edit to avoid sending the path string
        });
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            post(`/siswa/${editData.id}?_method=put`, { onSuccess: () => closeModal() });
        } else {
            post('/siswa', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    return (
        <AppLayout title="Data Siswa">
            <Head title="Manajemen Siswa — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Data Siswa</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Master Data & Administrasi Siswa</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 shrink-0">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">TOTAL SISWA TERDAFTAR</p>
                        <p className="text-xl font-black text-blue-600 tracking-tight">{(students?.total || 0)} Jiwa</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 shrink-0"
                        icon={<UserPlusIcon className="w-5 h-5" />}
                    >
                        Tambah Siswa
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
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
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
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
                            className="min-w-[180px]"
                            value={filters?.status || ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            icon={<FunnelIcon className="w-5 h-5" />}
                            options={[
                                { value: '', label: 'SEMUA STATUS' },
                                { value: 'aktif', label: 'AKTIF' },
                                { value: 'alumni', label: 'ALUMNI' },
                                { value: 'keluar', label: 'KELUAR' },
                            ]}
                        />
                        
                        <PremiumSelect
                            className="min-w-[180px]"
                            value={filters.tahun_angkatan || ''}
                            onChange={(e) => handleFilter('tahun_angkatan', e.target.value)}
                            icon={<CalendarDaysIcon className="w-5 h-5" />}
                            options={[
                                { value: '', label: 'SEMUA ANGKATAN' },
                                { value: '2023', label: '2023' },
                                { value: '2024', label: '2024' },
                                { value: '2025', label: '2025' },
                            ]}
                        />

                        <PremiumSelect
                            className="min-w-[220px]"
                            value={filters.current_class_id || ''}
                            onChange={(e) => handleFilter('current_class_id', e.target.value)}
                            icon={<AcademicCapIcon className="w-5 h-5" />}
                            options={[
                                { value: '', label: 'SEMUA KELAS' },
                                { value: 'none', label: 'BELUM ADA KELAS' },
                                ...(classes || []).map(c => ({
                                    value: String(c.id),
                                    label: `${(c.name || '').toUpperCase()} — ${(c.level || '').toUpperCase()}`,
                                })),
                            ]}
                        />

                        <PremiumSelect
                            className="min-w-[140px]"
                            value={filters.per_page || '10'}
                            onChange={(e) => handleFilter('per_page', e.target.value)}
                            icon={<Bars3BottomLeftIcon className="w-5 h-5" />}
                            options={[
                                { value: '10', label: '10 ITEMS' },
                                { value: '25', label: '25 ITEMS' },
                                { value: '50', label: '50 ITEMS' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    sortBy={filters.sort_by || ''}
                    sortDir={filters.sort_dir || 'desc'}
                    onSort={(key, dir) => router.get('/siswa', { ...filters, sort_by: key, sort_dir: dir }, { preserveState: true })}
                    columns={[
                        {
                            label: '#',
                            render: (row, index) => (
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    {((students?.current_page || 1) - 1) * (students?.per_page || 10) + index + 1}
                                </span>
                            )
                        },
                        {
                            label: 'Informasi Siswa',
                            sortKey: 'nama_lengkap',
                            render: (row) => (
                                <Link 
                                    href={`/siswa/${row.id}`} 
                                    className="flex items-center gap-5 group/student hover:opacity-80 transition-opacity"
                                >
                                    {row.photo ? (
                                        <img src={`/storage/${row.photo}`} alt={row.nama_lengkap} className="w-12 h-12 rounded-2xl object-cover shrink-0 transform -rotate-2 group-hover/student:rotate-0 transition-transform shadow-lg shadow-blue-100" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-blue-100 shrink-0 transform -rotate-2 group-hover/student:rotate-0 transition-transform">
                                            <div className="rotate-2 group-hover/student:rotate-0">{row.nama_lengkap?.charAt(0) || '?'}</div>
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1 group-hover/student:text-blue-600 transition-colors">
                                            {row.nama_lengkap || 'Tanpa Nama'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">NIS: {row.nis || '-'}</p>
                                    </div>
                                </Link>
                            )
                        },
                        {
                            label: 'Kelas',
                            sortKey: 'kelas',
                            render: (row) => (
                                <div className="min-w-0">
                                    {row.current_class ? (
                                        <>
                                            <p className="text-sm font-black text-gray-800 leading-tight mb-1">{row.current_class.name}</p>
                                            <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">{row.current_class.level}</p>
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">BELUM ADA KELAS</span>
                                    )}
                                </div>
                            )
                        },
                        {
                            label: 'Akademik',
                            sortKey: 'tahun_angkatan',
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-800 leading-tight mb-1">{row.jenis_siswa?.toUpperCase() || 'REGULER'}</p>
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">ANGKATAN {row.tahun_angkatan}</p>
                                </div>
                            )
                        },
                        {
                            label: 'Status Keaktifan',
                            sortKey: 'status',
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    <span className={clsx(
                                        'w-2 h-2 rounded-full',
                                        row.status === 'aktif' ? 'bg-emerald-500' : 'bg-gray-400'
                                    )}></span>
                                    <span className={clsx(
                                        'text-[10px] font-black uppercase tracking-[0.2em]',
                                        row.status === 'aktif' ? 'text-emerald-600' : 'text-gray-500'
                                    )}>
                                        {(row.status || 'aktif').toUpperCase()}
                                    </span>
                                </div>
                            )
                        }
                    ]}
                    data={students?.data || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <Link
                                href={`/siswa/${row.id}`}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all group"
                                title="Lihat Detail"
                            >
                                <EyeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </Link>
                            
                            {!row.deleted_at ? (
                                <>
                                    <button
                                        onClick={() => handleEdit(row)}
                                        className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 flex items-center justify-center transition-all group"
                                        title="Edit Data"
                                    >
                                        <PencilSquareIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                    </button>
                                    <button
                                        onClick={() => confirm('Yakin ingin menghapus data ini?') && router.delete(`/siswa/${row.id}`)}
                                        className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all group"
                                        title="Hapus Data"
                                    >
                                        <TrashIcon className="w-5 h-5 transition-transform group-hover:scale-90" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => router.post(`/siswa/${row.id}/restore`)}
                                    className="px-5 h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.15em] transition-all flex items-center gap-2 group"
                                >
                                    <ArrowPathIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                                    RESTORE
                                </button>
                            )}
                        </div>
                    )}
                />

                {/* Footer Pagination */}
                <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        {students.from || 0}—{students.to || 0}
                    </p>
                    <div className="flex gap-2">
                        {(students?.links || []).map((link, idx) => {
                            let label = link.label;
                            if (label.toLowerCase().includes('prev') || label.toLowerCase().includes('sebelum')) {
                                label = 'PREVIOUS';
                            } else if (label.toLowerCase().includes('next') || label.toLowerCase().includes('berikut')) {
                                label = 'NEXT';
                            }
                            
                            return (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
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
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editData ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                description={editData ? 'Perbarui informasi siswa di bawah ini.' : 'Lengkapi formulir untuk menambahkan siswa baru.'}
                icon={editData ? <PencilSquareIcon className="w-5 h-5" /> : <UserPlusIcon className="w-5 h-5" />}
                maxWidth="2xl"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="student-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200"
                        >
                            {editData ? 'Update Data Siswa' : 'Simpan Siswa Baru'}
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
                <form id="student-form" onSubmit={submit} className="space-y-5" encType="multipart/form-data">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <ImageUpload 
                            value={data.photo}
                            existingImage={editData?.photo}
                            onChange={(file) => setData('photo', file)}
                            error={errors.photo}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="NIS"
                            name="nis"
                            required
                            value={data.nis}
                            onChange={e => setData('nis', e.target.value)}
                            error={errors.nis}
                            placeholder="Nomor Induk Siswa"
                        />
                        <InputField
                            label="Nama Panggilan"
                            name="nama_panggilan"
                            value={data.nama_panggilan}
                            onChange={e => setData('nama_panggilan', e.target.value)}
                            error={errors.nama_panggilan}
                            placeholder="Opsional"
                        />
                    </div>

                    <InputField
                        label="Nama Lengkap"
                        name="nama_lengkap"
                        required
                        value={data.nama_lengkap}
                        onChange={e => setData('nama_lengkap', e.target.value)}
                        error={errors.nama_lengkap}
                        placeholder="Sesuai akta kelahiran"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Tahun Angkatan"
                            name="tahun_angkatan"
                            type="number"
                            required
                            value={data.tahun_angkatan}
                            onChange={e => setData('tahun_angkatan', e.target.value)}
                            error={errors.tahun_angkatan}
                        />
                        <SelectField
                            label="Jenis Siswa"
                            name="jenis_siswa"
                            required
                            value={data.jenis_siswa}
                            onChange={e => setData('jenis_siswa', e.target.value)}
                            error={errors.jenis_siswa}
                        >
                            <option value="reguler">Reguler</option>
                            <option value="reguler_opsi2">Reguler Opsi 2</option>
                            <option value="fullday">Fullday</option>
                        </SelectField>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Kontak Wali</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Nama Wali"
                                name="nama_wali"
                                required
                                value={data.nama_wali}
                                onChange={e => setData('nama_wali', e.target.value)}
                                error={errors.nama_wali}
                                placeholder="Orang tua / wali"
                            />
                            <InputField
                                label="No HP Wali"
                                name="no_hp_wali"
                                type="tel"
                                value={data.no_hp_wali}
                                onChange={e => setData('no_hp_wali', e.target.value)}
                                error={errors.no_hp_wali}
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectField
                            label="Status"
                            name="status"
                            required
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                            error={errors.status}
                        >
                            <option value="aktif">Aktif</option>
                            <option value="alumni">Alumni</option>
                            <option value="keluar">Keluar</option>
                        </SelectField>

                        <SelectField
                            label="Kelas Saat Ini"
                            name="current_class_id"
                            value={data.current_class_id}
                            onChange={e => setData('current_class_id', e.target.value)}
                            error={errors.current_class_id}
                        >
                            <option value="">-- Belum Masuk Kelas --</option>
                            {(classes || []).map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                            ))}
                        </SelectField>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
