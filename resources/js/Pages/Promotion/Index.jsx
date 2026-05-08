import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import {
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BoltIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
}).format(Number(amount) || 0);

export default function Index({
    classes = [],
    levels = [],
    academic_years = [],
    filters = {},
    students = [],
}) {
    const [fromClassId, setFromClassId] = useState(filters.from_class_id || '');
    const [targetLevel, setTargetLevel] = useState(filters.target_level || '');
    const [targetYearId, setTargetYearId] = useState(filters.target_academic_year_id || '');

    // Per-student decision: 'promote' | 'retain'. Default semua promote.
    const [actions, setActions] = useState({});
    // Set siswa yang dicentang untuk diproses.
    const [selected, setSelected] = useState(new Set());
    const [autoIssue, setAutoIssue] = useState(true);
    const [periode, setPeriode] = useState(() => {
        const t = new Date();
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
    });
    const [submitting, setSubmitting] = useState(false);

    // Re-init actions/selection setiap students prop berubah (load ulang)
    useEffect(() => {
        const clearedIds = students.filter(s => s.is_clear).map(s => s.id);
        setSelected(new Set(clearedIds));
        setActions(Object.fromEntries(clearedIds.map(id => [id, 'promote'])));
    }, [students]);

    const totals = useMemo(() => {
        const totalDebt = students.reduce((sum, s) => sum + Number(s.total_tunggakan || 0), 0);
        const cleared = students.filter(s => s.is_clear).length;
        const blocked = students.length - cleared;
        return { totalDebt, cleared, blocked };
    }, [students]);

    const loadStudents = () => {
        if (!fromClassId) return;
        router.get('/kenaikan-kelas', {
            from_class_id: fromClassId,
            target_level: targetLevel,
            target_academic_year_id: targetYearId,
        }, { preserveState: false });
    };

    const toggleAll = (checked) => {
        if (checked) {
            setSelected(new Set(students.filter(s => s.is_clear).map(s => s.id)));
        } else {
            setSelected(new Set());
        }
    };

    const toggleOne = (id, checked) => {
        const next = new Set(selected);
        if (checked) next.add(id); else next.delete(id);
        setSelected(next);
    };

    const setAction = (id, action) => {
        setActions(prev => ({ ...prev, [id]: action }));
    };

    const canExecute = fromClassId && targetLevel && targetYearId && selected.size > 0;

    const handleExecute = () => {
        if (!canExecute) return;
        if (!/^\d{4}-\d{2}$/.test(periode)) {
            alert('Format periode invoice harus YYYY-MM (contoh: 2026-07)');
            return;
        }

        const promotions = [...selected].map(id => ({
            student_id: id,
            action: actions[id] || 'promote',
        }));

        const blockedSelected = students
            .filter(s => selected.has(s.id) && !s.is_clear)
            .length;

        const confirmMsg = blockedSelected > 0
            ? `${blockedSelected} dari ${selected.size} siswa terpilih MASIH PUNYA TUNGGAKAN.\n\nLanjutkan kenaikan kelas? (Tunggakan tidak akan terhapus, tetap menempel ke siswa.)`
            : `Eksekusi kenaikan kelas untuk ${selected.size} siswa?`;

        if (!confirm(confirmMsg)) return;

        setSubmitting(true);
        router.post('/kenaikan-kelas/execute', {
            target_level: targetLevel,
            target_academic_year_id: targetYearId,
            promotions,
        }, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AppLayout title="Kenaikan Kelas">
            <Head title="Kenaikan Kelas — SI ERP TK Attauhid" />

            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Kenaikan Kelas</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Promotion Workflow + Clearance Check
                    </p>
                </div>
            </div>

            {/* Setup form */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-10">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-6">
                    Konfigurasi Promosi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Kelas Asal
                        </label>
                        <PremiumSelect
                            value={fromClassId}
                            onChange={(e) => setFromClassId(e.target.value)}
                            options={[
                                { value: '', label: '-- PILIH KELAS ASAL --' },
                                ...classes.map(c => ({
                                    value: String(c.id),
                                    label: `${(c.name || '').toUpperCase()} — ${(c.level || '').toUpperCase()}`,
                                })),
                            ]}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Ke Tingkat Tujuan
                        </label>
                        <PremiumSelect
                            value={targetLevel}
                            onChange={(e) => setTargetLevel(e.target.value)}
                            options={[
                                { value: '', label: '-- PILIH TINGKAT TUJUAN --' },
                                ...levels.map(l => ({
                                    value: String(l),
                                    label: `TINGKAT ${String(l).toUpperCase()}`,
                                })),
                            ]}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            Tahun Ajaran Tujuan
                        </label>
                        <PremiumSelect
                            value={targetYearId}
                            onChange={(e) => setTargetYearId(e.target.value)}
                            options={[
                                { value: '', label: '-- PILIH TAHUN AJARAN --' },
                                ...academic_years.map(ay => ({
                                    value: String(ay.id),
                                    label: `${ay.name}${ay.is_active ? ' (AKTIF)' : ''}`,
                                })),
                            ]}
                        />
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Button
                        onClick={loadStudents}
                        disabled={!fromClassId}
                        className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200"
                    >
                        Cek Siswa & Tunggakan
                    </Button>
                </div>
            </div>

            {/* Clearance summary */}
            {students.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Siswa di Kelas</p>
                        <p className="text-2xl font-black text-blue-700 tracking-tight">{students.length}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-5">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Lunas (Siap Naik)</p>
                        <p className="text-2xl font-black text-emerald-700 tracking-tight">{totals.cleared}</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl px-6 py-5">
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">
                            Bertunggakan ({totals.blocked} siswa)
                        </p>
                        <p className="text-2xl font-black text-rose-700 tracking-tight">{formatCurrency(totals.totalDebt)}</p>
                    </div>
                </div>
            )}

            {/* Students table */}
            {students.length > 0 ? (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-5 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selected.size === students.filter(s => s.is_clear).length && students.filter(s => s.is_clear).length > 0}
                                            onChange={(e) => toggleAll(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Siswa</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Status Piutang</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Tunggakan</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => {
                                    const isSelected = selected.has(s.id);
                                    const action = actions[s.id] || 'promote';
                                    return (
                                        <tr key={s.id} className={clsx(
                                            'border-b border-gray-100 transition-colors',
                                            isSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                                        )}>
                                            <td className="px-6 py-5">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => toggleOne(s.id, e.target.checked)}
                                                    disabled={!s.is_clear}
                                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-gray-900 tracking-tight">{s.nama_lengkap}</p>
                                                <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">NIS: {s.nis}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                {s.is_clear ? (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        <CheckCircleIcon className="w-4 h-4" /> Lunas
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                                        {s.unpaid_count} Tagihan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <p className={clsx(
                                                    'text-sm font-black tracking-tight',
                                                    s.is_clear ? 'text-gray-300' : 'text-rose-600'
                                                )}>
                                                    {formatCurrency(s.total_tunggakan)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                {!s.is_clear ? (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-80 cursor-not-allowed">
                                                        <ExclamationTriangleIcon className="w-4 h-4" /> Lunasi Dulu
                                                    </span>
                                                ) : (
                                                    <div className="flex gap-3">
                                                        <label className="inline-flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`action_${s.id}`}
                                                                checked={action === 'promote'}
                                                                onChange={() => setAction(s.id, 'promote')}
                                                                disabled={!isSelected}
                                                                className="text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className={clsx(
                                                                'text-[10px] font-black uppercase tracking-widest',
                                                                action === 'promote' && isSelected ? 'text-blue-700' : 'text-gray-400'
                                                            )}>NAIK</span>
                                                        </label>
                                                        <label className="inline-flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`action_${s.id}`}
                                                                checked={action === 'retain'}
                                                                onChange={() => setAction(s.id, 'retain')}
                                                                disabled={!isSelected}
                                                                className="text-amber-600 focus:ring-amber-500"
                                                            />
                                                            <span className={clsx(
                                                                'text-[10px] font-black uppercase tracking-widest',
                                                                action === 'retain' && isSelected ? 'text-amber-700' : 'text-gray-400'
                                                            )}>TINGGAL</span>
                                                        </label>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer with execution */}
                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                <label className="inline-flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoIssue}
                                        onChange={(e) => setAutoIssue(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="inline-flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">
                                        <BoltIcon className="w-4 h-4 text-emerald-600" />
                                        Auto-terbitkan Invoice Tarif Kelas Tujuan
                                    </span>
                                </label>
                                {autoIssue && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Periode:</span>
                                        <input
                                            type="month"
                                            value={periode}
                                            onChange={(e) => setPeriode(e.target.value)}
                                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                        />
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={handleExecute}
                                disabled={!canExecute || submitting}
                                loading={submitting}
                                icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
                                className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-200"
                            >
                                Eksekusi Kenaikan Kelas ({selected.size})
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                fromClassId && (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-12 text-center">
                        <p className="text-sm text-gray-400 font-black uppercase tracking-[0.2em]">
                            Tidak ada siswa aktif di kelas asal yang dipilih.
                        </p>
                    </div>
                )
            )}
        </AppLayout>
    );
}
