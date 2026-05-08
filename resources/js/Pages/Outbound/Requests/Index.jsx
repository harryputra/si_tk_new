import React, { useState, useCallback, useRef, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import PremiumSelect from '@/Components/PremiumSelect';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import InputField from '@/Components/InputField';
import { 
    BanknotesIcon, 
    PlusIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    DocumentTextIcon,
    CalendarIcon,
    PaperClipIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Index({ requests = { data: [], links: [] }, filters = {}, rkas_budgets = [], accounts = [], totals = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search || '');
    const searchTimeoutRef = useRef(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        rkas_id: '',
        account_id: '',
        judul_pengajuan: '',
        deskripsi: '',
        nominal: '',
        jenis_pengajuan: 'sekolah',
        nota_rab: [],
    });

    const handleFilter = useCallback((key, value) => {
        router.get('/pengajuan', { ...filters, [key]: value }, { preserveState: true });
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

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        post('/pengajuan', {
            forceFormData: true,
            onSuccess: () => closeModal(),
        });
    };

    const selectedRkas = rkas_budgets.find(r => String(r.id) === String(data.rkas_id));
    const sisaPagu = selectedRkas ? (parseFloat(selectedRkas.pagu_anggaran) - parseFloat(selectedRkas.terpakai)) : null;

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, []);

    return (
        <AppLayout title="Pengajuan Dana">
            <Head title="Pengajuan Dana Outbound — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Pengajuan Outbound</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Pusat Pengendali Belanja & Pengeluaran Dana</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100 shrink-0">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-0.5">OUTBOUND PENDING</p>
                        <p className="text-xl font-black text-rose-600 tracking-tight">{formatCurrency(totals?.pending_total || 0)}</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 shrink-0 border-none"
                        icon={<PlusIcon className="w-5 h-5" />}
                    >
                        Buat Pengajuan Baru
                    </Button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex-1 relative group">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari judul pengajuan atau deskripsi..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent rounded-[1.5rem] text-sm font-black text-gray-700 focus:bg-white focus:ring-4 focus:ring-rose-100 focus:border-rose-200 transition-all placeholder:text-gray-300 placeholder:font-bold"
                            value={searchInput}
                            onChange={(e) => handleSearchInputChange(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        />
                        {searchInput && (
                            <button onClick={handleClearSearch} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <PremiumSelect
                            className="min-w-[200px]"
                            value={filters.status || ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            options={[
                                { value: '', label: 'SEMUA STATUS' },
                                { value: 'pending', label: 'MENUNGGU PERSETUJUAN' },
                                { value: 'approved', label: 'TELAH DISETUJUI' },
                                { value: 'disbursed', label: 'TELAH DICAIRKAN' },
                                { value: 'rejected', label: 'DITOLAK' },
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
                            render: (_, index) => (
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    {((requests?.current_page || 1) - 1) * (requests?.per_page || 10) + index + 1}
                                </span>
                            )
                        },
                        {
                            label: 'Detil Pengajuan',
                            className: 'max-w-[350px]',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-rose-100 shrink-0 transform rotate-1">
                                        <DocumentTextIcon className="w-6 h-6 transform -rotate-1" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.judul_pengajuan || 'Untitled Request'}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">{row.deskripsi?.substring(0, 40)}{row.deskripsi?.length > 40 ? '...' : ''}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Anggaran & Jenis',
                            className: 'max-w-[280px]',
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-800 leading-tight mb-1 truncate" title={row.rkas_budget?.uraian}>{row.rkas_budget?.uraian || 'NON-RKAS'}</p>
                                    <span className={clsx(
                                        "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-0.5 rounded-lg border",
                                        row.jenis_pengajuan === 'yayasan' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                    )}>
                                        {row.jenis_pengajuan?.toUpperCase() || 'GENERAL'}
                                    </span>
                                </div>
                            )
                        },
                        {
                            label: 'Nominal',
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-base font-black text-gray-900 tracking-tight leading-tight mb-1">{formatCurrency(row.nominal || 0)}</p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <CalendarIcon className="w-3.5 h-3.5 text-gray-300" />
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                            {new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Status',
                            className: 'w-[100px]',
                            render: (row) => <StatusBadge status={row.status_approval} />
                        },
                    ]}
                    data={requests?.data || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            {row.status_approval === 'pending' && (
                                <button
                                    onClick={() => confirm('Setujui pengajuan ini?') && router.post(`/pengajuan/${row.id}/approve`, { catatan: 'Approved via Premium Dashboard' })}
                                    className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center gap-2 group border-none"
                                >
                                    <CheckCircleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    APPROVE
                                </button>
                            )}
                            {row.status_approval === 'approved' && (
                                <button
                                    onClick={() => confirm('Konfirmasi pencairan dana?') && router.post(`/pengajuan/${row.id}/disburse`)}
                                    className="h-11 px-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center gap-2 group border-none"
                                >
                                    <ArrowUpTrayIcon className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                                    CAIRKAN
                                </button>
                            )}
                            <Link
                                href={`/pengajuan/${row.id}`}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all group"
                                title="Lihat Detail"
                            >
                                <EyeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </Link>
                        </div>
                    )}
                />

                {/* Pagination */}
                <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        {requests.from || 0}—{requests.to || 0} OF {requests.total || 0}
                    </p>
                    <div className="flex gap-2">
                        {(requests?.links || []).map((link, idx) => {
                            let label = link.label;
                            if (label.toLowerCase().includes('prev') || label.toLowerCase().includes('sebelum')) label = 'PREVIOUS';
                            if (label.toLowerCase().includes('next') || label.toLowerCase().includes('berikut')) label = 'NEXT';
                            
                            return (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={clsx(
                                        'min-w-[44px] h-11 px-4 inline-flex items-center justify-center text-[11px] font-black rounded-2xl transition-all uppercase tracking-widest',
                                        link.active 
                                            ? 'bg-rose-600 text-white shadow-xl shadow-rose-200' 
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
                title="Buat Pengajuan Dana"
                description="Lengkapi formulir di bawah ini untuk mengajukan pengeluaran dana."
                icon={<DocumentTextIcon className="w-6 h-6 text-rose-600" />}
                maxWidth="3xl"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="request-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-200"
                        >
                            {processing ? 'SUBMITTING...' : 'SUBMIT PENGAJUAN'}
                        </Button>
                        <Button 
                            type="button" 
                            onClick={closeModal} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            BATALKAN
                        </Button>
                    </>
                }
            >
                <form id="request-form" onSubmit={submit} className="space-y-6">
                    <InputField
                        label="Judul Pengajuan"
                        name="judul_pengajuan"
                        required
                        value={data.judul_pengajuan}
                        onChange={e => setData('judul_pengajuan', e.target.value)}
                        error={errors.judul_pengajuan}
                        placeholder="Contoh: Pembelian ATK & Konsumsi Rapat"
                    />

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Deskripsi Detail</label>
                        <textarea
                            value={data.deskripsi}
                            onChange={e => setData('deskripsi', e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border-transparent rounded-[1.5rem] text-sm font-bold text-gray-700 focus:bg-white focus:ring-4 focus:ring-rose-100 focus:border-rose-200 transition-all placeholder:text-gray-300 min-h-[120px]"
                            placeholder="Jelaskan rincian penggunaan dana..."
                        />
                        {errors.deskripsi && <p className="text-rose-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-widest">{errors.deskripsi}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Pengajuan</label>
                            <PremiumSelect
                                value={data.jenis_pengajuan}
                                onChange={e => setData('jenis_pengajuan', e.target.value)}
                                options={[
                                    { value: 'sekolah', label: 'KEBUTUHAN SEKOLAH' },
                                    { value: 'yayasan', label: 'KEBUTUHAN YAYASAN' },
                                ]}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rekening Sumber</label>
                            <PremiumSelect
                                value={data.account_id}
                                onChange={e => setData('account_id', e.target.value)}
                                options={[
                                    { value: '', label: 'PILIH REKENING' },
                                    ...accounts.map(acc => ({ value: acc.id, label: `${acc.bank} - ${acc.nama_rekening}` }))
                                ]}
                            />
                            {errors.account_id && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 uppercase tracking-widest">{errors.account_id}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pos Anggaran RKAS (Opsional)</label>
                        <PremiumSelect
                            value={data.rkas_id}
                            onChange={e => setData('rkas_id', e.target.value)}
                            options={[
                                { value: '', label: 'NON-RKAS / TIDAK TERKAIT' },
                                ...rkas_budgets.map(rkas => ({ value: rkas.id, label: `[${rkas.kode_rkas}] ${rkas.uraian}` }))
                            ]}
                        />
                        {selectedRkas && (
                            <div className="mt-2 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ChartBarIcon className="w-4 h-4 text-rose-400" />
                                    <span className="text-[10px] text-rose-600 font-black uppercase tracking-widest">Sisa Pagu Anggaran</span>
                                </div>
                                <span className={clsx("text-sm font-black tracking-tight", sisaPagu < 0 ? 'text-rose-600' : 'text-gray-900')}>
                                    {formatCurrency(sisaPagu || 0)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Nominal Pengajuan"
                            name="nominal"
                            type="number"
                            required
                            prefix="Rp"
                            value={data.nominal}
                            onChange={e => setData('nominal', e.target.value)}
                            error={errors.nominal}
                            inputClassName="text-xl font-black text-rose-600 tracking-tight"
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lampiran Nota / RAB</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    multiple
                                    onChange={e => setData('nota_rab', Array.from(e.target.files))}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-full px-5 py-3.5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-3 group-hover:border-rose-300 transition-all">
                                    <PaperClipIcon className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-rose-600">
                                        {data.nota_rab?.length > 0 ? `${data.nota_rab.length} FILE TERPILIH` : 'UPLOAD LAMPIRAN'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
