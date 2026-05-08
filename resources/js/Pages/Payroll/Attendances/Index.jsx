import React, { useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { 
    CalendarIcon, 
    UserGroupIcon, 
    CheckCircleIcon,
    InformationCircleIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Index({ teachers = [], attendances = {}, date }) {
    const handleStatusChange = useCallback((teacherId, status) => {
        const newData = [
            {
                teacher_id: teacherId,
                status: status,
                keterangan: attendances[teacherId]?.keterangan || ''
            }
        ];
        
        router.post('/absensi', {
            tanggal: date,
            data: newData
        }, { preserveScroll: true });
    }, [attendances, date]);

    const handleKeteranganChange = useCallback((teacherId, keterangan) => {
        const newData = [
            {
                teacher_id: teacherId,
                status: attendances[teacherId]?.status || 'belum_absen',
                keterangan: keterangan
            }
        ];
        
        router.post('/absensi', {
            tanggal: date,
            data: newData
        }, { preserveScroll: true });
    }, [attendances, date]);

    const stats = {
        total: teachers.length,
        hadir: Object.values(attendances).filter(a => a.status === 'hadir').length,
        izin: Object.values(attendances).filter(a => a.status === 'izin').length,
        sakit: Object.values(attendances).filter(a => a.status === 'sakit').length,
        alfa: Object.values(attendances).filter(a => a.status === 'alfa').length,
    };

    return (
        <AppLayout title="Presensi Guru">
            <Head title="Presensi Guru — SI ERP TK Attauhid" />

            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Presensi Guru</h2>
                    <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Log Kehadiran Harian & Rekapitulasi Staf</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 shrink-0">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">HADIR HARI INI</p>
                        <p className="text-xl font-black text-indigo-600 tracking-tight">{stats.hadir} / {stats.total} GURU</p>
                    </div>
                    <div className="relative group">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500" />
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => router.get('/absensi', { tanggal: e.target.value })}
                            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all uppercase tracking-tight shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { label: 'IZIN', count: stats.izin, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'SAKIT', count: stats.sakit, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                    { label: 'ALFA', count: stats.alfa, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
                    { label: 'BELUM ABSEN', count: stats.total - (stats.hadir + stats.izin + stats.sakit + stats.alfa), color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100' },
                ].map((stat, i) => (
                    <div key={i} className={clsx("px-6 py-4 rounded-2xl border transition-all hover:shadow-md", stat.bg, stat.border)}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{stat.label}</p>
                        <p className={clsx("text-2xl font-black tracking-tight", stat.color)}>{stat.count}</p>
                    </div>
                ))}
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Data Guru</th>
                            <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status Kehadiran</th>
                            <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Keterangan / Memo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {teachers.map((teacher) => {
                            const attendance = attendances[teacher.id];
                            const currentStatus = attendance?.status || 'belum_absen';
                            
                            return (
                                <tr key={teacher.id} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-100 shrink-0 group-hover:scale-105 transition-transform">
                                                {teacher.nama_lengkap?.charAt(0) || 'G'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base font-black text-gray-900 truncate tracking-tight leading-tight mb-1">{teacher.nama_lengkap}</p>
                                                <p className="text-[10px] text-gray-400 font-black tracking-[0.2em] uppercase">{teacher.jabatan || 'STAF PENGAJAR'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {[
                                                { id: 'hadir', label: 'HADIR', active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-100', inactive: 'bg-emerald-50 text-emerald-400 hover:bg-emerald-100 hover:text-emerald-600' },
                                                { id: 'izin', label: 'IZIN', active: 'bg-blue-600 text-white shadow-lg shadow-blue-100', inactive: 'bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600' },
                                                { id: 'sakit', label: 'SAKIT', active: 'bg-amber-500 text-white shadow-lg shadow-amber-100', inactive: 'bg-amber-50 text-amber-400 hover:bg-amber-100 hover:text-amber-600' },
                                                { id: 'alfa', label: 'ALFA', active: 'bg-rose-600 text-white shadow-lg shadow-rose-100', inactive: 'bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600' },
                                            ].map((status) => (
                                                <button
                                                    key={status.id}
                                                    onClick={() => handleStatusChange(teacher.id, status.id)}
                                                    className={clsx(
                                                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-90",
                                                        currentStatus === status.id ? status.active : status.inactive
                                                    )}
                                                >
                                                    {status.label}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="relative flex items-center">
                                            <InformationCircleIcon className="absolute left-4 w-4 h-4 text-gray-300 pointer-events-none" />
                                            <input 
                                                type="text" 
                                                placeholder="TAMBAH CATATAN..."
                                                defaultValue={attendance?.keterangan || ''}
                                                onBlur={(e) => {
                                                    if (e.target.value !== (attendance?.keterangan || '')) {
                                                        handleKeteranganChange(teacher.id, e.target.value);
                                                    }
                                                }}
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-[10px] font-bold text-gray-700 placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {teachers.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <UserGroupIcon className="w-16 h-16 text-gray-100 mb-4" />
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Tidak ada data guru untuk ditampilkan</p>
                    </div>
                )}
            </div>
            
            {/* Legend / Info */}
            <div className="flex items-center gap-3 ml-4 opacity-50">
                <ClipboardDocumentCheckIcon className="w-4 h-4 text-gray-400" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">PERUBAHAN STATUS AKAN DISIMPAN SECARA OTOMATIS KE DATABASE PAYROLL</p>
            </div>
        </AppLayout>
    );
}
