import React from 'react';

export default function FormSection({ title, description, icon, children, className = '' }) {
    return (
        <div className={className}>
            {(title || description) && (
                <div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-100">
                    {icon && (
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-blue/10 text-brand-blue shrink-0">
                            {icon}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
                        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
                    </div>
                </div>
            )}
            <div className="space-y-4">{children}</div>
        </div>
    );
}
