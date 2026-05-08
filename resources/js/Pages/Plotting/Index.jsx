import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import PremiumSelect from '@/Components/PremiumSelect';
import Button from '@/Components/Button';
import {
    ArrowsRightLeftIcon,
    UserGroupIcon,
    ChartPieIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Index({
    queues = [],
    classes = [],
    levels = [],
    academic_years = [],
    filters = {},
}) {
    const [selected, setSelected] = useState(new Set());
    const [targetClassId, setTargetClassId] = useState('');
    const [academicYearId, setAcademicYearId] = useState(filters.academic_year_id || '');
    const [targetLevel, setTargetLevel] = useState(filters.target_level || '');
    const [autoIssue, setAutoIssue] = useState(true);
    const [periode, setPeriode] = useState(() => {
        const t = new Date();
        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`;
    });
    const [submitting, setSubmitting] = useState(false);

    const filteredQueues = useMemo(() => {
        if (!targetLevel) return queues;
        return queues.filter(q => q.target_level === targetLevel);
    }, [queues, targetLevel]);

    const stats = useMemo(() => {
        const total = filteredQueues.length;
        const selectedCount = selected.size;
        return { total, selectedCount };
    }, [filteredQueues, selected]);

    const toggleAll = (checked) => {
        if (checked) {
            setSelected(new Set(filteredQueues.map(q => q.id)));
        } else {
            setSelected(new Set());
        }
    };

    const toggleOne = (id, checked) => {
        const next = new Set(selected);
        if (checked) next.add(id); else next.delete(id);
        setSelected(next);
    };

    const handleExecute = () => {
        if (selected.size === 0 || !targetClassId) {
            alert('Pilih siswa dan kelas tujuan terlebih dahulu.');
            return;
        }

        if (!confirm(`Tempatkan ${selected.size} siswa ke kelas terpilih?`)) return;

        setSubmitting(true);
        router.post(route('plotting.execute'), {
            target_class_id: targetClassId,
            target_academic_year_id: academicYearId,
            queue_ids: [...selected],
            auto_issue_invoices: autoIssue,
            invoice_periode: periode,
        }, {
            onFinish: () => {
                setSubmitting(false);
                setSelected(new Set());
            }
        });
    };

    return (
        <AppLayout title="Pemetaan Kelas">
            <Head title="Pemetaan Kelas (Plotting) — SI ERP TK Attauhid" />

            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Pemetaan Kelas</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                        Plotting Queue & Class Distribution
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <UserGroupIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Antrean Plotting</p>
                            <p className="text-2xl font-black text-gray-900">{stats.total} Siswa</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl">
                            <ChartPieIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Terpilih</p>
                            <p className="text-2xl font-black text-gray-900">{stats.selectedCount} Siswa</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sisa Kuota Kelas</p>
                            <p className="text-2xl font-black text-gray-900">
                                {targetClassId ? (classes.find(c => String(c.id) === targetClassId)?.capacity - (classes.find(c => String(c.id) === targetClassId)?.students_count || 0)) : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Action Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Filter */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ArrowsRightLeftIcon className="w-4 h-4 text-gray-400" />
                            Filter Antrean
                        </h3>
                        
                        <div className="space-y-4">
                            <PremiumSelect
                                label="Tahun Ajaran"
                                value={academicYearId}
                                onChange={(e) => {
                                    setAcademicYearId(e.target.value);
                                    router.get(route('plotting.index'), { academic_year_id: e.target.value, target_level: targetLevel }, { preserveState: true });
                                }}
                                options={academic_years.map(ay => ({ value: String(ay.id), label: ay.name }))}
                            />

                            <PremiumSelect
                                label="Tingkat (Target)"
                                value={targetLevel}
                                onChange={(e) => {
                                    setTargetLevel(e.target.value);
                                    router.get(route('plotting.index'), { academic_year_id: academicYearId, target_level: e.target.value }, { preserveState: true });
                                }}
                                options={[
                                    { value: '', label: 'SEMUA TINGKAT' },
                                    ...levels.map(l => ({ value: String(l), label: `TINGKAT ${String(l).toUpperCase()}` }))
                                ]}
                            />
                        </div>
                    </div>

                    <div className="bg-indigo-900 rounded-[2rem] shadow-xl p-8 text-white">
                        <h3 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60">
                            Eksekusi Pemetaan
                        </h3>
                        
                        <div className="space-y-6">
                            <PremiumSelect
                                label="Pindahkan ke Rombel"
                                value={targetClassId}
                                onChange={(e) => setTargetClassId(e.target.value)}
                                className="!bg-indigo-800 !border-indigo-700 !text-white"
                                options={[
                                    { value: '', label: '-- PILIH ROMBEL --' },
                                    ...classes.filter(c => !targetLevel || c.level === targetLevel).map(c => {
                                        const remaining = (c.capacity || 0) - (c.students_count || 0);
                                        return {
                                            value: String(c.id),
                                            label: `${c.name.toUpperCase()} (Sisa: ${remaining})`,
                                            disabled: remaining <= 0
                                        }
                                    })
                                ]}
                            />

                            <div className="pt-4 border-t border-indigo-800">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={autoIssue}
                                        onChange={e => setAutoIssue(e.target.checked)}
                                        className="w-5 h-5 rounded border-indigo-700 bg-indigo-800 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs font-bold opacity-80 group-hover:opacity-100 transition-opacity">Aktivasi Tagihan Rutin Otomatis</span>
                                </label>
                                
                                {autoIssue && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Mulai Periode</label>
                                        <input
                                            type="month"
                                            value={periode}
                                            onChange={e => setPeriode(e.target.value)}
                                            className="w-full mt-1 bg-indigo-800 border-indigo-700 rounded-xl text-sm font-bold focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleExecute}
                                disabled={submitting || selected.size === 0 || !targetClassId}
                                className="w-full !py-4 !rounded-2xl !bg-emerald-500 hover:!bg-emerald-600 !text-white !border-none shadow-lg shadow-emerald-900/20"
                            >
                                {submitting ? 'Memproses...' : `Simpan Pemetaan (${selected.size})`}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Queue List */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-left w-12">
                                        <input
                                            type="checkbox"
                                            checked={selected.size === filteredQueues.length && filteredQueues.length > 0}
                                            onChange={(e) => toggleAll(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Siswa</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Asal</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Target</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredQueues.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-50 rounded-full mb-4">
                                                    <ExclamationCircleIcon className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Antrean Kosong</p>
                                                <p className="text-gray-300 text-[10px] mt-1">Belum ada siswa yang menyelesaikan daftar ulang di tingkat ini.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredQueues.map((q) => (
                                        <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(q.id)}
                                                    onChange={(e) => toggleOne(q.id, e.target.checked)}
                                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {q.student?.name?.toUpperCase()}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 tracking-wider">
                                                    NIS: {q.student?.nis || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                                                    {q.student?.current_class?.name || 'BARU'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-widest">
                                                    Tingkat {q.target_level}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
