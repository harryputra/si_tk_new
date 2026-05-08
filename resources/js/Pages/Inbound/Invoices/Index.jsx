import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import SelectField from '@/Components/SelectField';
import PremiumSelect from '@/Components/PremiumSelect';
import CurrencyInput from '@/Components/CurrencyInput';
import TextareaField from '@/Components/TextareaField';
import Button from '@/Components/Button';
import { 
    BanknotesIcon, 
    EyeIcon, 
    MagnifyingGlassIcon, 
    XMarkIcon, 
    DocumentArrowUpIcon, 
    DocumentTextIcon, 
    TableCellsIcon,
    CheckCircleIcon, 
    ChevronDownIcon,
    AcademicCapIcon,
    Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Index({ invoices = { data: [], links: [] }, filters = {}, students = [], accounts = [], classes = [] }) {
    console.log('Rendering Invoices Index', { invoices });
    
    const [payInvoice, setPayInvoice] = useState(null);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(filters?.search || '');
    const searchTimeoutRef = useRef(null);

    const { data: genData, setData: setGenData, post: postGen, processing: genProcessing, reset: resetGen, errors: genErrors } = useForm({
        academic_year_id: '',
        month: new Date().toISOString().slice(0, 7) // YYYY-MM
    });

    const submitGenerate = (e) => {
        e.preventDefault();
        postGen('/tagihan/generate-bills', {
            onSuccess: () => {
                setIsGenerateModalOpen(false);
                resetGen();
            }
        });
    };

    const handleFilter = useCallback((key, value) => {
        router.get('/tagihan', { ...filters, [key]: value }, { preserveState: true });
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

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        invoice_id: '',
        account_id: '',
        total_bayar: '',
        jenis_bayar: 'lunas',
        jenis_transaksi: 'tunai',
        catatan: '',
        bukti_bayar: null,
    });

    const openPayModal = (invoice) => {
        if (!invoice) return;
        setPayInvoice(invoice);
        const sisa = (parseFloat(invoice.nominal_tagihan) || 0) - (parseFloat(invoice.nominal_terbayar) || 0);
        setData({
            invoice_id: invoice.id,
            account_id: '',
            total_bayar: sisa,
            jenis_bayar: 'lunas',
            jenis_transaksi: 'tunai',
            catatan: '',
            bukti_bayar: null,
        });
    };

    const closeModal = () => {
        setPayInvoice(null);
        reset();
        clearErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        post('/pembayaran', {
            forceFormData: true,
            onSuccess: () => closeModal(),
        });
    };

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, []);

    const sisaTagihan = payInvoice ? (parseFloat(payInvoice.nominal_tagihan) || 0) - (parseFloat(payInvoice.nominal_terbayar) || 0) : 0;

    return (
        <AppLayout title="Tagihan Siswa">
            <Head title="Manajemen Tagihan — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tagihan & SPP</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Pusat Kendali Keuangan Siswa</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">TOTAL TAGIHAN AKTIF</p>
                        <p className="text-xl font-black text-blue-600 tracking-tight">{(invoices?.total || 0)} Data</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={`/tagihan/export/pdf?${new URLSearchParams(filters).toString()}`}
                            target="_blank"
                            className="px-5 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 font-black text-[10px] uppercase tracking-widest shadow-sm transition-all flex items-center gap-2"
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            PDF
                        </a>
                        <a
                            href={`/tagihan/export/excel?${new URLSearchParams(filters).toString()}`}
                            className="px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 font-black text-[10px] uppercase tracking-widest shadow-sm transition-all flex items-center gap-2"
                        >
                            <TableCellsIcon className="w-4 h-4" />
                            EXCEL
                        </a>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 shrink-0"
                    >
                        Generate Tagihan
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
                            options={[
                                { value: '', label: 'SEMUA STATUS' },
                                { value: 'unpaid', label: 'BELUM BAYAR' },
                                { value: 'partial', label: 'CICILAN' },
                                { value: 'paid', label: 'LUNAS' },
                            ]}
                        />
                        
                        <PremiumSelect
                            className="min-w-[220px]"
                            value={filters.student_id || ''}
                            onChange={(e) => handleFilter('student_id', e.target.value)}
                            options={[
                                { value: '', label: 'SEMUA SISWA' },
                                ...(students || []).map(s => ({ 
                                    value: s.id, 
                                    label: (s.nama_lengkap || 'SISWA').toUpperCase() 
                                }))
                            ]}
                        />

                        <PremiumSelect
                            className="min-w-[180px]"
                            value={filters?.school_class_id || ''}
                            onChange={(e) => handleFilter('school_class_id', e.target.value)}
                            icon={<AcademicCapIcon className="w-5 h-5" />}
                            options={[
                                { value: '', label: 'SEMUA KELAS' },
                                ...(classes || []).map(c => ({ 
                                    value: c.id, 
                                    label: `${c.level} ${c.name}`.toUpperCase() 
                                }))
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
                                { value: '100', label: '100 ITEMS' },
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
                                    {((invoices?.current_page || 1) - 1) * (invoices?.per_page || 10) + index + 1}
                                </span>
                            )
                        },
                        {
                            label: 'Siswa',
                            render: (row) => (
                                <Link 
                                    href={`/siswa/${row.student_id}`} 
                                    className="flex items-center gap-5 group/student hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-blue-100 shrink-0 transform -rotate-2 group-hover/student:rotate-0 transition-transform">
                                        <div className="rotate-2 group-hover/student:rotate-0">{row.student?.nama_lengkap?.charAt(0) || '?'}</div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1 group-hover/student:text-blue-600 transition-colors">
                                            {row.student?.nama_lengkap || 'Siswa Tidak Dikenal'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">NIS: {row.student?.nis || '-'}</p>
                                    </div>
                                </Link>
                            )
                        },
                        {
                            label: 'Informasi Tagihan',
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-800 leading-tight mb-1">{row.tariff?.nama_tarif || 'Umum'}</p>
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">
                                        {row.periode ? new Date(row.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '-'}
                                    </p>
                                </div>
                            )
                        },
                        {
                            label: 'Status Pembayaran',
                            render: (row) => {
                                const nominal_tagihan = parseFloat(row.nominal_tagihan) || 0;
                                const nominal_terbayar = parseFloat(row.nominal_terbayar) || 0;
                                const sisa = nominal_tagihan - nominal_terbayar;
                                
                                return (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                'w-2 h-2 rounded-full',
                                                row.status === 'paid' ? 'bg-emerald-500' : row.status === 'partial' ? 'bg-amber-500' : 'bg-rose-500'
                                            )}></span>
                                            <span className={clsx(
                                                'text-[10px] font-black uppercase tracking-[0.2em]',
                                                row.status === 'paid' ? 'text-emerald-600' : row.status === 'partial' ? 'text-amber-600' : 'text-rose-600'
                                            )}>
                                                {(row.status || 'unpaid').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 mt-3">
                                            <div className="flex items-center justify-between gap-4 bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">TERBAYAR</span>
                                                <span className="text-xs font-black text-gray-900">{formatCurrency(nominal_terbayar)}</span>
                                            </div>
                                            {sisa > 0 && (
                                                <div className="flex items-center justify-between gap-4 bg-rose-50/30 px-3 py-1.5 rounded-lg border border-rose-100/50">
                                                    <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest">SISA</span>
                                                    <span className="text-xs font-black text-rose-600">{formatCurrency(sisa)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        },
                        {
                            label: 'Total Tagihan',
                            render: (row) => (
                                <p className="text-lg font-black text-gray-900 tracking-tight">{formatCurrency(parseFloat(row.nominal_tagihan) || 0)}</p>
                            )
                        }
                    ]}
                    data={invoices?.data || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <Link
                                href={`/tagihan/${row.id}`}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center transition-all group"
                                title="Lihat Detail"
                            >
                                <EyeIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </Link>
                            
                            {row.status !== 'paid' && (
                                <button
                                    onClick={() => openPayModal(row)}
                                    className="px-5 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.15em] transition-all shadow-md shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 active:scale-95 flex items-center gap-2 group whitespace-nowrap"
                                >
                                    <BanknotesIcon className="w-4 h-4 transition-transform group-hover:rotate-12" />
                                    BAYAR
                                </button>
                            )}
                        </div>
                    )}
                />

                {/* Footer Pagination */}
                <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                        {invoices.from || 0}—{invoices.to || 0}
                    </p>
                    <div className="flex gap-2">
                        {invoices.links.map((link, idx) => {
                            // Clean up label - handle both technical keys and HTML entities
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

            {/* Payment Modal */}
            <Modal
                show={payInvoice !== null}
                onClose={closeModal}
                title="Selesaikan Pembayaran"
                description="Lengkapi rincian transaksi di bawah untuk mencatat pembayaran."
                icon={<BanknotesIcon className="w-6 h-6" />}
                maxWidth="2xl"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="payment-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200"
                        >
                            Konfirmasi Pembayaran
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
                {payInvoice && (
                    <form id="payment-form" onSubmit={submit} className="space-y-8 py-6">
                        {/* Compact Summary Bar */}
                        <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-200">
                                    {payInvoice.student?.nama_lengkap?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900 leading-tight truncate max-w-[200px] uppercase tracking-tight">
                                        {payInvoice.student?.nama_lengkap || 'Siswa'}
                                    </h4>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                        {payInvoice.tariff?.nama_tarif} • {new Date(payInvoice.periode).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">SISA TAGIHAN</p>
                                <p className="text-base font-black text-blue-600 tracking-tight">
                                    {formatCurrency(payInvoice.nominal_tagihan - payInvoice.nominal_terbayar)}
                                </p>
                            </div>
                        </div>

                        {/* Payment History Log (Tracking) */}
                        {payInvoice.inbound_payments?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8 shadow-sm">
                                <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Riwayat Pembayaran Sebelumnya</p>
                                    <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                        {payInvoice.inbound_payments.length} Transaksi
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50 max-h-[120px] overflow-y-auto">
                                    {payInvoice.inbound_payments.map((p, idx) => (
                                        <div key={p.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-tight">Bayar #{idx + 1}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold">{new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-black text-emerald-600">{formatCurrency(p.total_bayar)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Inputs */}
                        <div className={clsx(
                            "grid gap-6 mb-8",
                            data.jenis_transaksi === 'transfer' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                        )}>
                            <PremiumSelect
                                label="METODE BAYAR"
                                value={data.jenis_transaksi}
                                onChange={e => setData('jenis_transaksi', e.target.value)}
                                error={errors.jenis_transaksi}
                                options={[
                                    { value: 'tunai', label: 'TUNAI / CASH' },
                                    { value: 'transfer', label: 'TRANSFER BANK' },
                                ]}
                            />

                            {data.jenis_transaksi === 'transfer' && (
                                <PremiumSelect
                                    label="REKENING TUJUAN"
                                    value={data.account_id}
                                    onChange={e => setData('account_id', e.target.value)}
                                    error={errors.account_id}
                                    options={[
                                        { value: '', label: 'PILIH REKENING' },
                                        ...accounts.map(acc => ({ 
                                            value: acc.id, 
                                            label: `${acc.bank} - ${acc.nama_rekening}`.toUpperCase() 
                                        }))
                                    ]}
                                />
                            )}
                        </div>

                        {/* Compact Nominal Input */}
                        <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm mb-6">
                            <CurrencyInput
                                label="NOMINAL PEMBAYARAN"
                                value={data.total_bayar}
                                onChange={e => setData('total_bayar', e.target.value)}
                                error={errors.total_bayar}
                                inputClassName="!border-none !ring-0 text-3xl font-black text-gray-900 text-center tracking-tighter !bg-transparent !pl-0 !pr-0"
                            />
                        </div>

                        {/* Payment Type Selection */}
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">KLASIFIKASI PEMBAYARAN</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { val: 'lunas', label: 'PELUNASAN', desc: 'Bayar sisa penuh', icon: <CheckCircleIcon className="w-5 h-5" /> },
                                    { val: 'cicilan', label: 'CICILAN', desc: 'Bayar sebagian', icon: <BanknotesIcon className="w-5 h-5" /> },
                                ].map(opt => (
                                    <label
                                        key={opt.val}
                                        className={clsx(
                                            'relative flex flex-col gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300',
                                            data.jenis_bayar === opt.val 
                                                ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100' 
                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                        )}
                                        onClick={() => {
                                            if (opt.val === 'lunas') {
                                                setData({
                                                    ...data,
                                                    jenis_bayar: 'lunas',
                                                    total_bayar: payInvoice.nominal_tagihan - payInvoice.nominal_terbayar
                                                });
                                            } else {
                                                setData('jenis_bayar', 'cicilan');
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className={clsx(
                                                'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                                                data.jenis_bayar === opt.val ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'
                                            )}>
                                                {opt.icon}
                                            </div>
                                            {data.jenis_bayar === opt.val && (
                                                <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 tracking-tight">{opt.label}</p>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{opt.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Styled File Upload */}
                        <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-6 transition-all hover:border-blue-300 hover:bg-blue-50/20 group text-center">
                            <label className="flex flex-col items-center cursor-pointer">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                    <DocumentArrowUpIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                                </div>
                                <span className="text-sm font-black text-gray-800 tracking-tight">Lampirkan Bukti Pembayaran</span>
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1.5">PNG, JPG atau PDF (Maks. 5MB)</span>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={e => setData('bukti_bayar', e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            {data.bukti_bayar && (
                                <div className="mt-6 flex items-center gap-3 bg-white p-3 rounded-xl border border-blue-100 shadow-lg shadow-blue-50 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                                        <DocumentTextIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-800 truncate flex-1 text-left">{data.bukti_bayar.name}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setData('bukti_bayar', null)} 
                                        className="w-7 h-7 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {errors.bukti_bayar && <p className="mt-3 text-[10px] text-red-600 font-bold uppercase tracking-widest">{errors.bukti_bayar}</p>}
                        </div>

                        <TextareaField
                            label="CATATAN TRANSAKSI"
                            name="catatan"
                            rows={3}
                            value={data.catatan}
                            onChange={e => setData('catatan', e.target.value)}
                            error={errors.catatan}
                            placeholder="Tulis informasi tambahan jika diperlukan..."
                            className="bg-white"
                        />
                    </form>
                )}
            </Modal>

            {/* Generate Bills Modal */}
            <Modal
                show={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                title="Generate Tagihan Bulanan"
                description="Sistem akan membuat tagihan secara otomatis untuk semua siswa aktif berdasarkan kelas dan komponen biaya yang berlaku."
                maxWidth="md"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="generate-form" 
                            loading={genProcessing} 
                            className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200"
                        >
                            Proses Generate
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => setIsGenerateModalOpen(false)} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Batalkan
                        </Button>
                    </>
                }
            >
                <form id="generate-form" onSubmit={submitGenerate} className="space-y-6 py-4">
                    <InputField
                        label="Pilih Bulan & Tahun"
                        name="month"
                        type="month"
                        required
                        value={genData.month}
                        onChange={e => setGenData('month', e.target.value)}
                        error={genErrors.month}
                    />
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Ajaran</label>
                        <PremiumSelect
                            value={genData.academic_year_id}
                            onChange={e => setGenData('academic_year_id', e.target.value)}
                            options={[
                                { value: '', label: '-- PILIH TAHUN AJARAN --' },
                                { value: '1', label: '2024/2025' },
                                { value: '2', label: '2025/2026' }
                            ]}
                        />
                        <p className="text-[9px] text-gray-400 mt-1 ml-1 font-bold">Pastikan tahun ajaran sudah dibuat di Master Data.</p>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
