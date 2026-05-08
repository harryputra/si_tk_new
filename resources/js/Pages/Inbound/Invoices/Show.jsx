import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import { 
    ChevronLeftIcon, 
    BanknotesIcon, 
    UserIcon, 
    CalendarIcon, 
    DocumentTextIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import TextareaField from '@/Components/TextareaField';
import Button from '@/Components/Button';
import { useState } from 'react';

export default function Show({ invoice }) {
    const sisaTagihan = invoice.nominal_tagihan - invoice.nominal_terbayar;
    const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);

    const { data: waiverData, setData: setWaiverData, post: postWaiver, processing: waiverProcessing, reset: resetWaiver, errors: waiverErrors } = useForm({
        amount: sisaTagihan,
        reason: ''
    });

    const submitWaiver = (e) => {
        e.preventDefault();
        postWaiver(`/tagihan/${invoice.id}/waiver`, {
            onSuccess: () => {
                setIsWaiverModalOpen(false);
                resetWaiver();
            }
        });
    };

    const approveWaiver = (waiverId) => {
        if(confirm('Setujui pemutihan ini?')) {
            useForm().post(`/tagihan/waiver/${waiverId}/approve`);
        }
    };

    return (
        <AppLayout title="Detail Tagihan">
            <Head title={`Detail Tagihan - ${invoice.student.nama_lengkap}`} />

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <Link
                        href="/tagihan"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-brand-blue transition-colors gap-2 font-medium group"
                    >
                        <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Kembali ke Daftar Tagihan
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Main Details */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Rincian Card */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-600 bg-gradient-to-r from-blue-600 to-blue-400 p-12 text-white relative">
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.25em] mb-3">INVOICE ID</p>
                                        <h2 className="text-5xl font-black tracking-tight">#{invoice.id.toString().padStart(6, '0')}</h2>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                        {invoice.status}
                                    </div>
                                </div>
                                <div className="mt-14 flex gap-24 relative z-10">
                                    <div>
                                        <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.25em] mb-3">TOTAL TAGIHAN</p>
                                        <p className="text-4xl font-black tracking-tight">{formatCurrency(invoice.nominal_tagihan)}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.25em] mb-3">TELAH DIBAYAR</p>
                                        <p className="text-4xl font-black tracking-tight">Rp {invoice.nominal_terbayar.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                {/* Decorative circle */}
                                <div className="absolute top-0 right-0 -mt-24 -mr-24 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row min-h-[350px]">
                                <div className="flex-1 p-14">
                                    <h3 className="text-2xl font-black text-gray-900 mb-12 flex items-center gap-4">
                                        <DocumentTextIcon className="w-7 h-7 text-blue-600" />
                                        Rincian Tagihan
                                    </h3>
                                    <div className="space-y-12">
                                        <div className="flex justify-between items-center max-w-md group">
                                            <span className="text-lg text-gray-400 font-bold group-hover:text-gray-600 transition-colors">Jenis Biaya</span>
                                            <span className="text-lg font-black text-gray-800">{invoice.tariff?.nama_tarif || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center max-w-md group">
                                            <span className="text-lg text-gray-400 font-bold group-hover:text-gray-600 transition-colors">Periode</span>
                                            <span className="text-lg font-black text-gray-800">
                                                {new Date(invoice.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center max-w-md group">
                                            <span className="text-lg text-gray-400 font-bold group-hover:text-gray-600 transition-colors">Tanggal Dibuat</span>
                                            <span className="text-lg font-black text-gray-800">
                                                {new Date(invoice.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-80 bg-gray-50/50 flex flex-col items-center justify-center text-center p-12 border-l border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.25em] mb-10 leading-tight max-w-[140px]">SISA YANG HARUS DIBAYAR</p>
                                    <p className="text-5xl font-black text-blue-500 tracking-tighter">
                                        {formatCurrency(sisaTagihan)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Riwayat Pembayaran */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12">
                            <h3 className="text-xl font-black text-gray-900 mb-10 flex items-center gap-3">
                                <ArrowPathIcon className="w-6 h-6 text-blue-600" />
                                Riwayat Pembayaran
                            </h3>
                            <div className="text-center py-24 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-gray-50">
                                    <BanknotesIcon className="w-12 h-12 text-gray-200" />
                                </div>
                                <p className="text-base text-gray-400 font-bold tracking-wide">Belum ada riwayat pembayaran untuk tagihan ini.</p>
                            </div>
                        </div>

                        {/* Pengajuan Pemutihan */}
                        {invoice.waivers && invoice.waivers.length > 0 && (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 mt-8">
                                <h3 className="text-xl font-black text-gray-900 mb-10 flex items-center gap-3">
                                    <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                                    Status Pengajuan Pemutihan
                                </h3>
                                <div className="space-y-6">
                                    {invoice.waivers.map((waiver, idx) => (
                                        <div key={idx} className="border border-gray-100 p-6 rounded-2xl flex justify-between items-center bg-gray-50/50">
                                            <div>
                                                <p className="text-sm font-black text-gray-900 mb-1">{formatCurrency(waiver.amount)}</p>
                                                <p className="text-xs text-gray-500 font-medium mb-3">{waiver.reason}</p>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-white border border-gray-200 text-[10px] font-black rounded-full uppercase tracking-widest text-gray-600">
                                                        {waiver.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                {waiver.status === 'pending' && (
                                                    <button 
                                                        onClick={() => approveWaiver(waiver.id)}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Student & Actions */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Student Card */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
                            <h3 className="text-lg font-black text-gray-900 mb-10 flex items-center gap-3">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                                Informasi Siswa
                            </h3>
                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-24 h-24 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center text-3xl font-black mb-8 shadow-2xl shadow-blue-200 transform rotate-3">
                                    <div className="-rotate-3">{invoice.student.nama_lengkap.charAt(0)}</div>
                                </div>
                                <h4 className="font-black text-gray-900 text-2xl mb-2 tracking-tight leading-tight">{invoice.student.nama_lengkap}</h4>
                                <p className="text-base text-gray-400 font-bold uppercase tracking-widest">NIS: {invoice.student.nis}</p>
                            </div>
                            <div className="space-y-10 pt-10 border-t border-gray-50">
                                <div>
                                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] mb-3">ANGKATAN</p>
                                    <p className="text-xl font-black text-gray-800">{invoice.student.tahun_angkatan}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] mb-3">JENIS SISWA</p>
                                    <span className="inline-block px-8 py-2.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-sm">
                                        {invoice.student.jenis_siswa.replace('_', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] mb-3">NAMA WALI</p>
                                    <p className="text-xl font-black text-gray-800">{invoice.student.nama_wali}</p>
                                </div>
                            </div>
                        </div>

                        {/* Aksi Cepat Card */}
                        <div className="bg-emerald-50 rounded-[2rem] p-10 border border-emerald-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xs font-black text-[#064E3B] mb-8 uppercase tracking-[0.2em]">AKSI CEPAT</h3>
                                <button 
                                    onClick={() => router.get('/tagihan', { search: invoice.student.nis })}
                                    className="w-full bg-[#10B981] text-white font-black py-5 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-[#059669] transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95"
                                >
                                    <BanknotesIcon className="w-6 h-6" />
                                    Bayar Sekarang
                                </button>
                                <p className="text-[10px] text-[#059669] text-center mt-6 font-bold italic opacity-80 group-hover:opacity-100 transition-opacity">
                                    Klik tombol di atas untuk membuka form pembayaran di halaman utama.
                                </p>
                                
                                {invoice.status !== 'lunas' && (
                                    <div className="mt-6 pt-6 border-t border-emerald-200">
                                        <button 
                                            onClick={() => setIsWaiverModalOpen(true)}
                                            className="w-full bg-white text-emerald-700 font-black py-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 transform active:scale-95 text-xs uppercase tracking-widest border border-emerald-200"
                                        >
                                            <DocumentTextIcon className="w-5 h-5" />
                                            Ajukan Pemutihan
                                        </button>
                                        <p className="text-[9px] text-[#059669] text-center mt-3 font-bold opacity-80">
                                            Pengajuan diskon/pembebasan biaya (Butuh ACC Kepsek)
                                        </p>
                                    </div>
                                )}
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/40 rounded-full blur-3xl transition-transform group-hover:scale-125"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Pemutihan */}
            <Modal
                show={isWaiverModalOpen}
                onClose={() => setIsWaiverModalOpen(false)}
                title="Pengajuan Pemutihan"
                description="Ajukan pembebasan biaya atau diskon khusus untuk tagihan ini."
                maxWidth="md"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="waiver-form" 
                            loading={waiverProcessing} 
                            className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200"
                        >
                            Kirim Pengajuan
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => setIsWaiverModalOpen(false)} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Batalkan
                        </Button>
                    </>
                }
            >
                <form id="waiver-form" onSubmit={submitWaiver} className="space-y-6 py-4">
                    <InputField
                        label="Nominal Pemutihan"
                        name="amount"
                        type="number"
                        required
                        prefix="Rp"
                        value={waiverData.amount}
                        onChange={e => setWaiverData('amount', e.target.value)}
                        error={waiverErrors.amount}
                        max={sisaTagihan}
                    />
                    
                    <TextareaField
                        label="Alasan Pemutihan"
                        name="reason"
                        required
                        rows={3}
                        value={waiverData.reason}
                        onChange={e => setWaiverData('reason', e.target.value)}
                        error={waiverErrors.reason}
                        placeholder="Contoh: Keringanan biaya khusus dari yayasan..."
                    />
                </form>
            </Modal>
        </AppLayout>
    );
}
