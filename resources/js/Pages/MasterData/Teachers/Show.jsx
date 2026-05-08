import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';
import { 
    UserIcon, 
    BriefcaseIcon, 
    PhoneIcon, 
    BanknotesIcon, 
    CreditCardIcon, 
    ArrowLeftIcon, 
    IdentificationIcon,
    WalletIcon,
    MapPinIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Show({ teacher }) {
    const initials = teacher.nama_lengkap
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    return (
        <AppLayout title="Detail Guru">
            <Head title={`Detail Guru - ${teacher.nama_lengkap}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Back Button */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/guru"
                        className="group flex items-center gap-2 text-sm font-black text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                    >
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                            <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        </div>
                        Kembali ke Daftar
                    </Link>
                </div>

                {/* Profile Header Card */}
                <div className="relative overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-8 md:p-12">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
                    
                    <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            {teacher.photo ? (
                                <img 
                                    src={`/storage/${teacher.photo}`} 
                                    alt={teacher.nama_lengkap} 
                                    className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] object-cover shadow-2xl border-4 border-white"
                                />
                            ) : (
                                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-2xl overflow-hidden border-4 border-white">
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {initials}
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2">
                                <StatusBadge status={teacher.status} className="px-4 py-2 border-4 border-white shadow-lg text-[10px]" />
                            </div>
                        </div>

                        {/* Name & Basic Info */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                    <IdentificationIcon className="w-3.5 h-3.5" />
                                    NIP: {teacher.nip}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                                    {teacher.nama_lengkap}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <BriefcaseIcon className="w-5 h-5 text-indigo-400" />
                                        {teacher.jabatan}
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <PhoneIcon className="w-5 h-5 text-indigo-400" />
                                        {teacher.no_hp || 'No Contact'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats? (Optional) */}
                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                            <div className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 text-center space-y-1 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gaji Pokok</p>
                                <p className="text-xl font-black text-gray-900">{formatCurrency(teacher.gaji_pokok)}</p>
                            </div>
                            <div className="p-6 rounded-[2rem] bg-indigo-600 text-center space-y-1 shadow-xl shadow-indigo-100">
                                <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">Status</p>
                                <p className="text-xl font-black text-white uppercase tracking-wider">{teacher.status}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Personal & Contact */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Data Personal</h2>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Informasi lengkap profil guru</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <InfoItem label="NIP" value={teacher.nip} icon={IdentificationIcon} />
                                <InfoItem label="Nama Lengkap" value={teacher.nama_lengkap} icon={UserIcon} />
                                <InfoItem label="Jabatan" value={teacher.jabatan} icon={BriefcaseIcon} />
                                <InfoItem label="No HP" value={teacher.no_hp || '-'} icon={PhoneIcon} />
                                <InfoItem label="Email" value={teacher.email || '-'} icon={AcademicCapIcon} />
                                <InfoItem label="Alamat" value={teacher.alamat || '-'} icon={MapPinIcon} className="md:col-span-2" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Salary & Banking */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                    <WalletIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Komponen Gaji</h2>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Konfigurasi payroll bulanan</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <SalaryItem label="Gaji Pokok" value={teacher.gaji_pokok} icon={BanknotesIcon} color="indigo" />
                                <SalaryItem label="Tunjangan Tetap" value={teacher.tunjangan_tetap} icon={BanknotesIcon} color="blue" />
                                <SalaryItem label="Bonus Hadir (Hari)" value={teacher.bonus_hadir} icon={BanknotesIcon} color="emerald" />
                                <SalaryItem label="Denda Alfa (Hari)" value={teacher.denda_alfa} icon={BanknotesIcon} color="rose" isNegative />
                            </div>

                            <div className="pt-6 border-t border-gray-100 space-y-6">
                                <div className="flex items-center gap-3">
                                    <CreditCardIcon className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Informasi Bank</h3>
                                </div>
                                <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank</p>
                                        <p className="text-sm font-black text-gray-900 uppercase">{teacher.nama_bank || '-'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No. Rekening</p>
                                        <p className="text-sm font-black text-indigo-600 font-mono tracking-wider">{teacher.nomor_rekening_bank || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoItem({ label, value, icon: Icon, className }) {
    return (
        <div className={clsx("group space-y-1.5", className)}>
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-indigo-400 transition-colors">
                <Icon className="w-4 h-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
            </div>
            <p className="text-base font-bold text-gray-900 leading-tight">
                {value}
            </p>
        </div>
    );
}

function SalaryItem({ label, value, icon: Icon, color, isNegative }) {
    const colorClasses = {
        indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
        blue: "text-blue-600 bg-blue-50 border-blue-100",
        emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
        rose: "text-rose-600 bg-rose-50 border-rose-100",
    };

    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={clsx("w-10 h-10 rounded-xl border flex items-center justify-center transition-all group-hover:scale-110", colorClasses[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-gray-600">{label}</p>
            </div>
            <p className={clsx(
                "text-base font-black tracking-tight",
                isNegative ? "text-rose-600" : "text-gray-900"
            )}>
                {isNegative && "- "}{formatCurrency(value)}
            </p>
        </div>
    );
}
