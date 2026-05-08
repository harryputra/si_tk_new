import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import PremiumSelect from '@/Components/PremiumSelect';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import ConfirmationModal from '@/Components/ConfirmationModal';
import TextareaField from '@/Components/TextareaField';
import { 
    BanknotesIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    CalendarIcon, 
    UserIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    CreditCardIcon,
    EyeIcon,
    XMarkIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Index({ payments = { data: [], links: [] }, filters = {}, totals = {} }) {
    const [searchInput, setSearchInput] = useState(filters?.search || '');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const searchTimeoutRef = useRef(null);

    const handleFilter = useCallback((key, value) => {
        router.get('/pembayaran', { ...filters, [key]: value }, { preserveState: true });
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

    return (
        <AppLayout title="Riwayat Pembayaran">
            <Head title="Riwayat Pembayaran — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Riwayat Pembayaran</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Log Penerimaan Dana & Konfirmasi Transaksi</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 shrink-0">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">TOTAL PENERIMAAN (BULAN INI)</p>
                        <p className="text-xl font-black text-emerald-600 tracking-tight">{formatCurrency(totals?.month_total || 0)}</p>
                    </div>
                    <Link
                        href="/tagihan"
                        className="px-8 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 shrink-0"
                    >
                        <BanknotesIcon className="w-5 h-5" />
                        Input Pembayaran Baru
                    </Link>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex-1 relative group">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari transaksi, nama siswa, atau nominal..."
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
                    <div className="flex items-center gap-4">
                        <PremiumSelect
                            className="min-w-[200px]"
                            value={filters?.status || ''}
                            onChange={(e) => handleFilter('status', e.target.value)}
                            options={[
                                { value: '', label: 'SEMUA STATUS' },
                                { value: 'pending', label: 'MENUNGGU PERSETUJUAN' },
                                { value: 'approved', label: 'DISETUJUI' },
                                { value: 'rejected', label: 'DITOLAK' },
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
                            render: (_, index) => (
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    {((payments?.current_page || 1) - 1) * (payments?.per_page || 10) + index + 1}
                                </span>
                            )
                        },
                        { 
                            label: 'Informasi Siswa', 
                            render: (row) => (
                                <Link 
                                    href={`/siswa/${row.student_id}`} 
                                    className="flex items-center gap-5 group/student hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-blue-100 shrink-0 transform -rotate-1 group-hover/student:rotate-0 transition-transform">
                                        <div className="rotate-1 group-hover/student:rotate-0">{row.student?.nama_lengkap?.charAt(0) || '?'}</div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1 group-hover/student:text-blue-600 transition-colors">
                                            {row.student?.nama_lengkap || 'Tanpa Nama'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">NIS: {row.student?.nis || '-'}</p>
                                    </div>
                                </Link>
                            )
                        },
                        { 
                            label: 'Detil Pembayaran', 
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-800 leading-tight mb-1">{row.invoice?.tariff?.nama_tarif || 'PEMBAYARAN UMUM'}</p>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                                            {row.invoice?.periode ? new Date(row.invoice.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase() : 'NON-PERIODIK'}
                                        </p>
                                    </div>
                                </div>
                            )
                        },
                        { 
                            label: 'Nominal & Metode', 
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-base font-black text-emerald-600 tracking-tight mb-1">{formatCurrency(row.total_bayar || 0)}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={clsx(
                                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border",
                                            row.jenis_transaksi === 'tunai' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                                        )}>
                                            {row.jenis_transaksi?.toUpperCase() || 'METODE TIDAK DIKETAHUI'}
                                        </span>
                                    </div>
                                </div>
                            )
                        },
                        { 
                            label: 'Verifikasi', 
                            render: (row) => (
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={row.status_approval || 'pending'} />
                                </div>
                            )
                        }
                    ]}
                    data={payments?.data || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            {row.status_approval === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => {
                                            setSelectedPayment(row);
                                            setIsConfirmModalOpen(true);
                                        }}
                                        className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center gap-2 group"
                                    >
                                        <CheckCircleIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        SETUJUI
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSelectedPayment(row);
                                            setRejectReason('');
                                            setIsRejectModalOpen(true);
                                        }}
                                        className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all group"
                                        title="Tolak Transaksi"
                                    >
                                        <XCircleIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                    </button>
                                </>
                            )}

                            {row.status_approval === 'approved' && (
                                <a
                                    href={route('pembayaran.print', row.id)}
                                    target="_blank"
                                    className="h-11 px-6 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 group"
                                >
                                    <PrinterIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    CETAK
                                </a>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedPayment(row);
                                    setIsDetailModalOpen(true);
                                }}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all group"
                                title="Lihat Detail"
                            >
                                <EyeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </button>
                        </div>
                    )}
                />

                {/* Footer Pagination */}
                <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        {payments.from || 0}—{payments.to || 0}
                    </p>
                    <div className="flex gap-2">
                        {(payments?.links || []).map((link, idx) => {
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
            {/* Detail Payment Modal */}
            <Modal
                show={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detail Transaksi Pembayaran"
                icon={<DocumentTextIcon className="w-5 h-5" />}
                maxWidth="2xl"
                footer={
                    <Button 
                        onClick={() => setIsDetailModalOpen(false)} 
                        variant="secondary"
                        className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                        Tutup
                    </Button>
                }
            >
                {selectedPayment && (
                    <div className="space-y-8 py-4">
                        {/* Status & Header */}
                        <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ID Transaksi</p>
                                <p className="text-xl font-black text-gray-900 tracking-tight">PAY-{String(selectedPayment.id).padStart(6, '0')}</p>
                            </div>
                            <StatusBadge status={selectedPayment.status_approval} />
                        </div>

                        {/* Grid Info */}
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Profil Siswa</p>
                                <p className="text-sm font-black text-gray-900">{selectedPayment.student?.nama_lengkap}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">NIS: {selectedPayment.student?.nis || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tagihan</p>
                                <p className="text-sm font-black text-gray-900">{selectedPayment.invoice?.tariff?.nama_tarif}</p>
                                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Nominal: {formatCurrency(selectedPayment.total_bayar)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Metode & Akun</p>
                                <p className="text-sm font-black text-gray-900 uppercase">{selectedPayment.jenis_transaksi}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedPayment.account?.bank} - {selectedPayment.account?.nama_rekening}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Waktu Transaksi</p>
                                <p className="text-sm font-black text-gray-900">{new Date(selectedPayment.created_at).toLocaleString('id-ID')}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Oleh: {selectedPayment.created_by?.name || 'Sistem'}</p>
                            </div>
                        </div>

                        {/* Bukti Bayar */}
                        {selectedPayment.media && selectedPayment.media.length > 0 && (
                            <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Bukti Pembayaran</p>
                                <div className="flex justify-center">
                                    <img 
                                        src={selectedPayment.media[0].original_url} 
                                        alt="Bukti Bayar" 
                                        className="max-h-[400px] rounded-3xl shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform cursor-zoom-in"
                                        onClick={() => window.open(selectedPayment.media[0].original_url, '_blank')}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Catatan */}
                        {selectedPayment.catatan && (
                            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Catatan / Keterangan</p>
                                <p className="text-sm text-blue-900 leading-relaxed font-medium">{selectedPayment.catatan}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            {/* Confirmation Modal for Approval */}
            <ConfirmationModal
                show={isConfirmModalOpen}
                onCancel={() => setIsConfirmModalOpen(false)}
                onConfirm={() => {
                    router.post(`/pembayaran/${selectedPayment.id}/approve`, {}, {
                        onSuccess: () => setIsConfirmModalOpen(false)
                    });
                }}
                title="Konfirmasi Persetujuan"
                description={`Apakah Anda yakin ingin menyetujui pembayaran dari ${selectedPayment?.student?.nama_lengkap} sebesar ${formatCurrency(selectedPayment?.total_bayar || 0)}?`}
                variant="success"
                confirmText="Ya, Setujui"
            />

            {/* Rejection Modal with Reason */}
            <Modal
                show={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Tolak Pembayaran"
                description="Berikan alasan mengapa pembayaran ini ditolak agar dapat dipahami oleh admin penginput."
                icon={<XCircleIcon className="w-5 h-5 text-rose-600" />}
                maxWidth="md"
                footer={
                    <>
                        <Button 
                            onClick={() => {
                                if (!rejectReason) return alert('Alasan penolakan wajib diisi.');
                                router.post(`/pembayaran/${selectedPayment.id}/reject`, { reason: rejectReason }, {
                                    onSuccess: () => setIsRejectModalOpen(false)
                                });
                            }} 
                            className="px-6 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-100"
                        >
                            Konfirmasi Tolak
                        </Button>
                        <Button 
                            onClick={() => setIsRejectModalOpen(false)} 
                            variant="secondary"
                            className="px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Batal
                        </Button>
                    </>
                }
            >
                <div className="py-2">
                    <TextareaField
                        label="Alasan Penolakan"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        placeholder="Misal: Bukti transfer tidak terbaca atau nominal tidak sesuai..."
                        rows={4}
                    />
                </div>
            </Modal>
        </AppLayout>
    );
}
