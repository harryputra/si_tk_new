import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function PremiumSelect({
    label,
    value,
    options = [],
    onChange,
    placeholder = 'Pilih opsi...',
    className = '',
    error,
    required = false,
    icon
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.value) === String(value)) || null;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    // Helper to check if value is considered "active" (not null/empty string)
    const isActive = value !== null && value !== undefined && value !== '';

    return (
        <div className={clsx('relative', className)} ref={dropdownRef}>
            {label && (
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3 ml-1">
                    {label}
                    {required && <span className="text-rose-500 ml-1">*</span>}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    'w-full flex items-center justify-between px-6 py-4 transition-all duration-300 rounded-2xl text-left border-2',
                    isOpen 
                        ? 'bg-white border-blue-600 ring-4 ring-blue-100 shadow-lg' 
                        : (isActive ? 'bg-blue-600 border-blue-700 shadow-lg shadow-blue-100' : 'bg-gray-50 border-transparent hover:border-gray-200 focus:border-blue-300'),
                    error && 'border-rose-300 ring-rose-50 ring-4'
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {icon && <div className={clsx(
                        'shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-gray-400'
                    )}>{icon}</div>}
                    <span className={clsx(
                        'text-xs font-black uppercase tracking-widest truncate',
                        isActive ? 'text-white' : 'text-gray-300'
                    )}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDownIcon className={clsx(
                    'w-5 h-5 transition-transform duration-300',
                    isOpen ? 'rotate-180 text-blue-600' : (isActive ? 'text-white' : 'text-gray-400')
                )} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-3 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl shadow-gray-200/50 py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                        {options.length > 0 ? (
                            options.map((option) => {
                                const isCurrent = String(option.value) === String(value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={clsx(
                                            'w-full flex items-center px-6 py-3.5 text-[10px] font-black uppercase tracking-widest transition-colors text-left',
                                            isCurrent 
                                                ? 'bg-blue-50 text-blue-600' 
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <div className="flex-1 truncate">{option.label}</div>
                                        {isCurrent && (
                                            <div className="w-2 h-2 rounded-full bg-blue-600 ml-3 shadow-lg shadow-blue-200" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Tidak ada opsi</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-3 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
}
