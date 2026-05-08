import React, { useState, useCallback, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import CurrencyInput from '@/Components/CurrencyInput';
import Button from '@/Components/Button';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    NoSymbolIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
}).format(Number(amount) || 0);

const formatDate = (s) => s ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const isActiveAssignment = (a) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = a.effective_from ? new Date(a.effective_from) : null;
    const until = a.effective_until ? new Date(a.effective_until) : null;
    if (from && from > today) return false;
    if (until && until < today) return false;
    return true;
};

export default function Index({
    assignments = { data: [], links: [] },
    teachers = [],
    components = [],
    filters = {},
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        teacher_id: '',
        payroll_component_id: '',
        nominal: '',
        effective_from: new Date().toISOString().slice(0, 10),
        effective_until: '',
        sk_number: '',
        sk_file: null,
        notes: '',
    });

    const handleFilter = (key, value) => {
        router.get('/penugasan-gaji', { ...filters, [key]: value, page: 1 }, { preserveState: true, preserveScroll: true });
    };

    const openCreate = useCallback(() => {
        setEditData(null);
        reset();
        setIsModalOpen(true);
    }, [reset]);

    const openEdit = useCallback((a) => {
        setEditData(a);
        setData({
            teacher_id: a.teacher_id,
            payroll_component_id: a.payroll_component_id,
            nominal: a.nominal,
            effective_from: a.effective_from?.slice(0, 10) || '',
            effective_until: a.effective_until?.slice(0, 10) || '',
            sk_number: a.sk_number || '',
            sk_file: null,
            notes: a.notes || '',
        });
        setIsModalOpen(true);
    }, [setData]);

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => closeModal();
        if (editData) {
            // Inertia: pakai POST + _method=put untuk multipart
            post(`/penugasan-gaji/${editData.id}?_method=put`, { onSuccess, forceFormData: true });
        } else {
            post('/penugasan-gaji', { onSuccess, forceFormData: true });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditData(null);
        reset();
        clearErrors();
    };

    const handleDelete = (a) => {
        if (confirm('Yakin hapus penugasan ini? Audit history akan ikut hilang.')) {
            router.delete(`/penugasan-gaji/${a.id}`);
        }
    };

    const handleEndNow = (a) => {
        if (confirm('Akhiri penugasan ini per hari ini? Row tetap tersimpan untuk audit.')) {
            router.post(`/penugasan-gaji/${a.id}/end-now`);
        }
    };

    // Auto-fill nominal dari default komponen saat dipilih
    const onComponentChange = (id) => {
        setData('payroll_component_id', id);
        const comp = components.find(c => String(c.id) === String(id));
        if (comp && comp.default_nominal && !data.nominal) {
            setData('nominal', comp.default_nominal);
        }
    };

    const componentsById = useMemo(() => {
        const m = {};
        components.forEach(c => { m[c.id] = c; });
        return m;
    }, [components]);

    return (
        <AppLayout title="Penugasan Komponen Gaji">
            <Head title="Penugasan Gaji per Guru — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Penugasan Komponen Gaji</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Assign Komponen ke Guru + Lampiran SK
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={openCreate}
                    icon={<PlusIcon className="w-5 h-5" />}
                    className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 shrink-0"
                >
                    Tambah Penugasan
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 mb-10">
                <div className="flex flex-wrap items-center gap-4">
                    <PremiumSelect
                        className="min-w-[280px]"
                        value={filters.teacher_id || ''}
                        onChange={(e) => handleFilter('teacher_id', e.target.value)}
                        options={[
                            { value: '', label: 'SEMUA GURU' },
                            ...teachers.map(t => ({ value: String(t.id), label: `${t.nama_lengkap} (${t.nip})` })),
                        ]}
                    />
                    <PremiumSelect
                        className="min-w-[260px]"
                        value={filters.component_id || ''}
                        onChange={(e) => handleFilter('component_id', e.target.value)}
                        options={[
                            { value: '', label: 'SEMUA KOMPONEN' },
                            ...components.map(c => ({ value: String(c.id), label: c.name })),
                        ]}
                    />
                    <PremiumSelect
                        className="min-w-[200px]"
                        value={filters.status || ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                        options={[
                            { value: '', label: 'SEMUA STATUS' },
                            { value: 'active', label: 'AKTIF' },
                            { value: 'expired', label: 'KADALUARSA' },
                            { value: 'future', label: 'AKAN DATANG' },
                        ]}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        {
                            label: 'Guru',
                            render: (row) => (
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-900 leading-tight">{row.teacher?.nama_lengkap || '—'}</p>
                                    <p className="text-[10px] text-gray-400 font-black tracking-[0.15em] uppercase">{row.teacher?.jabatan || ''}</p>
                                </div>
                            )
                        },
                        {
                            label: 'Komponen',
                            render: (row) => (
                                <div className="max-w-[200px] whitespace-normal">
                                    <p className="text-sm font-black text-gray-900 leading-tight">{row.component?.name || '—'}</p>
                                    <p className={clsx(
                                        'text-[10px] font-black uppercase tracking-widest mt-0.5',
                                        row.component?.kind === 'earning' ? 'text-emerald-600' : 'text-rose-600'
                                    )}>
                                        {row.component?.kind === 'earning' ? 'PENDAPATAN' : 'POTONGAN'}
                                        {' · '}{row.component?.formula?.replace(/_/g, ' ').toUpperCase()}
                                    </p>
                                </div>
                            )
                        },
                        {
                            label: 'Nominal',
                            render: (row) => (
                                <p className={clsx(
                                    'text-sm font-black tracking-tight',
                                    row.component?.kind === 'earning' ? 'text-emerald-700' : 'text-rose-700'
                                )}>
                                    {row.component?.kind === 'deduction' ? '−' : '+'}{formatCurrency(row.nominal)}
                                </p>
                            )
                        },
                        {
                            label: 'Periode Berlaku',
                            render: (row) => (
                                <div>
                                    <p className="text-xs font-black text-gray-700">{formatDate(row.effective_from)}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">s/d {row.effective_until ? formatDate(row.effective_until) : 'tanpa batas'}</p>
                                </div>
                            )
                        },
                        {
                            label: 'SK / Bukti',
                            render: (row) => (
                                <div>
                                    {row.sk_number && <p className="text-xs font-black text-gray-700">{row.sk_number}</p>}
                                    {row.sk_file ? (
                                        <a href={`/storage/${row.sk_file}`} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800">
                                            <DocumentTextIcon className="w-3.5 h-3.5" />
                                            Lihat SK
                                        </a>
                                    ) : (
                                        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">tanpa lampiran</p>
                                    )}
                                </div>
                            )
                        },
                        {
                            label: 'Status',
                            render: (row) => isActiveAssignment(row)
                                ? <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">AKTIF</span>
                                : <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">KADALUARSA</span>
                        }
                    ]}
                    data={assignments.data || []}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2 pr-2">
                            <button
                                onClick={() => openEdit(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 flex items-center justify-center transition-all"
                                title="Edit"
                            >
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            {isActiveAssignment(row) && (
                                <button
                                    onClick={() => handleEndNow(row)}
                                    className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200 flex items-center justify-center transition-all"
                                    title="Akhiri per hari ini"
                                >
                                    <NoSymbolIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(row)}
                                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all"
                                title="Hapus"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                />

                {/* Pagination */}
                {assignments.data?.length > 0 && (
                    <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em]">
                            {assignments.from || 0}—{assignments.to || 0} dari {assignments.total || 0}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(assignments.links || []).map((link, idx) => {
                                let label = link.label;
                                if (label.toLowerCase().includes('prev') || label.toLowerCase().includes('sebelum')) label = 'PREV';
                                else if (label.toLowerCase().includes('next') || label.toLowerCase().includes('berikut')) label = 'NEXT';
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={clsx(
                                            'min-w-[44px] h-11 px-4 inline-flex items-center justify-center text-[11px] font-black rounded-xl transition-all uppercase tracking-widest',
                                            link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50',
                                            !link.url && 'opacity-30 cursor-not-allowed'
                                        )}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Modal
                show={isModalOpen}
                onClose={closeModal}
                title={editData ? 'Edit Penugasan' : 'Tambah Penugasan'}
                description="Assign komponen gaji ke guru. Wajib upload SK kalau komponen-nya tunjangan jabatan."
                icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
                maxWidth="2xl"
                footer={
                    <>
                        <Button type="submit" form="assign-form" loading={processing}
                            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200">
                            {editData ? 'Update' : 'Simpan'}
                        </Button>
                        <Button type="button" onClick={closeModal} variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                            Batalkan
                        </Button>
                    </>
                }
            >
                <form id="assign-form" onSubmit={submit} className="space-y-5" encType="multipart/form-data">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Guru</label>
                            <PremiumSelect
                                value={data.teacher_id}
                                onChange={(e) => setData('teacher_id', e.target.value)}
                                options={[
                                    { value: '', label: '-- PILIH GURU --' },
                                    ...teachers.map(t => ({ value: String(t.id), label: `${t.nama_lengkap} (${t.nip})` })),
                                ]}
                            />
                            {errors.teacher_id && <p className="text-xs font-bold text-rose-600 ml-1">{errors.teacher_id}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Komponen</label>
                            <PremiumSelect
                                value={data.payroll_component_id}
                                onChange={(e) => onComponentChange(e.target.value)}
                                options={[
                                    { value: '', label: '-- PILIH KOMPONEN --' },
                                    ...components.map(c => ({
                                        value: String(c.id),
                                        label: `${c.name} (${c.kind === 'earning' ? '+' : '−'} ${c.formula.replace(/_/g, ' ')})`,
                                    })),
                                ]}
                            />
                            {errors.payroll_component_id && <p className="text-xs font-bold text-rose-600 ml-1">{errors.payroll_component_id}</p>}
                            {data.payroll_component_id && componentsById[data.payroll_component_id]?.formula !== 'flat' && (
                                <p className="text-[10px] text-amber-600 font-bold ml-1">
                                    Formula non-flat: nominal × jumlah hari (hadir/alfa) saat generate.
                                </p>
                            )}
                        </div>
                    </div>

                    <CurrencyInput
                        label="Nominal (per unit formula)"
                        name="nominal"
                        required
                        value={data.nominal}
                        onChange={(e) => setData('nominal', e.target.value)}
                        error={errors.nominal}
                        placeholder="0"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Berlaku Dari"
                            name="effective_from"
                            type="date"
                            required
                            value={data.effective_from}
                            onChange={(e) => setData('effective_from', e.target.value)}
                            error={errors.effective_from}
                        />
                        <InputField
                            label="Berlaku Sampai (opsional)"
                            name="effective_until"
                            type="date"
                            value={data.effective_until}
                            onChange={(e) => setData('effective_until', e.target.value)}
                            error={errors.effective_until}
                            hint="Kosongkan kalau tanpa batas"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                            label="Nomor SK / Surat Tugas"
                            name="sk_number"
                            value={data.sk_number}
                            onChange={(e) => setData('sk_number', e.target.value)}
                            error={errors.sk_number}
                            placeholder="mis. SK/2026/05/001"
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Lampiran SK (PDF/JPG, max 5MB)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setData('sk_file', e.target.files[0] || null)}
                                className="text-sm font-bold py-3 px-4 border border-gray-200 rounded-xl bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-indigo-100 file:text-indigo-700"
                            />
                            {editData?.sk_file && !data.sk_file && (
                                <p className="text-[10px] text-gray-500 font-bold ml-1">
                                    File saat ini: <a href={`/storage/${editData.sk_file}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">lihat</a>
                                </p>
                            )}
                            {errors.sk_file && <p className="text-xs font-bold text-rose-600 ml-1">{errors.sk_file}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catatan</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm py-3 px-4"
                            placeholder="Konteks tambahan untuk audit..."
                        />
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
