import React, { useRef, useState, useId } from 'react';
import { CameraIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function ImageUpload({ 
    value, 
    onChange, 
    error, 
    existingImage,
    label = "Foto Profil",
    description = "Format JPG, PNG atau GIF. Maksimal 2MB."
}) {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const inputId = useId();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            onChange(file);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreviewUrl(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerClick = () => {
        fileInputRef.current?.click();
    };

    const displayImage = previewUrl || (existingImage ? `/storage/${existingImage}` : null);

    return (
        <div className="flex flex-col items-center gap-4 py-2">
            <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <div 
                    className={clsx(
                        "relative w-32 h-32 rounded-[2.2rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-50 transition-all duration-500",
                        "hover:scale-[1.02] active:scale-95 flex items-center justify-center group/container"
                    )}
                >
                    {displayImage ? (
                        <img 
                            src={displayImage} 
                            alt="Avatar Preview" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/container:scale-110"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 group-hover/container:text-blue-500 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-2 group-hover/container:bg-blue-50 transition-colors">
                                <CameraIcon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Unggah Foto</span>
                        </div>
                    )}

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover/container:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white backdrop-blur-[2px] pointer-events-none">
                        <ArrowPathIcon className="w-8 h-8 mb-1 animate-spin-slow" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Ganti Foto</span>
                    </div>

                    {/* Invisible File Input Overlay */}
                    <input 
                        ref={fileInputRef}
                        id={inputId}
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" 
                        accept="image/*"
                        onChange={handleFileChange}
                        title="Pilih Foto"
                    />
                </div>

                {/* Remove Button */}
                {value && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-white text-rose-500 shadow-xl border border-rose-50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12 active:scale-90 z-20"
                        title="Hapus Foto"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="text-center">
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{label}</p>
                <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{description}</p>
                {error && <p className="text-[10px] text-rose-500 font-black mt-2 uppercase tracking-widest">{error}</p>}
            </div>
        </div>
    );
}
