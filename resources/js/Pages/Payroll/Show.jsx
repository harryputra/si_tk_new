import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputField from '@/Components/InputField';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import {
    ArrowUpCircleIcon,
    ArrowDownCircleIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    PrinterIcon,
    ClockIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    BanknotesIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(n) || 0);

export default function Show({ payroll, components = [] }) {
    const isLocked = payroll.status_approval !== 'draft';

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [removeItem, setRemoveItem] = useState(null);

    const addForm = useForm({
        description: '',
        kind: 'earning',
        amount: '',
        payroll_component_id: '',
        reason: '',
        notes: '',
    });

    const editForm = useForm({ amount: '', reason: '' });
    const removeForm = useForm({ reason: '' });

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(`/penggajian/${payroll.id}/items`, {
            onSuccess: () => { setIsAddOpen(false); addForm.reset(); },
        });
    };

    const openEdit = (item) => {
        setEditItem(item);
        editForm.setData({ amount: item.amount, reason: '' });
    };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.put(`/penggajian/${payroll.id}/items/${editItem.id}`, {
            onSuccess: () => { setEditItem(null); editForm.reset(); },
        });
    };

    const openRemove = (item) => {
        setRemoveItem(item);
        removeForm.setData('reason', '');
    };
    const submitRemove = (e) => {
        e.preventDefault();
        removeForm.delete(`/penggajian/${payroll.id}/items/${removeItem.id}`, {
            onSuccess: () => { setRemoveItem(null); removeForm.reset(); },
        });
    };

    const onComponentChange = (id) => {
        addForm.setData('payroll_component_id', id);
        const c = components.find(x => String(x.id) === String(id));
        if (c) {
            addForm.setData('description', c.name);
            addForm.setData('kind', c.kind);
            if (c.default_nominal && !addForm.data.amount) {
                addForm.setData('amount', c.default_nominal);
            }
        }
    };

    const earnings = (payroll.items || []).filter(i => i.kind === 'earning');
    const deductions = (payroll.items || []).filter(i => i.kind === 'deduction');
    const sumEarning = earnings.reduce((s, i) => s + Number(i.amount || 0), 0);
    const sumDeduction = deductions.reduce((s, i) => s + Number(i.amount || 0), 0);

    return (
        <AppLayout title="Detail Payroll">
            <Head title={`Payroll #${payroll.id} — ${payroll.teacher?.nama_lengkap}`} />

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link href="/penggajian" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-700 mb-2 inline-block">
                        ← Kembali ke Daftar Payroll
                    </Link>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{payroll.teacher?.nama_lengkap}</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Periode {new Date(payroll.periode).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} · NIP {payroll.teacher?.nip}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={clsx(
                        'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest',
                        payroll.status_approval === 'paid' && 'bg-indigo-100 text-indigo-700',
                        payroll.status_approval === 'approved' && 'bg-emerald-100 text-emerald-700',
                        payroll.status_approval === 'draft' && 'bg-amber-100 text-amber-700'
                    )}>
                        {payroll.status_approval}
                    </span>
                    <a href={`/penggajian/${payroll.id}/slip`} target="_blank" rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100">
                        <PrinterIcon className="w-4 h-4" /> Slip Gaji PDF
                    </a>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hadir</p>
                    <p className="text-2xl font-black text-gray-900">{payroll.jumlah_hadir}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alfa</p>
                    <p className="text-2xl font-black text-rose-600">{payroll.jumlah_alfa}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pendapatan</p>
                    <p className="text-2xl font-black text-emerald-600">{formatCurrency(sumEarning)}</p>
                </div>
                <div className="bg-gray-900 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Take Home Pay</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(payroll.total_take_home_pay)}</p>
                </div>
            </div>

            {isLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8">
                    <p className="text-xs font-bold text-amber-800">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Payroll ini sudah <strong>{payroll.status_approval}</strong>. Item & nominal tidak bisa diubah lagi (audit lock).
                    </p>
                </div>
            )}

            {/* Items breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Earnings */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowUpCircleIcon className="w-5 h-5 text-emerald-700" />
                            <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Pendapatan</h3>
                        </div>
                        <span className="text-sm font-black text-emerald-700">{formatCurrency(sumEarning)}</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {earnings.length === 0 && <div className="p-6 text-center text-xs text-gray-400 font-bold">Belum ada item.</div>}
                        {earnings.map(item => (
                            <ItemRow key={item.id} item={item} isLocked={isLocked} onEdit={openEdit} onRemove={openRemove} />
                        ))}
                    </div>
                </div>

                {/* Deductions */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowDownCircleIcon className="w-5 h-5 text-rose-700" />
                            <h3 className="text-sm font-black text-rose-900 uppercase tracking-widest">Potongan</h3>
                        </div>
                        <span className="text-sm font-black text-rose-700">{formatCurrency(sumDeduction)}</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {deductions.length === 0 && <div className="p-6 text-center text-xs text-gray-400 font-bold">Belum ada potongan.</div>}
                        {deductions.map(item => (
                            <ItemRow key={item.id} item={item} isLocked={isLocked} onEdit={openEdit} onRemove={openRemove} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            {!isLocked && (
                <div className="flex flex-wrap items-center gap-3 mb-10">
                    <Button onClick={() => setIsAddOpen(true)}
                        icon={<PlusIcon className="w-5 h-5" />}
                        className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200">
                        Tambah Item Manual
                    </Button>
                    <button
                        onClick={() => confirm('Setujui draft payroll ini?') && router.post(`/penggajian/${payroll.id}/approve`)}
                        className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-emerald-200"
                    >
                        <CheckCircleIcon className="w-5 h-5" /> Approve
                    </button>
                </div>
            )}
            {payroll.status_approval === 'approved' && (
                <div className="mb-10">
                    <button
                        onClick={() => confirm('Konfirmasi pembayaran gaji?') && router.post(`/penggajian/${payroll.id}/pay`)}
                        className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-indigo-200"
                    >
                        <BanknotesIcon className="w-5 h-5" /> Bayar Gaji
                    </button>
                </div>
            )}

            {/* Adjustment audit log */}
            {payroll.adjustments && payroll.adjustments.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-10">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                            <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                            Riwayat Penyesuaian (Audit Trail)
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {payroll.adjustments.map(adj => (
                            <div key={adj.id} className="px-6 py-4 flex items-start gap-4">
                                <div className={clsx(
                                    'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0',
                                    adj.action === 'added' && 'bg-emerald-50 text-emerald-700',
                                    adj.action === 'edited' && 'bg-amber-50 text-amber-700',
                                    adj.action === 'removed' && 'bg-rose-50 text-rose-700'
                                )}>
                                    {adj.action}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {adj.action === 'edited' && (
                                        <p className="text-xs font-bold text-gray-700">
                                            {adj.field_changed}: {adj.old_value} → {adj.new_value}
                                        </p>
                                    )}
                                    {adj.action === 'removed' && <p className="text-xs font-bold text-gray-700">Dihapus: {adj.old_value}</p>}
                                    {adj.action === 'added' && <p className="text-xs font-bold text-gray-700">Item baru ditambahkan ({formatCurrency(adj.new_value)})</p>}
                                    <p className="text-sm text-gray-900 mt-1 italic">"{adj.reason}"</p>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1">
                                        {adj.changed_by?.name || '—'} · {new Date(adj.created_at).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ADD ITEM MODAL */}
            <Modal show={isAddOpen} onClose={() => setIsAddOpen(false)} title="Tambah Item Manual" maxWidth="2xl"
                description="Tambah komponen di luar engine generate. Wajib isi alasan untuk audit."
                icon={<PlusIcon className="w-5 h-5" />}
                footer={
                    <>
                        <Button type="submit" form="add-item-form" loading={addForm.processing}
                            className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200">
                            Simpan
                        </Button>
                        <Button type="button" onClick={() => setIsAddOpen(false)} variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                            Batal
                        </Button>
                    </>
                }>
                <form id="add-item-form" onSubmit={submitAdd} className="space-y-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Komponen (opsional, untuk auto-fill)</label>
                        <PremiumSelect
                            value={addForm.data.payroll_component_id}
                            onChange={(e) => onComponentChange(e.target.value)}
                            options={[
                                { value: '', label: '-- TANPA KOMPONEN (TIPING MANUAL) --' },
                                ...components.map(c => ({ value: String(c.id), label: `${c.name} (${c.kind === 'earning' ? '+' : '−'})` })),
                            ]}
                        />
                    </div>
                    <InputField
                        label="Deskripsi"
                        name="description"
                        required
                        value={addForm.data.description}
                        onChange={(e) => addForm.setData('description', e.target.value)}
                        error={addForm.errors.description}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis</label>
                            <PremiumSelect
                                value={addForm.data.kind}
                                onChange={(e) => addForm.setData('kind', e.target.value)}
                                options={[
                                    { value: 'earning', label: 'PENDAPATAN' },
                                    { value: 'deduction', label: 'POTONGAN' },
                                ]}
                            />
                        </div>
                        <InputField
                            label="Nominal"
                            name="amount"
                            type="number"
                            required
                            value={addForm.data.amount}
                            onChange={(e) => addForm.setData('amount', e.target.value)}
                            error={addForm.errors.amount}
                            prefix="Rp"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alasan (wajib — audit trail)</label>
                        <textarea
                            value={addForm.data.reason}
                            onChange={(e) => addForm.setData('reason', e.target.value)}
                            rows={2}
                            required
                            className="w-full rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm py-3 px-4"
                            placeholder='mis. "Tunjangan Project Outing — instruksi kepsek 5 Mei"'
                        />
                        {addForm.errors.reason && <p className="text-xs font-bold text-rose-600 ml-1">{addForm.errors.reason}</p>}
                    </div>
                </form>
            </Modal>

            {/* EDIT ITEM MODAL */}
            <Modal show={!!editItem} onClose={() => setEditItem(null)} title={`Edit ${editItem?.description || ''}`} maxWidth="lg"
                description="Override nominal item. Wajib isi alasan untuk audit."
                icon={<PencilSquareIcon className="w-5 h-5" />}
                footer={
                    <>
                        <Button type="submit" form="edit-item-form" loading={editForm.processing}
                            className="px-10 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-200">
                            Update
                        </Button>
                        <Button type="button" onClick={() => setEditItem(null)} variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                            Batal
                        </Button>
                    </>
                }>
                <form id="edit-item-form" onSubmit={submitEdit} className="space-y-4">
                    <p className="text-xs font-bold text-gray-500">
                        Nominal saat ini: <strong>{formatCurrency(editItem?.amount)}</strong>
                    </p>
                    <InputField
                        label="Nominal Baru"
                        name="amount"
                        type="number"
                        required
                        value={editForm.data.amount}
                        onChange={(e) => editForm.setData('amount', e.target.value)}
                        error={editForm.errors.amount}
                        prefix="Rp"
                    />
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alasan</label>
                        <textarea
                            value={editForm.data.reason}
                            onChange={(e) => editForm.setData('reason', e.target.value)}
                            rows={2}
                            required
                            className="w-full rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500 text-sm py-3 px-4"
                            placeholder='mis. "Koreksi: ketinggalan absensi 2 hari"'
                        />
                        {editForm.errors.reason && <p className="text-xs font-bold text-rose-600 ml-1">{editForm.errors.reason}</p>}
                    </div>
                </form>
            </Modal>

            {/* REMOVE ITEM MODAL */}
            <Modal show={!!removeItem} onClose={() => setRemoveItem(null)} title="Hapus Item" maxWidth="md"
                description="Wajib isi alasan untuk audit."
                icon={<TrashIcon className="w-5 h-5" />}
                footer={
                    <>
                        <Button type="submit" form="remove-item-form" loading={removeForm.processing}
                            className="px-10 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-rose-200">
                            Hapus
                        </Button>
                        <Button type="button" onClick={() => setRemoveItem(null)} variant="secondary"
                            className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">
                            Batal
                        </Button>
                    </>
                }>
                <form id="remove-item-form" onSubmit={submitRemove} className="space-y-4">
                    <p className="text-sm text-gray-700">
                        Akan menghapus: <strong>{removeItem?.description}</strong> ({formatCurrency(removeItem?.amount)})
                    </p>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alasan</label>
                        <textarea
                            value={removeForm.data.reason}
                            onChange={(e) => removeForm.setData('reason', e.target.value)}
                            rows={2}
                            required
                            className="w-full rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500 text-sm py-3 px-4"
                            placeholder='mis. "Item duplikat dari engine"'
                        />
                        {removeForm.errors.reason && <p className="text-xs font-bold text-rose-600 ml-1">{removeForm.errors.reason}</p>}
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}

function ItemRow({ item, isLocked, onEdit, onRemove }) {
    return (
        <div className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-gray-900">{item.description}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {item.formula === 'flat'
                        ? 'FLAT'
                        : `${item.unit_count} × ${formatCurrency(item.unit_nominal)}`}
                    {item.is_manual && <span className="ml-2 text-amber-600">[MANUAL]</span>}
                    {item.sk_number_snapshot && <span className="ml-2 text-indigo-600">SK: {item.sk_number_snapshot}</span>}
                </p>
            </div>
            <p className={clsx('text-sm font-black tabular-nums', item.kind === 'earning' ? 'text-emerald-700' : 'text-rose-700')}>
                {item.kind === 'earning' ? '+' : '−'}{formatCurrency(item.amount)}
            </p>
            {!isLocked && (
                <div className="flex gap-1">
                    <button onClick={() => onEdit(item)} className="w-9 h-9 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50">
                        <PencilSquareIcon className="w-4 h-4 mx-auto" />
                    </button>
                    <button onClick={() => onRemove(item)} className="w-9 h-9 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50">
                        <TrashIcon className="w-4 h-4 mx-auto" />
                    </button>
                </div>
            )}
        </div>
    );
}
