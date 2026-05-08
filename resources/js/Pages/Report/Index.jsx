import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Index({ stats, filters, chart_data }) {
    const handleFilter = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        router.get('/laporan', {
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
        }, { preserveState: true });
    };

    return (
        <AppLayout title="Laporan Keuangan">
            <Head title="Laporan Keuangan" />

            {/* Filter */}
            <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dari Tanggal</label>
                        <input 
                            type="date" 
                            name="start_date"
                            defaultValue={filters.start_date}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sampai Tanggal</label>
                        <input 
                            type="date" 
                            name="end_date"
                            defaultValue={filters.end_date}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-brand-blue focus:ring-brand-blue sm:text-sm"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                    >
                        Tampilkan
                    </button>
                </form>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                    <p className="text-2xl font-black text-green-600 mt-1">{formatCurrency(stats.total_inbound)}</p>
                    <div className="mt-2 text-xs text-green-500 font-bold">Approved Payments</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
                    <p className="text-2xl font-black text-red-600 mt-1">{formatCurrency(stats.total_expense)}</p>
                    <div className="mt-2 text-xs text-red-400 font-medium">
                        Requests: {formatCurrency(stats.total_outbound)} <br/>
                        Payroll: {formatCurrency(stats.total_payroll)}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-blue/20 bg-brand-blue/[0.02]">
                    <p className="text-sm font-medium text-gray-500">Saldo Netto</p>
                    <p className={`text-2xl font-black mt-1 ${stats.net_profit >= 0 ? 'text-brand-blue' : 'text-orange-600'}`}>
                        {formatCurrency(stats.net_profit)}
                    </p>
                    <div className="mt-2 text-xs text-gray-400 font-medium italic">Pendapatan - Pengeluaran</div>
                </div>
            </div>

            {/* Detailed Table (Coming Soon) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Detail Transaksi Periode</h3>
                    <p className="text-xs text-gray-500">Data rekapitulasi transaksi inbound dan outbound.</p>
                </div>
                <div className="p-12 text-center text-gray-400 italic">
                    Modul grafik visual dan export PDF sedang dalam pengembangan.
                </div>
            </div>
        </AppLayout>
    );
}
