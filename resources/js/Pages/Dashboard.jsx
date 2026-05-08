import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BanknotesIcon, 
    UsersIcon, 
    AcademicCapIcon, 
    ArrowUpCircleIcon, 
    ArrowDownCircleIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Dashboard({ stats, recent_payments, recent_requests, student_types }) {
    const kpiCards = [
        { 
            name: 'Total Saldo Kas', 
            value: formatCurrency(stats.total_balance), 
            icon: BanknotesIcon, 
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            description: 'Total saldo di seluruh rekening'
        },
        { 
            name: 'Siswa Aktif', 
            value: stats.active_students, 
            icon: UsersIcon, 
            color: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            description: 'Siswa dengan status aktif'
        },
        { 
            name: 'Guru & Staf', 
            value: stats.total_teachers, 
            icon: AcademicCapIcon, 
            color: 'bg-indigo-500',
            textColor: 'text-indigo-600',
            description: 'Total pengajar aktif'
        },
        { 
            name: 'Tunggakan Siswa', 
            value: formatCurrency(stats.total_arrears), 
            icon: CalendarDaysIcon, 
            color: 'bg-rose-500',
            textColor: 'text-rose-600',
            description: 'Total tagihan belum lunas'
        },
    ];

    return (
        <AppLayout title="Dashboard Utama">
            <Head title="Admin Dashboard" />

            {/* Quick Actions / Alerts */}
            {(stats.pending_payments > 0 || stats.pending_requests > 0) && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.pending_payments > 0 && (
                        <Link href="/pembayaran" className="flex items-center justify-between p-5 bg-amber-50 border border-amber-200 rounded-3xl group hover:bg-amber-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-200/50 rounded-2xl text-amber-700">
                                    <ExclamationTriangleIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Persetujuan Pembayaran</p>
                                    <p className="text-sm font-bold text-amber-600 mt-1">Ada {stats.pending_payments} pembayaran menunggu verifikasi</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-amber-200/30 flex items-center justify-center text-amber-700 group-hover:translate-x-1 transition-transform">
                                <ArrowUpCircleIcon className="w-6 h-6 rotate-90" />
                            </div>
                        </Link>
                    )}
                    {stats.pending_requests > 0 && (
                        <Link href="/pengajuan" className="flex items-center justify-between p-5 bg-indigo-50 border border-indigo-200 rounded-3xl group hover:bg-indigo-100 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-200/50 rounded-2xl text-indigo-700">
                                    <CheckBadgeIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-indigo-800 uppercase tracking-widest">Persetujuan Dana</p>
                                    <p className="text-sm font-bold text-indigo-600 mt-1">Ada {stats.pending_requests} pengajuan dana menunggu approval</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-200/30 flex items-center justify-center text-indigo-700 group-hover:translate-x-1 transition-transform">
                                <ArrowUpCircleIcon className="w-6 h-6 rotate-90" />
                            </div>
                        </Link>
                    )}
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {kpiCards.map((card) => (
                    <div key={card.name} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${card.color} bg-opacity-10 shadow-inner`}>
                                    <card.icon className={`h-7 w-7 ${card.textColor}`} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Summary</span>
                                    <div className="w-8 h-1 bg-gray-100 rounded-full mt-1" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{card.name}</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tight">{card.value}</p>
                            <p className="text-[9px] font-bold text-gray-400 mt-3 flex items-center gap-1.5 uppercase tracking-widest italic">
                                <span className="w-1 h-1 bg-blue-500 rounded-full" /> {card.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Performance & Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Monthly Performance */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Performa Keuangan Bulan Ini</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl">
                            <ChartBarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 relative overflow-hidden group">
                            <ArrowTrendingUpIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-emerald-100/50 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Pemasukan (Lunas)</p>
                            <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(stats.monthly_income)}</p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">VERIFIED</span>
                                <span className="text-[9px] font-bold text-emerald-500">Berdasarkan tanggal bayar</span>
                            </div>
                        </div>

                        <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100 relative overflow-hidden group">
                            <ArrowTrendingDownIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-rose-100/50 group-hover:scale-110 transition-transform" />
                            <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-1">Pengeluaran (Disbursed)</p>
                            <p className="text-2xl font-black text-rose-600 tracking-tight">{formatCurrency(stats.monthly_expense)}</p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-lg">DISBURSED</span>
                                <span className="text-[9px] font-bold text-rose-500">Berdasarkan realisasi dana</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budget Health Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] shadow-xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <ArrowUpCircleIcon className="w-32 h-32 rotate-45" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-black tracking-tight mb-1 uppercase">Kesehatan Anggaran {stats.current_year}</h3>
                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Monitoring RKAS Tahunan</p>
                        
                        <div className="mt-10">
                            <div className="flex justify-between items-end mb-3">
                                <p className="text-3xl font-black tracking-tighter">{stats.budget_health}%</p>
                                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">TERPAKAI</p>
                            </div>
                            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden p-1 border border-white/10">
                                <div 
                                    className="h-full bg-white rounded-full shadow-lg transition-all duration-1000" 
                                    style={{ width: `${stats.budget_health}%` }}
                                />
                            </div>
                            <p className="text-[10px] font-medium mt-4 leading-relaxed opacity-90">
                                Penggunaan dana operasional saat ini mencapai {stats.budget_health}% dari total pagu RKAS yang disetujui.
                            </p>
                        </div>
                    </div>
                    <div className="relative z-10 pt-6">
                        <Link href="/rkas" className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                            Lihat Detail RKAS
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Activity & Demographic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Inbound Payments */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-100 rounded-xl">
                                <ArrowUpCircleIcon className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 tracking-tight">Penerimaan Terbaru</h3>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status: Verified Payments</p>
                            </div>
                        </div>
                        <Link href="/pembayaran" className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-transparent hover:border-blue-100">Semua Data</Link>
                    </div>
                    <div className="divide-y divide-gray-50 flex-1">
                        {recent_payments.length > 0 ? recent_payments.map((payment) => (
                            <div key={payment.id} className="px-8 py-5 hover:bg-gray-50 transition flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-100 transform group-hover:-rotate-3 transition-transform">
                                        {payment.student.nama_lengkap.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">{payment.student.nama_lengkap}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(payment.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-black text-emerald-600 tracking-tight">+{formatCurrency(payment.total_bayar)}</p>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded-md">{payment.status_approval}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <BanknotesIcon className="w-8 h-8 text-gray-200" />
                                </div>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Belum ada data penerimaan</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Outbound Requests */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-100 rounded-xl">
                                <ArrowDownCircleIcon className="h-6 w-6 text-rose-600" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 tracking-tight">Pengeluaran Terbaru</h3>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status: Disbursed Funds</p>
                            </div>
                        </div>
                        <Link href="/pengajuan" className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-transparent hover:border-blue-100">Semua Data</Link>
                    </div>
                    <div className="divide-y divide-gray-50 flex-1">
                        {recent_requests.length > 0 ? recent_requests.map((request) => (
                            <div key={request.id} className="px-8 py-5 hover:bg-gray-50 transition flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center text-sm font-black transform group-hover:rotate-3 transition-transform">
                                        <BanknotesIcon className="w-6 h-6" />
                                    </div>
                                    <div className="max-w-[200px]">
                                        <p className="text-sm font-black text-gray-900 truncate tracking-tight group-hover:text-rose-600 transition-colors">{request.judul_pengajuan}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{new Date(request.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-black text-rose-600 tracking-tight">-{formatCurrency(request.nominal)}</p>
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded-md">{request.status_approval}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <ArrowDownCircleIcon className="w-8 h-8 text-gray-200" />
                                </div>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Belum ada pengajuan dana</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Demographic Strip */}
            <div className="mt-10 bg-white rounded-3xl border border-gray-100 p-8">
                <div className="flex flex-wrap items-center justify-around gap-10">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 text-center">Komposisi Siswa Aktif</p>
                        <div className="flex gap-8">
                            {student_types.map((type) => (
                                <div key={type.jenis_siswa} className="text-center">
                                    <p className="text-2xl font-black text-gray-900 tracking-tighter">{type.total}</p>
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">{type.jenis_siswa.replace('_', ' ')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block w-px h-16 bg-gray-100" />
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Sistem Integritas Data</p>
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                            <CheckBadgeIcon className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Database Synced</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
