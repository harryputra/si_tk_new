import React, { useState, useEffect } from 'react';

/**
 * CurrencyInput - A reusable input component for Indonesian Rupiah (IDR)
 * Displays formatted currency (e.g., 20.000) while maintaining raw numeric value for the parent.
 */
export default function CurrencyInput({
    label,
    value,
    onChange,
    error,
    placeholder = '0',
    className = '',
    inputClassName = '',
    ...props
}) {
    const [displayValue, setDisplayValue] = useState('');

    // Format number to thousand separator (e.g., 1000 -> 1.000)
    const formatNumber = (num) => {
        if (!num && num !== 0) return '';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Remove all non-numeric characters
    const cleanNumber = (val) => {
        return val.replace(/\D/g, '');
    };

    // Initialize display value
    useEffect(() => {
        setDisplayValue(formatNumber(value));
    }, [value]);

    const handleChange = (e) => {
        const rawValue = cleanNumber(e.target.value);
        const numericValue = rawValue === '' ? '' : parseInt(rawValue, 10);
        
        setDisplayValue(formatNumber(numericValue));
        
        // Pass the raw numeric value to the parent
        if (onChange) {
            onChange({
                target: {
                    name: props.name,
                    value: numericValue
                }
            });
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 font-bold text-sm">
                    Rp
                </div>
                <input
                    {...props}
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all ${error ? 'border-red-300 ring-red-50' : ''} ${inputClassName}`}
                />
            </div>
            {error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{error}</p>}
        </div>
    );
}
