import React, { useState, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import {
    TrophyIcon, AdjustmentsHorizontalIcon, CheckBadgeIcon,
    ExclamationTriangleIcon, UserGroupIcon, CurrencyDollarIcon,
    DocumentCheckIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

const fmt = (v) => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(v || 0);

const JENIS_OPTIONS = [
    { value: 'subsidi_yayasan', label: 'Subsidi Yayasan', desc: 'Tagihan dianggap lunas karena dibayar oleh dana internal yayasan.', color: 'blue' },
    { value: 'pemutihan', label: 'Pemutihan', desc: 'Tagihan dihapus total karena alasan tertentu (yatim/piatu, ekonomi).', color: 'purple' },
    { value: 'diskon_kelulusan', label: 'Diskon Kelulusan', desc: 'Pemotongan sebagian tagihan sebagai kebijakan kelulusan.', color: 'amber' },
];

export default function Index({ students = [], classes = [], stats = {}, adjustments = [], selected_class_id }) {
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [isGradOpen, setIsGradOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    const adjustForm = useForm({ student_id:'', jenis_kebijakan:'subsidi_yayasan', keterangan:'', invoice_ids:[], nominal_diskon:0, class_id: selected_class_id || '' });
    const gradForm = useForm({ student_ids:[], class_id: selected_class_id || '' });

    const openAdjust = useCallback((student) => {
        setSelectedStudent(student);
        adjustForm.setData({
            student_id: student.id,
            jenis_kebijakan: 'subsidi_yayasan',
            keterangan: '',
            invoice_ids: student.invoices_belum_lunas.map(i => i.id),
            nominal_diskon: 0,
            class_id: selected_class_id || '',
        });
        setIsAdjustOpen(true);
    }, [selected_class_id]);

    const submitAdjust = (e) => {
        e.preventDefault();
        adjustForm.post('/kelulusan/adjustment', { onSuccess: () => { setIsAdjustOpen(false); setSelectedStudent(null); } });
    };

    const toggleStudent = (id) => {
        setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAllLunas = () => {
        const lunasIds = students.filter(s => s.is_lunas).map(s => s.id);
        setSelectedStudentIds(lunasIds);
    };

    const submitGraduate = (e) => {
        e.preventDefault();
        gradForm.setData('student_ids', selectedStudentIds);
        gradForm.transform(data => ({ ...data, student_ids: selectedStudentIds })).post('/kelulusan/graduate', {
            onSuccess: () => { setIsGradOpen(false); setSelectedStudentIds([]); }
        });
    };

    const lunasStudents = students.filter(s => s.is_lunas);

    return (
        <AppLayout title="Kelulusan Siswa">
            <Head title="Kelulusan Siswa — SI ERP TK Attauhid" />

            {/* Header */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Persiapan Kelulusan</h2>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Audit Tunggakan & Kebijakan Penyesuaian</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <select
                        value={selected_class_id || ''}
                        onChange={e => router.get('/kelulusan', { class_id: e.target.value || undefined }, { preserveState: true })}
                        className="rounded-2xl border-gray-200 text-sm font-bold py-3 px-5 focus:ring-violet-500 focus:border-violet-500"
                    >
                        <option value="">Semua Kelas</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <a href="/kelulusan/report" className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
                        <DocumentCheckIcon className="w-4 h-4" /> Laporan Kebijakan
                    </a>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard icon={UserGroupIcon} label="Total Siswa" value={stats.total_siswa} color="gray" />
                <StatCard icon={CheckBadgeIcon} label="Sudah Lunas" value={stats.siswa_lunas} color="emerald" />
                <StatCard icon={ExclamationTriangleIcon} label="Masih Tunggakan" value={stats.siswa_tunggakan} color="rose" />
                <StatCard icon={CurrencyDollarIcon} label="Total Tunggakan" value={fmt(stats.total_tunggakan)} color="amber" isText />
            </div>

            {/* Graduation Action Bar */}
            {lunasStudents.length > 0 && (
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-[2rem] p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-violet-200">
                    <div className="flex items-center gap-4 text-white">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                            <TrophyIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="font-black text-lg tracking-tight">{lunasStudents.length} Siswa Siap Diluluskan</p>
                            <p className="text-white/70 text-xs font-bold">Seluruh tagihan telah bersaldo Rp 0</p>
                        </div>
                    </div>
                    <button onClick={() => { selectAllLunas(); setIsGradOpen(true); }}
                        className="px-8 py-4 rounded-2xl bg-white text-violet-700 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-violet-50 transition-colors shadow-lg shrink-0">
                        <TrophyIcon className="w-4 h-4 inline mr-2 -mt-0.5" />Proses Luluskan Massal
                    </button>
                </div>
            )}

            {/* Student Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <DataTable
                    columns={[
                        { label: 'Siswa', render: (row) => (
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 ${row.is_lunas ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {row.nama_lengkap?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-gray-900 truncate tracking-tight">{row.nama_lengkap}</p>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest">{row.nis} · {row.kelas}</p>
                                </div>
                            </div>
                        )},
                        { label: 'Total Tagihan', render: (row) => <span className="text-sm font-black text-gray-700">{fmt(row.total_tagihan)}</span> },
                        { label: 'Terbayar', render: (row) => <span className="text-sm font-black text-emerald-600">{fmt(row.total_terbayar)}</span> },
                        { label: 'Sisa Tunggakan', render: (row) => (
                            <span className={`text-sm font-black ${row.is_lunas ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {row.is_lunas ? 'Rp 0 (Lunas)' : fmt(row.total_tunggakan)}
                            </span>
                        )},
                        { label: 'Status', render: (row) => (
                            row.is_lunas
                                ? <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">✓ SIAP LULUS</span>
                                : <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">TUNGGAKAN</span>
                        )},
                    ]}
                    data={students}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-2">
                            {!row.is_lunas && (
                                <button onClick={() => openAdjust(row)}
                                    className="px-4 py-2.5 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-100 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5">
                                    <AdjustmentsHorizontalIcon className="w-4 h-4" /> Kebijakan
                                </button>
                            )}
                            {row.is_lunas && (
                                <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-emerald-50 transition-colors">
                                    <input type="checkbox" checked={selectedStudentIds.includes(row.id)} onChange={() => toggleStudent(row.id)}
                                        className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500" />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pilih</span>
                                </label>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Adjustment Modal */}
            <Modal show={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title="Penyesuaian Kebijakan" maxWidth="2xl"
                description={`Nolkan tagihan ${selectedStudent?.nama_lengkap || ''} melalui kebijakan yayasan.`}
                icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}
                footer={<>
                    <Button type="submit" form="adj-form" loading={adjustForm.processing} className="px-10 py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-violet-200">
                        Terapkan Kebijakan
                    </Button>
                    <Button type="button" onClick={() => setIsAdjustOpen(false)} variant="secondary" className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">Batalkan</Button>
                </>}>
                <form id="adj-form" onSubmit={submitAdjust} className="space-y-6">
                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-amber-700"><ExclamationTriangleIcon className="w-4 h-4 inline mr-1 -mt-0.5" />
                            Total tunggakan: <strong>{fmt(selectedStudent?.total_tunggakan)}</strong> — dari {selectedStudent?.invoices_belum_lunas?.length || 0} tagihan belum lunas.
                        </p>
                    </div>

                    {/* Jenis Kebijakan */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jenis Kebijakan</label>
                        <div className="grid gap-3">
                            {JENIS_OPTIONS.map(opt => (
                                <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${adjustForm.data.jenis_kebijakan === opt.value ? 'border-violet-400 bg-violet-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <input type="radio" name="jenis" value={opt.value} checked={adjustForm.data.jenis_kebijakan === opt.value}
                                        onChange={e => adjustForm.setData('jenis_kebijakan', e.target.value)}
                                        className="mt-0.5 text-violet-600 focus:ring-violet-500" />
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{opt.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Nominal diskon (hanya untuk diskon_kelulusan) */}
                    {adjustForm.data.jenis_kebijakan === 'diskon_kelulusan' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nominal Diskon</label>
                            <input type="number" value={adjustForm.data.nominal_diskon} onChange={e => adjustForm.setData('nominal_diskon', e.target.value)}
                                className="w-full rounded-2xl border-gray-200 focus:border-violet-500 focus:ring-violet-500 text-sm py-4 px-5 font-bold" placeholder="Masukkan nominal diskon" />
                        </div>
                    )}

                    {/* Keterangan */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Keterangan / Instruksi Yayasan</label>
                        <textarea value={adjustForm.data.keterangan} onChange={e => adjustForm.setData('keterangan', e.target.value)}
                            className="w-full rounded-2xl border-gray-200 focus:border-violet-500 focus:ring-violet-500 text-sm py-4 px-5 min-h-[100px]"
                            placeholder="Contoh: Atas instruksi Pimpinan Yayasan No. SK/2026/05..." />
                    </div>

                    {/* Invoice list */}
                    {selectedStudent?.invoices_belum_lunas?.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tagihan yang akan dinolkan</label>
                            <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                                {selectedStudent.invoices_belum_lunas.map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                        <div>
                                            <p className="text-xs font-black text-gray-800">{inv.tariff_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">Periode: {inv.periode}</p>
                                        </div>
                                        <span className="text-xs font-black text-rose-600">{fmt(inv.sisa_hutang)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </form>
            </Modal>

            {/* Graduate Modal */}
            <Modal show={isGradOpen} onClose={() => setIsGradOpen(false)} title="Konfirmasi Kelulusan Massal" maxWidth="lg"
                description="Siswa yang diluluskan akan berstatus 'Lulus' dan tidak dapat menerima tagihan baru."
                icon={<TrophyIcon className="w-5 h-5" />}
                footer={<>
                    <Button onClick={submitGraduate} loading={gradForm.processing} className="px-10 py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-violet-200">
                        <ShieldCheckIcon className="w-4 h-4 inline mr-1" /> Luluskan {selectedStudentIds.length} Siswa
                    </Button>
                    <Button type="button" onClick={() => setIsGradOpen(false)} variant="secondary" className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em]">Batalkan</Button>
                </>}>
                <div className="space-y-4">
                    <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
                        <p className="text-xs font-bold text-violet-700">Anda akan meluluskan <strong>{selectedStudentIds.length}</strong> siswa. Tindakan ini akan mengubah status menjadi <strong>"Lulus"</strong> dan mengunci akun.</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                        {students.filter(s => selectedStudentIds.includes(s.id)).map(s => (
                            <div key={s.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                <CheckBadgeIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                                <div><p className="text-sm font-black text-gray-800">{s.nama_lengkap}</p><p className="text-[10px] text-gray-400 font-bold">{s.nis} · {s.kelas}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color, isText }) {
    const colors = {
        gray: 'from-gray-600 to-gray-400 shadow-gray-200',
        emerald: 'from-emerald-600 to-emerald-400 shadow-emerald-200',
        rose: 'from-rose-600 to-rose-400 shadow-rose-200',
        amber: 'from-amber-500 to-amber-300 shadow-amber-200',
    };
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} text-white flex items-center justify-center shadow-lg mb-4`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`font-black tracking-tight ${isText ? 'text-lg' : 'text-2xl'} text-gray-900`}>{value}</p>
        </div>
    );
}
