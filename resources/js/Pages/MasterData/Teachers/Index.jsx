import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import SelectField from '@/Components/SelectField';
import PremiumSelect from '@/Components/PremiumSelect';
import FormSection from '@/Components/FormSection';
import Button from '@/Components/Button';
import {
    AcademicCapIcon,
    PencilSquareIcon,
    IdentificationIcon,
    BanknotesIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    TrashIcon,
    EyeIcon,
    CameraIcon,
    BriefcaseIcon,
    PhoneIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import ImageUpload from '@/Components/ImageUpload';
import clsx from 'clsx';

export default function Index({ teachers = { data: [], links: [] }, filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [searchInput, setSearchInput] = useState(filters?.search || '');
    const searchTimeoutRef = useRef(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nip: '',
        nama_lengkap: '',
        jabatan: '',
        no_hp: '',
        gaji_pokok: '',
        bonus_hadir: '',
        denda_alfa: '',
        tunjangan_tetap: '',
        nama_bank: '',
        nomor_rekening_bank: '',
        status: 'aktif',
        photo: null,
    });

    const handleFilter = useCallback((key, value) => {
        router.get('/guru', { ...filters, [key]: value }, { preserveState: true });
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

    const handleEdit = (teacher) => {
        setEditData(teacher);
        setData({
            nip: teacher.nip,
            nama_lengkap: teacher.nama_lengkap,
            jabatan: teacher.jabatan,
            no_hp: teacher.no_hp || '',
            gaji_pokok: teacher.gaji_pokok,
            bonus_hadir: teacher.bonus_hadir,
            denda_alfa: teacher.denda_alfa,
            tunjangan_tetap: teacher.tunjangan_tetap,
            nama_bank: teacher.nama_bank || '',
            nomor_rekening_bank: teacher.nomor_rekening_bank || '',
            status: teacher.status,
            photo: null, // Don't populate photo on edit
        });
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            post(`/guru/${editData.id}?_method=put`, { onSuccess: () => closeModal() });
        } else {
            post('/guru', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    return (
        <AppLayout title="Data Guru">
            <Head title="Manajemen Guru — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Data Guru & Karyawan</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Master Data & Administrasi Kepegawaian</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shrink-0">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">TOTAL STAF AKTIF</p>
                        <p className="text-xl font-black text-indigo-600 tracking-tight">{(teachers?.total || 0)} Orang</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 shrink-0"
                        icon={<AcademicCapIcon className="w-5 h-5" />}
                    >
                        Tambah Guru
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex-1 relative group">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari nama guru atau NIP..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent rounded-[1.5rem] text-sm font-black text-gray-700 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all placeholder:text-gray-300 placeholder:font-bold"
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
                            options={[
                                { value: '', label: 'SEMUA STATUS' },
                                { value: 'aktif', label: 'AKTIF' },
                                { value: 'nonaktif', label: 'NONAKTIF' },
                            ]}
                        />
                        
                        <PremiumSelect
                            className="min-w-[160px]"
                            value={filters.per_page || '10'}
                            onChange={(e) => handleFilter('per_page', e.target.value)}
                            options={[
                                { value: '10', label: 'TAMPILKAN 10' },
                                { value: '25', label: 'TAMPILKAN 25' },
                                { value: '50', label: 'TAMPILKAN 50' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: '#',
                            render: (row, index) => (
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    {((teachers?.current_page || 1) - 1) * (teachers?.per_page || 10) + index + 1}
                                </span>
                            )
                        },
                        {
                            label: 'Informasi Personal',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    {row.photo ? (
                                        <img src={`/storage/${row.photo}`} alt={row.nama_lengkap} className="w-12 h-12 rounded-2xl object-cover shrink-0 transform rotate-1 group-hover:rotate-0 transition-transform shadow-lg shadow-indigo-100" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-100 shrink-0 transform rotate-1">
                                            <div className="-rotate-1">{row.nama_lengkap?.charAt(0) || '?'}</div>
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.nama_lengkap || 'Tanpa Nama'}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">NIP: {row.nip || '-'}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Jabatan & Kontak',
                            render: (row) => (
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <BriefcaseIcon className="w-3.5 h-3.5 text-indigo-500" />
                                        <p className="text-sm font-black text-gray-800 leading-tight">{row.jabatan?.toUpperCase() || '-'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="w-3.5 h-3.5 text-gray-300" />
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{row.no_hp || '-'}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Kepegawaian',
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
                    data={teachers?.data || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <Link
                                href={`/guru/${row.id}`}
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
                                        onClick={() => confirm('Yakin ingin menghapus data ini?') && router.delete(`/guru/${row.id}`)}
                                        className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all group"
                                        title="Hapus Data"
                                    >
                                        <TrashIcon className="w-5 h-5 transition-transform group-hover:scale-90" />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => router.post(`/guru/${row.id}/restore`)}
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
                        {teachers.from || 0}—{teachers.to || 0}
                    </p>
                    <div className="flex gap-2">
                        {(teachers?.links || []).map((link, idx) => {
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
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
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
                title={editData ? 'Edit Data Guru' : 'Tambah Guru Baru'}
                description={editData ? 'Perbarui data personal dan komponen gaji.' : 'Lengkapi data personal dan komponen gaji guru.'}
                icon={editData ? <PencilSquareIcon className="w-5 h-5" /> : <AcademicCapIcon className="w-5 h-5" />}
                maxWidth="3xl"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="teacher-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200"
                        >
                            {editData ? 'Update Data Guru' : 'Simpan Guru Baru'}
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
                <form id="teacher-form" onSubmit={submit} className="space-y-6">
                    <FormSection
                        title="Informasi Personal"
                        description="Data identitas dan jabatan guru."
                        icon={<IdentificationIcon className="w-5 h-5" />}
                    >
                        <div className="flex flex-col items-center justify-center mb-6">
                            <ImageUpload 
                                value={data.photo}
                                existingImage={editData?.photo}
                                onChange={(file) => setData('photo', file)}
                                error={errors.photo}
                                label="Foto Guru"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="NIP"
                                name="nip"
                                required
                                value={data.nip}
                                onChange={e => setData('nip', e.target.value)}
                                error={errors.nip}
                                placeholder="Nomor Induk Pegawai"
                            />
                            <SelectField
                                label="Status"
                                name="status"
                                required
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                error={errors.status}
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </SelectField>
                        </div>

                        <InputField
                            label="Nama Lengkap"
                            name="nama_lengkap"
                            required
                            value={data.nama_lengkap}
                            onChange={e => setData('nama_lengkap', e.target.value)}
                            error={errors.nama_lengkap}
                            placeholder="Nama lengkap dengan gelar"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Jabatan"
                                name="jabatan"
                                required
                                value={data.jabatan}
                                onChange={e => setData('jabatan', e.target.value)}
                                error={errors.jabatan}
                                placeholder="Contoh: Guru Kelas A"
                            />
                            <InputField
                                label="No HP"
                                name="no_hp"
                                type="tel"
                                value={data.no_hp}
                                onChange={e => setData('no_hp', e.target.value)}
                                error={errors.no_hp}
                                placeholder="08xxxxxxxxxx"
                            />
                        </div>
                    </FormSection>

                    <FormSection
                        title="Komponen Gaji"
                        description="Pengaturan nominal komponen gaji untuk perhitungan payroll."
                        icon={<BanknotesIcon className="w-5 h-5" />}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Gaji Pokok"
                                name="gaji_pokok"
                                type="number"
                                required
                                prefix="Rp"
                                value={data.gaji_pokok}
                                onChange={e => setData('gaji_pokok', e.target.value)}
                                error={errors.gaji_pokok}
                            />
                            <InputField
                                label="Tunjangan Tetap"
                                name="tunjangan_tetap"
                                type="number"
                                required
                                prefix="Rp"
                                value={data.tunjangan_tetap}
                                onChange={e => setData('tunjangan_tetap', e.target.value)}
                                error={errors.tunjangan_tetap}
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Bonus Hadir / Hari"
                                name="bonus_hadir"
                                type="number"
                                required
                                prefix="Rp"
                                value={data.bonus_hadir}
                                onChange={e => setData('bonus_hadir', e.target.value)}
                                error={errors.bonus_hadir}
                                hint="Diberikan tiap hari hadir"
                            />
                            <InputField
                                label="Denda Alfa / Hari"
                                name="denda_alfa"
                                type="number"
                                required
                                prefix="Rp"
                                value={data.denda_alfa}
                                onChange={e => setData('denda_alfa', e.target.value)}
                                error={errors.denda_alfa}
                                hint="Potongan tiap hari tidak hadir tanpa keterangan"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Nama Bank"
                                name="nama_bank"
                                value={data.nama_bank}
                                onChange={e => setData('nama_bank', e.target.value)}
                                error={errors.nama_bank}
                                placeholder="Contoh: BSI"
                            />
                            <InputField
                                label="Nomor Rekening"
                                name="nomor_rekening_bank"
                                value={data.nomor_rekening_bank}
                                onChange={e => setData('nomor_rekening_bank', e.target.value)}
                                error={errors.nomor_rekening_bank}
                            />
                        </div>
                    </FormSection>
                </form>
            </Modal>
        </AppLayout>
    );
}
