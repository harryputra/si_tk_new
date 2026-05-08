import React from 'react';

export default function InputField({
    label,
    name,
    error,
    hint,
    required = false,
    type = 'text',
    prefix,
    suffix,
    className = '',
    inputClassName = '',
    ...props
}) {
    const id = props.id || name;
    const stateClasses = error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
        : 'border-gray-300 hover:border-gray-400 focus:border-brand-blue focus:ring-brand-blue/20';

    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <div className="relative">
                {prefix && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm font-medium">
                        {prefix}
                    </div>
                )}
                <input
                    id={id}
                    name={name}
                    type={type}
                    {...props}
                    className={`block w-full rounded-lg border bg-white text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:outline-none focus:ring-4 disabled:bg-gray-50 disabled:text-gray-500 ${prefix ? 'pl-10' : 'pl-3.5'} ${suffix ? 'pr-10' : 'pr-3.5'} py-2.5 ${stateClasses} ${inputClassName}`}
                />
                {suffix && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-sm font-medium">
                        {suffix}
                    </div>
                )}
            </div>
            {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
            {error && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {error}
            </p>}
        </div>
    );
}
