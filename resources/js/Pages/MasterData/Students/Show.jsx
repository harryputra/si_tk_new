import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import TextareaField from '@/Components/TextareaField';
import Button from '@/Components/Button';
import { 
    UserIcon, 
    AcademicCapIcon, 
    CalendarIcon, 
    UserGroupIcon, 
    PhoneIcon, 
    ArrowLeftIcon, 
    IdentificationIcon,
    MapPinIcon,
    InformationCircleIcon,
    BanknotesIcon,
    XMarkIcon,
    DocumentArrowUpIcon,
    DocumentTextIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Show({ student, accounts = [] }) {
    const [activeTab, setActiveTab] = React.useState('profil');
    const [payInvoice, setPayInvoice] = React.useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        invoice_id: '',
        total_bayar: '',
        jenis_transaksi: 'tunai',
        account_id: '',
        bukti_bayar: null,
        catatan: '',
    });

    const initials = student.nama_lengkap
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalTagihan = student.invoices?.reduce((acc, inv) => acc + parseFloat(inv.nominal_tagihan), 0) || 0;
    const totalTerbayar = student.invoices?.reduce((acc, inv) => acc + parseFloat(inv.nominal_terbayar), 0) || 0;
    const sisaTagihan = totalTagihan - totalTerbayar;

    const openPayModal = (invoice) => {
        setPayInvoice(invoice);
        setData({
            invoice_id: invoice.id,
            total_bayar: parseFloat(invoice.nominal_tagihan) - parseFloat(invoice.nominal_terbayar),
            jenis_transaksi: 'tunai',
            account_id: '',
            bukti_bayar: null,
            catatan: '',
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
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AppLayout title="Detail Siswa">
            <Head title={`Detail Siswa - ${student.nama_lengkap}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Back Button */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/siswa"
                        className="group flex items-center gap-2 text-sm font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                            <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        </div>
                        Kembali ke Daftar
                    </Link>
                </div>

                {/* Profile Header Card */}
                <div className="relative overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-8 md:p-12">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
                    
                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            {student.photo ? (
                                <img 
                                    src={`/storage/${student.photo}`} 
                                    alt={student.nama_lengkap} 
                                    className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] object-cover shadow-2xl border-4 border-white"
                                />
                            ) : (
                                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-2xl overflow-hidden border-4 border-white">
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {initials}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2">
                                <StatusBadge status={student.status} className="px-4 py-2 border-4 border-white shadow-lg text-[10px]" />
                            </div>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                    <IdentificationIcon className="w-3.5 h-3.5" />
                                    NIS: {student.nis}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                                    {student.nama_lengkap}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <AcademicCapIcon className="w-5 h-5 text-blue-400" />
                                        Angkatan {student.tahun_angkatan}
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium capitalize">
                                        <InformationCircleIcon className="w-5 h-5 text-blue-400" />
                                        {student.jenis_siswa.replace('_', ' ')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
                            <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 text-center space-y-1 shadow-sm">
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Kelas</p>
                                <p className="text-xl font-black text-amber-600 uppercase tracking-wider">{student.current_class?.name || '-'}</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-center space-y-1 shadow-sm">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sisa Tagihan</p>
                                <p className="text-lg font-black text-emerald-600 tracking-tight">{formatCurrency(sisaTagihan)}</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-blue-600 text-center space-y-1 shadow-xl shadow-blue-100 col-span-2 md:col-span-1 flex flex-col justify-center items-center">
                                {sisaTagihan > 0 ? (
                                    <button 
                                        onClick={() => openPayModal(student.invoices.find(i => i.status !== 'paid'))}
                                        className="w-full h-full flex flex-col items-center justify-center gap-1 group"
                                    >
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest group-hover:text-white transition-colors">Bayar Cepat</p>
                                        <div className="flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full group-hover:bg-white group-hover:text-blue-600 transition-all">
                                            <BanknotesIcon className="w-4 h-4" />
                                            <p className="text-xs font-black uppercase tracking-wider">Bayar</p>
                                        </div>
                                    </button>
                                ) : (
                                    <>
                                        <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Status</p>
                                        <p className="text-xl font-black text-white uppercase tracking-wider">LUNAS</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Selection */}
                <div className="flex items-center gap-4 border-b border-gray-100 pb-1">
                    <TabButton active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} label="Informasi Profil" />
                    <TabButton active={activeTab === 'akademik'} onClick={() => setActiveTab('akademik')} label="Akademik & Histori" />
                    <TabButton active={activeTab === 'keuangan'} onClick={() => setActiveTab('keuangan')} label="Status Keuangan" />
                </div>

                {/* Content Area */}
                {activeTab === 'profil' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Profile Data */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Identitas Siswa</h2>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Data diri dasar</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                <InfoItem label="Nama Lengkap" value={student.nama_lengkap} icon={UserIcon} />
                                <InfoItem label="Nama Panggilan" value={student.nama_panggilan || '-'} icon={UserIcon} />
                                <InfoItem label="NIS" value={student.nis} icon={IdentificationIcon} />
                                <InfoItem label="Alamat" value={student.alamat || '-'} icon={MapPinIcon} className="sm:col-span-2" />
                            </div>
                        </div>

                        {/* Guardian Information */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                    <UserGroupIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Data Orang Tua / Wali</h2>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Informasi kontak penanggung jawab</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                <InfoItem label="Nama Wali" value={student.nama_wali} icon={UserIcon} />
                                <InfoItem label="No HP Wali" value={student.no_hp_wali || '-'} icon={PhoneIcon} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'akademik' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Current Academic State */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                    <AcademicCapIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Data Akademik</h2>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Status pendidikan aktif</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                                <InfoItem label="Tahun Angkatan" value={student.tahun_angkatan} icon={CalendarIcon} />
                                <InfoItem label="Jenis Siswa" value={student.jenis_siswa.replace('_', ' ')} icon={InformationCircleIcon} className="capitalize" />
                                <InfoItem label="Kelas Saat Ini" value={student.current_class?.name || 'Belum Masuk Kelas'} icon={AcademicCapIcon} className="sm:col-span-2" />
                            </div>
                        </div>

                        {/* Enrollment History Table */}
                        {student.enrollments && student.enrollments.length > 0 && (
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                                        <AcademicCapIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Riwayat Kelas & Penempatan</h2>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">History kelas per tahun ajaran</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tahun Ajaran</th>
                                                <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kelas</th>
                                                <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Enrol</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {student.enrollments.map((enrollment, index) => (
                                                <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 text-sm font-bold text-gray-900">{enrollment.academic_year?.name || '-'}</td>
                                                    <td className="py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-black tracking-widest">
                                                            {enrollment.school_class?.name || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-sm font-medium text-gray-500">
                                                        {new Date(enrollment.enrollment_date).toLocaleDateString('id-ID', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'keuangan' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Financial Summaries */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FinanceCard label="Total Tagihan" value={totalTagihan} color="blue" />
                            <FinanceCard label="Total Terbayar" value={totalTerbayar} color="emerald" />
                            <FinanceCard label="Sisa Piutang" value={sisaTagihan} color="rose" />
                        </div>

                        {/* Detailed Bill List */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
                                    <BanknotesIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Rincian Iuran & Tagihan</h2>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">List tagihan yang melekat pada siswa</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Iuran</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Periode</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nominal</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sisa</th>
                                            <th className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.invoices?.map((inv, idx) => {
                                            const sisa = parseFloat(inv.nominal_tagihan) - parseFloat(inv.nominal_terbayar);
                                            return (
                                                <tr key={idx} className="bg-gray-50/30 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all">
                                                    <td className="px-6 py-5 rounded-l-2xl border-y border-l border-gray-100">
                                                        <p className="text-sm font-black text-gray-900">{inv.tariff?.nama_tarif || 'Umum'}</p>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{inv.tariff?.billing_cycle?.replace('_', ' ')}</p>
                                                    </td>
                                                    <td className="px-6 py-5 border-y border-gray-100">
                                                        <p className="text-xs font-black text-gray-600 uppercase">
                                                            {inv.periode ? new Date(inv.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '-'}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-5 border-y border-gray-100">
                                                        <p className="text-sm font-black text-gray-900">{formatCurrency(inv.nominal_tagihan)}</p>
                                                    </td>
                                                    <td className="px-6 py-5 border-y border-gray-100 text-rose-600 font-bold text-sm">
                                                        {formatCurrency(sisa)}
                                                    </td>
                                                    <td className="px-6 py-5 rounded-r-2xl border-y border-r border-gray-100 text-right">
                                                        {sisa > 0 ? (
                                                            <button 
                                                                onClick={() => openPayModal(inv)}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2 ml-auto"
                                                            >
                                                                <BanknotesIcon className="w-3.5 h-3.5" />
                                                                Bayar
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center gap-2 justify-end text-emerald-600">
                                                                <CheckCircleIcon className="w-4 h-4" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Lunas</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {(!student.invoices || student.invoices.length === 0) && (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
                                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Belum ada tagihan terdaftar untuk siswa ini.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

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
                            {/* Summary Bar */}
                            <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg">
                                        {student.nama_lengkap.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-900 leading-tight uppercase tracking-tight">
                                            {student.nama_lengkap}
                                        </h4>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                            {payInvoice.tariff?.nama_tarif} • {payInvoice.periode ? new Date(payInvoice.periode).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Umum'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">SISA TAGIHAN</p>
                                    <p className="text-base font-black text-blue-600 tracking-tight">
                                        {formatCurrency(parseFloat(payInvoice.nominal_tagihan) - parseFloat(payInvoice.nominal_terbayar))}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            </div>

                            <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">NOMINAL PEMBAYARAN</p>
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-xl font-black text-gray-300">Rp</span>
                                    <input
                                        type="number"
                                        className="w-full max-w-[280px] bg-transparent border-none p-0 text-4xl font-black text-gray-900 focus:ring-0 text-center tracking-tighter"
                                        value={data.total_bayar}
                                        onChange={e => setData('total_bayar', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2rem] p-8 transition-all hover:border-blue-300 hover:bg-blue-50/20 group text-center">
                                <label className="flex flex-col items-center cursor-pointer">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                        <DocumentArrowUpIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                                    </div>
                                    <span className="text-sm font-black text-gray-800 tracking-tight">Lampirkan Bukti Bayar</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={e => setData('bukti_bayar', e.target.files[0])}
                                    />
                                </label>
                                {data.bukti_bayar && (
                                    <div className="mt-4 p-3 bg-white rounded-xl border border-blue-100 flex items-center gap-3">
                                        <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                                        <span className="text-xs font-bold text-gray-600 truncate">{data.bukti_bayar.name}</span>
                                        <button type="button" onClick={() => setData('bukti_bayar', null)} className="ml-auto text-gray-300 hover:text-rose-500">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <TextareaField
                                label="CATATAN"
                                value={data.catatan}
                                onChange={e => setData('catatan', e.target.value)}
                                placeholder="Tambahkan catatan jika diperlukan..."
                            />
                        </form>
                    )}
                </Modal>
            </div>
        </AppLayout>
    );
}

function TabButton({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
        >
            {label}
            {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
        </button>
    );
}

function FinanceCard({ label, value, color }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(amount);
    };

    const colorClasses = {
        blue: "bg-blue-50 border-blue-100 text-blue-600",
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
        rose: "bg-rose-50 border-rose-100 text-rose-600"
    };

    return (
        <div className={clsx("p-8 rounded-[2rem] border-2 shadow-sm space-y-2 transition-all hover:scale-[1.02]", colorClasses[color])}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
            <p className="text-2xl font-black tracking-tight">{formatCurrency(value)}</p>
        </div>
    );
}

function InfoItem({ label, value, icon: Icon, className }) {
    return (
        <div className={clsx("group space-y-1.5", className)}>
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-400 transition-colors">
                <Icon className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight">
                {value}
            </p>
        </div>
    );
}

