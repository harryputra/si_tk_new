import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import { 
    UserGroupIcon, 
    PlusIcon, 
    DocumentCheckIcon,
    CurrencyDollarIcon,
    AcademicCapIcon,
    BanknotesIcon,
    CheckCircleIcon,
    DocumentArrowUpIcon,
    DocumentTextIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import TextareaField from '@/Components/TextareaField';

export default function Index({ students = { data: [] }, classes = [], accounts = [] }) {
    const [isRegModalOpen, setIsRegModalOpen] = useState(false);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
    const [isInvoiceListModalOpen, setIsInvoiceListModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const regForm = useForm({
        nama_lengkap: '',
        nama_panggilan: '',
        tahun_angkatan: new Date().getFullYear(),
        jenis_siswa: 'reguler',
        nama_wali: '',
        no_hp_wali: '',
    });

    const activateForm = useForm({
        school_class_id: '',
    });

    const paymentForm = useForm({
        invoice_id: '',
        account_id: '',
        total_bayar: '',
        jenis_bayar: 'lunas',
        jenis_transaksi: 'tunai',
        catatan: '',
        bukti_bayar: null,
    });

    const submitReg = (e) => {
        e.preventDefault();
        regForm.post('/ppdb', {
            onSuccess: () => {
                setIsRegModalOpen(false);
                regForm.reset();
            }
        });
    };

    const handleActivateClick = (student) => {
        setSelectedStudent(student);
        activateForm.setData('school_class_id', '');
        setIsActivateModalOpen(true);
    };

    const submitActivate = (e) => {
        e.preventDefault();
        activateForm.post(`/ppdb/${selectedStudent.id}/activate`, {
            onSuccess: () => {
                setIsActivateModalOpen(false);
                setSelectedStudent(null);
            }
        });
    };

    const handlePayClick = (student) => {
        setSelectedStudent(student);
        setIsInvoiceListModalOpen(true);
    };

    const openPaymentEntry = (invoice) => {
        setSelectedInvoice(invoice);
        paymentForm.setData({
            invoice_id: invoice.id,
            account_id: '',
            total_bayar: invoice.nominal_tagihan - invoice.nominal_terbayar,
            jenis_bayar: 'lunas',
            jenis_transaksi: 'tunai',
            catatan: '',
            bukti_bayar: null,
        });
        setIsInvoiceListModalOpen(false);
        setIsPaymentModalOpen(true);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        paymentForm.post('/pembayaran', {
            forceFormData: true,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setSelectedInvoice(null);
                paymentForm.reset();
            }
        });
    };

    return (
        <AppLayout title="Penerimaan Siswa Baru">
            <Head title="PPDB — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Data Calon Siswa (PPDB)</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Kelola Pendaftaran & Penempatan Rombel</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setIsRegModalOpen(true)}
                    className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 shrink-0"
                    icon={<PlusIcon className="w-5 h-5" />}
                >
                    Daftarkan Calon Siswa
                </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Profil Calon Siswa',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-100 shrink-0 transform rotate-2">
                                        <UserGroupIcon className="w-6 h-6 transform -rotate-2" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.nama_lengkap}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">REG: {row.registration_number}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Status Finansial',
                            render: (row) => {
                                const isClear = row.sisa_tagihan <= 0;
                                return (
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                            isClear ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-rose-50 border-rose-100 text-rose-500"
                                        )}>
                                            <CurrencyDollarIcon className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={clsx(
                                                "text-sm font-black truncate leading-tight mb-0.5",
                                                isClear ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {isClear ? "Lunas Administrasi" : `Tunggakan: ${formatRupiah(row.sisa_tagihan)}`}
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Syarat Aktivasi</p>
                                        </div>
                                    </div>
                                )
                            }
                        }
                    ]}
                    data={students.data}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            {row.sisa_tagihan > 0 && (
                                <Button
                                    onClick={() => handlePayClick(row)}
                                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                                    icon={<BanknotesIcon className="w-4 h-4" />}
                                >
                                    Bayar
                                </Button>
                            )}
                            <Button
                                onClick={() => handleActivateClick(row)}
                                disabled={row.sisa_tagihan > 0}
                                className={clsx(
                                    "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm",
                                    row.sisa_tagihan > 0 
                                        ? "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed opacity-60" 
                                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                                )}
                                icon={<DocumentCheckIcon className="w-4 h-4" />}
                            >
                                Aktivasi
                            </Button>
                        </div>
                    )}
                />
            </div>

            {/* Modal Pendaftaran */}
            <Modal
                show={isRegModalOpen}
                onClose={() => setIsRegModalOpen(false)}
                title="Daftarkan Calon Siswa Baru"
                description="Input data awal untuk generate Nomor Registrasi dan Tagihan Pendaftaran."
                icon={<UserGroupIcon className="w-5 h-5" />}
                maxWidth="2xl"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="reg-form" 
                            loading={regForm.processing} 
                            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200"
                        >
                            Simpan & Buat Tagihan
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => setIsRegModalOpen(false)} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Batal
                        </Button>
                    </>
                }
            >
                <form id="reg-form" onSubmit={submitReg} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Nama Lengkap"
                            name="nama_lengkap"
                            required
                            value={regForm.data.nama_lengkap}
                            onChange={e => regForm.setData('nama_lengkap', e.target.value)}
                            error={regForm.errors.nama_lengkap}
                            autoFocus
                        />
                        <InputField
                            label="Nama Panggilan"
                            name="nama_panggilan"
                            value={regForm.data.nama_panggilan}
                            onChange={e => regForm.setData('nama_panggilan', e.target.value)}
                        />
                        <InputField
                            label="Tahun Angkatan"
                            name="tahun_angkatan"
                            type="number"
                            required
                            value={regForm.data.tahun_angkatan}
                            onChange={e => regForm.setData('tahun_angkatan', e.target.value)}
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Siswa</label>
                            <PremiumSelect
                                value={regForm.data.jenis_siswa}
                                onChange={e => regForm.setData('jenis_siswa', e.target.value)}
                                options={[
                                    { value: 'reguler', label: 'Reguler' },
                                    { value: 'fullday', label: 'Full Day' },
                                    { value: 'reguler_opsi2', label: 'Reguler Opsi 2' },
                                ]}
                            />
                        </div>
                        <InputField
                            label="Nama Wali"
                            name="nama_wali"
                            required
                            value={regForm.data.nama_wali}
                            onChange={e => regForm.setData('nama_wali', e.target.value)}
                        />
                        <InputField
                            label="No HP Wali"
                            name="no_hp_wali"
                            value={regForm.data.no_hp_wali}
                            onChange={e => regForm.setData('no_hp_wali', e.target.value)}
                        />
                    </div>
                </form>
            </Modal>

            {/* Modal Aktivasi & Pilih Rombel */}
            <Modal
                show={isActivateModalOpen}
                onClose={() => setIsActivateModalOpen(false)}
                title="Aktivasi & Pilih Rombel"
                description={selectedStudent ? `Pilih rombel untuk ${selectedStudent.nama_lengkap}. Sistem akan mengecek ketersediaan kursi secara otomatis.` : ''}
                icon={<AcademicCapIcon className="w-5 h-5" />}
                maxWidth="xl"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="activate-form" 
                            loading={activateForm.processing} 
                            disabled={!activateForm.data.school_class_id}
                            className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200"
                        >
                            Aktivasi Siswa
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => setIsActivateModalOpen(false)} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Batal
                        </Button>
                    </>
                }
            >
                <form id="activate-form" onSubmit={submitActivate} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {classes.map(cls => {
                            const percentage = Math.min(100, Math.round((cls.students_count / cls.capacity) * 100));
                            const isFull = cls.students_count >= cls.capacity;
                            const isSelected = activateForm.data.school_class_id == cls.id;

                            return (
                                <div 
                                    key={cls.id}
                                    onClick={() => !isFull && activateForm.setData('school_class_id', cls.id)}
                                    className={clsx(
                                        "p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden",
                                        isFull ? "opacity-50 border-gray-100 bg-gray-50 cursor-not-allowed" :
                                        isSelected ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100" :
                                        "border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className={clsx(
                                            "text-lg font-black tracking-tight",
                                            isSelected ? "text-emerald-700" : "text-gray-800"
                                        )}>{cls.name} <span className="text-xs text-gray-400 font-bold ml-2">Level: {cls.level}</span></h3>
                                        
                                        <span className={clsx(
                                            "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                            isFull ? "bg-rose-100 text-rose-600" : 
                                            isSelected ? "bg-emerald-200 text-emerald-800" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {isFull ? 'Penuh' : `Sisa ${cls.remaining_capacity} Kursi`}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className={clsx(
                                                "h-1.5 rounded-full transition-all duration-1000",
                                                isFull ? "bg-rose-500" : percentage >= 80 ? "bg-amber-400" : "bg-emerald-500"
                                            )} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })}
                        {activateForm.errors.school_class_id && (
                            <p className="text-xs font-black text-rose-500 mt-1 uppercase tracking-widest">
                                {activateForm.errors.school_class_id}
                            </p>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Modal Daftar Tagihan Unpaid */}
            <Modal
                show={isInvoiceListModalOpen}
                onClose={() => setIsInvoiceListModalOpen(false)}
                title="Daftar Tagihan Calon Siswa"
                description={selectedStudent ? `Berikut adalah daftar kewajiban pembayaran untuk ${selectedStudent.nama_lengkap}.` : ''}
                icon={<DocumentTextIcon className="w-6 h-6" />}
                maxWidth="2xl"
            >
                <div className="space-y-4 py-4">
                    {selectedStudent?.invoices?.filter(inv => inv.status !== 'paid').map(inv => (
                        <div key={inv.id} className="bg-white border-2 border-gray-50 rounded-[2rem] p-6 hover:border-indigo-100 transition-all group flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{inv.tariff?.nama_tarif || 'Biaya Sekolah'}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Jatuh Tempo: {inv.jatuh_tempo || '-'}</p>
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SISA TAGIHAN</p>
                                    <p className="text-lg font-black text-indigo-600 tracking-tight">{formatRupiah(inv.nominal_tagihan - inv.nominal_terbayar)}</p>
                                </div>
                                <Button
                                    onClick={() => openPaymentEntry(inv)}
                                    className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100"
                                    icon={<BanknotesIcon className="w-4 h-4" />}
                                >
                                    Bayar
                                </Button>
                            </div>
                        </div>
                    ))}
                    {selectedStudent?.invoices?.filter(inv => inv.status !== 'paid').length === 0 && (
                        <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">Semua tagihan sudah lunas.</p>
                    )}
                </div>
            </Modal>

            {/* Modal Input Pembayaran (Entry) */}
            <Modal
                show={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Input Pembayaran"
                description="Mencatat transaksi masuk untuk calon siswa."
                icon={<BanknotesIcon className="w-6 h-6" />}
                maxWidth="2xl"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="payment-form" 
                            loading={paymentForm.processing} 
                            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200"
                        >
                            Konfirmasi Bayar
                        </Button>
                        <Button 
                            type="button" 
                            onClick={() => setIsPaymentModalOpen(false)} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Batal
                        </Button>
                    </>
                }
            >
                {selectedInvoice && (
                    <form id="payment-form" onSubmit={submitPayment} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tagihan</p>
                                    <p className="text-sm font-black text-gray-900 uppercase">{selectedInvoice.tariff?.nama_tarif}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sisa</p>
                                    <p className="text-base font-black text-indigo-600 tracking-tight">{formatRupiah(selectedInvoice.nominal_tagihan - selectedInvoice.nominal_terbayar)}</p>
                                </div>
                            </div>

                            <div className={clsx(
                                "flex flex-col gap-2",
                                paymentForm.data.jenis_transaksi === 'tunai' ? "col-span-2" : "col-span-1"
                            )}>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Metode Transaksi</label>
                                <PremiumSelect
                                    value={paymentForm.data.jenis_transaksi}
                                    onChange={e => {
                                        const val = e.target.value;
                                        paymentForm.setData('jenis_transaksi', val);
                                        if (val === 'tunai') paymentForm.setData('account_id', '');
                                    }}
                                    options={[
                                        { value: 'tunai', label: 'Tunai' },
                                        { value: 'transfer', label: 'Transfer' },
                                    ]}
                                />
                            </div>

                            {paymentForm.data.jenis_transaksi === 'transfer' && (
                                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-right-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rekening Tujuan</label>
                                    <PremiumSelect
                                        value={paymentForm.data.account_id}
                                        onChange={e => paymentForm.setData('account_id', e.target.value)}
                                        error={paymentForm.errors.account_id}
                                        options={[
                                            { value: '', label: '-- Pilih Rekening --' },
                                            ...accounts.map(acc => ({ value: acc.id, label: `${acc.bank} - ${acc.nama_rekening}` }))
                                        ]}
                                    />
                                </div>
                            )}

                            <div className="col-span-2">
                                <InputField
                                    label="Nominal Bayar"
                                    type="number"
                                    value={paymentForm.data.total_bayar}
                                    onChange={e => paymentForm.setData('total_bayar', e.target.value)}
                                    error={paymentForm.errors.total_bayar}
                                    required
                                />
                            </div>

                            <div className="col-span-2">
                                <TextareaField
                                    label="Catatan"
                                    value={paymentForm.data.catatan}
                                    onChange={e => paymentForm.setData('catatan', e.target.value)}
                                    placeholder="Opsional..."
                                />
                            </div>

                            <div className="col-span-2">
                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center hover:border-indigo-300 transition-all">
                                    <label className="cursor-pointer">
                                        <DocumentArrowUpIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Unggah Bukti Bayar (Opsional)</p>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={e => paymentForm.setData('bukti_bayar', e.target.files[0])}
                                        />
                                    </label>
                                    {paymentForm.data.bukti_bayar && (
                                        <p className="mt-2 text-[10px] font-black text-emerald-600 uppercase">{paymentForm.data.bukti_bayar.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </Modal>

        </AppLayout>
    );
}
