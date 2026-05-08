import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import {
    CalculatorIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
    BanknotesIcon,
    TagIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Index({ tariffs = [], academic_years = [], classes = [], levels = [], rkas_accounts_pendapatan = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    // Issue Invoice Modal State
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [selectedTariffForIssue, setSelectedTariffForIssue] = useState(null);
    const [issuePeriode, setIssuePeriode] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nama_tarif: '',
        jenis_tarif: 'spp',
        jenis_siswa: 'all',
        nominal: 0,
        tahun_berlaku: new Date().getFullYear(),
        billing_cycle: 'monthly',
        applicability: 'all',
        academic_year_id: '',
        applicable_id: '',
        applicable_level: '',
        rkas_account_id: '',
    });

    const handleEdit = useCallback((tariff) => {
        setEditData(tariff);
        setData({
            nama_tarif: tariff.nama_tarif,
            jenis_tarif: tariff.jenis_tarif,
            jenis_siswa: tariff.jenis_siswa,
            nominal: tariff.nominal,
            tahun_berlaku: tariff.tahun_berlaku,
            billing_cycle: tariff.billing_cycle || 'monthly',
            applicability: tariff.applicability || 'all',
            academic_year_id: tariff.academic_year_id || '',
            applicable_id: tariff.applicable_id || '',
            applicable_level: tariff.applicable_level || '',
            rkas_account_id: tariff.rkas_account_id || '',
        });
        setIsModalOpen(true);
    }, [setData]);

    const handleDelete = useCallback((id) => {
        if (confirm('Yakin ingin menghapus tarif ini?')) {
            router.delete(`/tarif/${id}`);
        }
    }, []);

    const handleIssueInvoices = useCallback((tariff) => {
        const today = new Date();
        const defaultPeriode = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        setSelectedTariffForIssue(tariff);
        setIssuePeriode(defaultPeriode);
        setIsIssueModalOpen(true);
    }, []);

    const submitIssueInvoices = (e) => {
        e.preventDefault();
        
        if (!/^\d{4}-\d{2}$/.test(issuePeriode)) {
            alert('Format periode harus YYYY-MM (contoh: 2026-05)');
            return;
        }

        router.post(`/tarif/${selectedTariffForIssue.id}/issue-invoices`, {
            periode: `${issuePeriode}-01`,
        }, {
            preserveScroll: true,
            onSuccess: () => closeIssueModal(),
        });
    };

    const closeIssueModal = () => {
        setIsIssueModalOpen(false);
        setSelectedTariffForIssue(null);
        setIssuePeriode('');
    };

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(`/tarif/${editData.id}`, { onSuccess: () => closeModal() });
        } else {
            post('/tarif', { onSuccess: () => closeModal() });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    return (
        <AppLayout title="Master Tarif">
            <Head title="Manajemen Tarif — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Master Tarif Biaya</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Konfigurasi Biaya Pendidikan & SPP</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 shrink-0">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-0.5">KOMPONEN BIAYA AKTIF</p>
                        <p className="text-xl font-black text-amber-600 tracking-tight">{(tariffs?.length || 0)} Kategori</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-200 shrink-0"
                        icon={<PlusIcon className="w-5 h-5" />}
                    >
                        Tambah Tarif
                    </Button>
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
                                    {index + 1}
                                </span>
                            )
                        },
                        {
                            label: 'Detail Komponen',
                            render: (row) => (
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-amber-100 shrink-0 transform rotate-2">
                                        <TagIcon className="w-6 h-6 transform -rotate-2" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{row.nama_tarif || 'Tarif Baru'}</p>
                                        <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">{row.jenis_tarif?.toUpperCase()} · TAHUN {row.tahun_berlaku}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            label: 'Peruntukan',
                            render: (row) => {
                                const jenisLabel = row.jenis_siswa === 'all'
                                    ? 'SEMUA SISWA'
                                    : (row.jenis_siswa || '').toUpperCase().replace('_', ' ');
                                let targetLabel = 'BERLAKU UNTUK SEMUA';
                                if (row.applicability === 'level') {
                                    targetLabel = `TINGKAT: ${(row.applicable_level || '?').toUpperCase()}`;
                                } else if (row.applicability === 'class') {
                                    const cls = (classes || []).find(c => c.id == row.applicable_id);
                                    targetLabel = `ROMBEL: ${cls?.name || row.applicable_id || '?'}`;
                                } else if (row.applicability === 'student') {
                                    targetLabel = `SISWA #${row.applicable_id || '?'}`;
                                }
                                return (
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-800 leading-tight mb-1">{jenisLabel}</p>
                                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">{targetLabel}</p>
                                    </div>
                                );
                            }
                        },
                        {
                            label: 'Nominal Biaya',
                            render: (row) => (
                                <div className="min-w-0 text-right md:text-left">
                                    <p className="text-base font-black text-gray-900 tracking-tight leading-tight mb-1">{formatCurrency(row.nominal || 0)}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">FIXED AMOUNT</p>
                                </div>
                            )
                        }
                    ]}
                    data={tariffs || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <button
                                onClick={() => handleIssueInvoices(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 flex items-center justify-center transition-all group"
                                title="Terbitkan Invoice ke Siswa"
                            >
                                <BoltIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </button>
                            <button
                                onClick={() => handleEdit(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 flex items-center justify-center transition-all group"
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
                title={editData ? 'Edit Tarif Biaya' : 'Tambah Tarif Baru'}
                description={editData ? 'Perbarui informasi komponen biaya di bawah ini.' : 'Tetapkan tarif baru untuk komponen biaya pendidikan.'}
                icon={editData ? <PencilSquareIcon className="w-5 h-5" /> : <CalculatorIcon className="w-5 h-5" />}
                maxWidth="lg"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="tariff-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-200"
                        >
                            {editData ? 'Update Tarif' : 'Simpan Tarif Baru'}
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
                <form id="tariff-form" onSubmit={submit} className="space-y-6">
                    <InputField
                        label="Nama Tarif / Deskripsi"
                        name="nama_tarif"
                        required
                        value={data.nama_tarif}
                        onChange={e => setData('nama_tarif', e.target.value)}
                        error={errors.nama_tarif}
                        placeholder="Contoh: SPP Juli 2024"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori Biaya</label>
                            <PremiumSelect
                                value={data.jenis_tarif}
                                onChange={e => setData('jenis_tarif', e.target.value)}
                                options={[
                                    { value: 'spp', label: 'SPP' },
                                    { value: 'dsp', label: 'DSP (UANG PANGKAL)' },
                                    { value: 'kegiatan_tahunan', label: 'KEGIATAN TAHUNAN' },
                                    { value: 'seragam', label: 'SERAGAM' },
                                    { value: 'pendaftaran', label: 'PENDAFTARAN' },
                                    { value: 'snack', label: 'SNACK' },
                                ]}
                            />
                        </div>
                        <InputField
                            label="Tahun Berlaku"
                            name="tahun_berlaku"
                            type="number"
                            required
                            value={data.tahun_berlaku}
                            onChange={e => setData('tahun_berlaku', e.target.value)}
                            error={errors.tahun_berlaku}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Siklus Tagihan</label>
                            <PremiumSelect
                                value={data.billing_cycle}
                                onChange={e => setData('billing_cycle', e.target.value)}
                                options={[
                                    { value: 'monthly', label: 'BULANAN (SPP)' },
                                    { value: 'one_time', label: 'SEKALI BAYAR (DSP/MASUK)' },
                                    { value: 'annual', label: 'TAHUNAN (SERAGAM/BUKU)' },
                                    { value: 'situational', label: 'SITUASIONAL (EKSKUL/DLL)' },
                                ]}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tahun Ajaran</label>
                            <PremiumSelect
                                value={data.academic_year_id}
                                onChange={e => setData('academic_year_id', e.target.value)}
                                options={[
                                    { value: '', label: '-- BERLAKU UMUM --' },
                                    ...(academic_years || []).map(ay => ({ value: ay.id, label: ay.name }))
                                ]}
                            />
                        </div>
                    </div>

                    {/* C3: Link ke akun RKAS pendapatan */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Akun RKAS Pendapatan <span className="text-emerald-600">(opsional, untuk sinkronisasi realisasi)</span>
                        </label>
                        <PremiumSelect
                            value={data.rkas_account_id}
                            onChange={e => setData('rkas_account_id', e.target.value)}
                            options={[
                                { value: '', label: '-- TIDAK LINK KE COA --' },
                                ...(rkas_accounts_pendapatan || []).map(a => ({
                                    value: String(a.id),
                                    label: `${'  '.repeat(a.level || 0)}${a.kode} ${a.name}`,
                                })),
                            ]}
                        />
                        <p className="text-[10px] text-gray-400 font-bold ml-1">
                            Pembayaran tariff ini akan otomatis menambah realisasi pendapatan di RKAS-nya.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Peruntukan (Siswa Baru/Lama)</label>
                            <PremiumSelect
                                value={data.jenis_siswa}
                                onChange={e => setData('jenis_siswa', e.target.value)}
                                options={[
                                    { value: 'all', label: 'SEMUA SISWA' },
                                    { value: 'reguler', label: 'REGULER' },
                                    { value: 'reguler_opsi2', label: 'REGULER OPSI 2' },
                                    { value: 'fullday', label: 'FULL DAY' },
                                ]}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Penerima</label>
                            <PremiumSelect
                                value={data.applicability}
                                onChange={e => {
                                    const v = e.target.value;
                                    setData('applicability', v);
                                    // Reset field yang tidak relevan
                                    if (v === 'all') {
                                        setData('applicable_id', '');
                                        setData('applicable_level', '');
                                    } else if (v === 'level') {
                                        setData('applicable_id', '');
                                    } else {
                                        setData('applicable_level', '');
                                    }
                                }}
                                options={[
                                    { value: 'all', label: 'BERLAKU UNTUK SEMUA' },
                                    { value: 'level', label: 'TINGKAT TERTENTU (semua rombel)' },
                                    { value: 'class', label: 'ROMBEL TERTENTU SAJA' },
                                    { value: 'student', label: 'SISWA TERTENTU SAJA' },
                                ]}
                            />
                        </div>
                    </div>

                    {data.applicability === 'level' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Pilih Tingkat (akan inject ke SEMUA rombel di tingkat ini)
                            </label>
                            <PremiumSelect
                                value={data.applicable_level}
                                onChange={e => setData('applicable_level', e.target.value)}
                                options={[
                                    { value: '', label: '-- PILIH TINGKAT --' },
                                    ...(levels || []).map(l => ({ value: l, label: (l || '').toUpperCase() }))
                                ]}
                            />
                            {errors.applicable_level && (
                                <p className="text-xs font-bold text-rose-600 ml-1">{errors.applicable_level}</p>
                            )}
                        </div>
                    )}

                    {data.applicability === 'class' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Rombel</label>
                            <PremiumSelect
                                value={data.applicable_id}
                                onChange={e => setData('applicable_id', e.target.value)}
                                options={[
                                    { value: '', label: '-- PILIH ROMBEL --' },
                                    ...(classes || []).map(c => ({
                                        value: c.id,
                                        label: `${c.name} (${(c.level || '').toUpperCase()})`
                                    }))
                                ]}
                            />
                            {errors.applicable_id && (
                                <p className="text-xs font-bold text-rose-600 ml-1">{errors.applicable_id}</p>
                            )}
                        </div>
                    )}

                    <InputField
                        label="Nominal Tarif"
                        name="nominal"
                        type="number"
                        required
                        prefix="Rp"
                        value={data.nominal}
                        onChange={e => setData('nominal', e.target.value)}
                        error={errors.nominal}
                        inputClassName="text-xl font-black text-amber-600 tracking-tight"
                    />
                </form>
            </Modal>
            {/* Modal Terbitkan Invoice */}
            <Modal
                show={isIssueModalOpen}
                onClose={closeIssueModal}
                title="Terbitkan Invoice Massal"
                description={`Terbitkan invoice "${selectedTariffForIssue?.nama_tarif}" untuk siswa aktif yang sesuai dengan segment/kelas.`}
                icon={<BoltIcon className="w-5 h-5 text-emerald-600" />}
                maxWidth="md"
                footer={
                    <>
                        <Button 
                            type="submit" 
                            form="issue-invoice-form" 
                            loading={processing} 
                            className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200"
                        >
                            Terbitkan Sekarang
                        </Button>
                        <Button 
                            type="button" 
                            onClick={closeIssueModal} 
                            variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]"
                        >
                            Batalkan
                        </Button>
                    </>
                }
            >
                <form id="issue-invoice-form" onSubmit={submitIssueInvoices} className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <BanknotesIcon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black text-emerald-900 uppercase tracking-widest">Informasi Penagihan</p>
                        </div>
                        <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                            Sistem akan membuat invoice secara otomatis untuk semua siswa yang memenuhi kriteria tarif <span className="font-black">"{selectedTariffForIssue?.nama_tarif}"</span>.
                        </p>
                    </div>

                    <InputField
                        label="Periode Penagihan (YYYY-MM)"
                        name="periode"
                        required
                        value={issuePeriode}
                        onChange={e => setIssuePeriode(e.target.value)}
                        placeholder="Contoh: 2026-05"
                        autoFocus
                    />
                    
                    <p className="text-[10px] text-gray-400 font-bold italic">
                        * Pastikan periode sudah benar sebelum menerbitkan invoice.
                    </p>
                </form>
            </Modal>
        </AppLayout>
    );
}
