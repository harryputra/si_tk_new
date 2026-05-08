import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import InputField from '@/Components/InputField';
import TextareaField from '@/Components/TextareaField';
import Button from '@/Components/Button';
import { BuildingOfficeIcon, DevicePhoneMobileIcon, EnvelopeIcon, GlobeAltIcon, UserCircleIcon, IdentificationIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function Index({ setting }) {
    const { data, setData, patch, processing, errors } = useForm({
        nama_sekolah: setting?.nama_sekolah || '',
        alamat: setting?.alamat || '',
        telepon: setting?.telepon || '',
        email: setting?.email || '',
        website: setting?.website || '',
        nama_kepala_sekolah: setting?.nama_kepala_sekolah || '',
        nip_kepala_sekolah: setting?.nip_kepala_sekolah || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('school-settings.update'));
    };

    return (
        <AppLayout title="Pengaturan Sekolah">
            <Head title="Pengaturan Sekolah — SI ERP TK Attauhid" />

            <div className="mb-10">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Profil & Pengaturan Sekolah</h2>
                <p className="text-base text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Kelola identitas resmi sekolah untuk kebutuhan dokumen & laporan</p>
            </div>

            <form onSubmit={submit} className="space-y-8 max-w-4xl">
                {/* Identitas Utama */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <BuildingOfficeIcon className="w-64 h-64 text-gray-900" />
                    </div>
                    
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <div className="w-8 h-1 bg-blue-600 rounded-full" />
                        Identitas Utama
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="md:col-span-2">
                            <InputField
                                label="Nama Sekolah"
                                icon={<BuildingOfficeIcon className="w-5 h-5" />}
                                value={data.nama_sekolah}
                                onChange={e => setData('nama_sekolah', e.target.value)}
                                error={errors.nama_sekolah}
                                placeholder="Masukkan nama resmi sekolah..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <TextareaField
                                label="Alamat Lengkap"
                                icon={<MapPinIcon className="w-5 h-5" />}
                                value={data.alamat}
                                onChange={e => setData('alamat', e.target.value)}
                                error={errors.alamat}
                                placeholder="Masukkan alamat lengkap sekolah..."
                                rows={3}
                            />
                        </div>
                        <InputField
                            label="Nomor Telepon"
                            icon={<DevicePhoneMobileIcon className="w-5 h-5" />}
                            value={data.telepon}
                            onChange={e => setData('telepon', e.target.value)}
                            error={errors.telepon}
                            placeholder="(021) XXXXXXX"
                        />
                        <InputField
                            label="Email Sekolah"
                            icon={<EnvelopeIcon className="w-5 h-5" />}
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            error={errors.email}
                            placeholder="admin@sekolah.sch.id"
                        />
                        <InputField
                            label="Website"
                            icon={<GlobeAltIcon className="w-5 h-5" />}
                            value={data.website}
                            onChange={e => setData('website', e.target.value)}
                            error={errors.website}
                            placeholder="https://www.sekolah.sch.id"
                        />
                    </div>
                </div>

                {/* Penanggung Jawab */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <div className="w-8 h-1 bg-emerald-600 rounded-full" />
                        Penanggung Jawab (Kepala Sekolah)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField
                            label="Nama Kepala Sekolah"
                            icon={<UserCircleIcon className="w-5 h-5" />}
                            value={data.nama_kepala_sekolah}
                            onChange={e => setData('nama_kepala_sekolah', e.target.value)}
                            error={errors.nama_kepala_sekolah}
                            placeholder="Masukkan nama lengkap beserta gelar..."
                        />
                        <InputField
                            label="NIP / NIY"
                            icon={<IdentificationIcon className="w-5 h-5" />}
                            value={data.nip_kepala_sekolah}
                            onChange={e => setData('nip_kepala_sekolah', e.target.value)}
                            error={errors.nip_kepala_sekolah}
                            placeholder="Masukkan nomor induk..."
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 bg-gray-900/5 p-6 rounded-[2rem] border border-white">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-auto ml-4">
                        Perubahan akan langsung berdampak pada header dokumen & laporan
                    </p>
                    <Button
                        type="submit"
                        loading={processing}
                        className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-black hover:-translate-y-1 transition-all active:scale-95"
                    >
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
