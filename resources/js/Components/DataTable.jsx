import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

export default function DataTable({ 
    columns, 
    data, 
    actions, 
    onDelete,
    sortBy,
    sortDir,
    onSort,
}) {
    const handleSort = (col) => {
        if (!col.sortKey || !onSort) return;
        const newDir = (sortBy === col.sortKey && sortDir === 'asc') ? 'desc' : 'asc';
        onSort(col.sortKey, newDir);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
                <thead>
                    <tr>
                        {columns.map((col, idx) => {
                            const isSortable = !!col.sortKey && !!onSort;
                            const isActive = sortBy === col.sortKey;
                            return (
                                <th
                                    key={idx}
                                    onClick={() => isSortable && handleSort(col)}
                                    className={`px-6 py-4 bg-gray-50/50 text-left text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100 first:pl-8 last:pr-8 select-none ${col.className || ''} ${
                                        isSortable 
                                            ? 'cursor-pointer hover:bg-gray-100/70 transition-colors group/th ' + (isActive ? 'text-gray-700' : 'text-gray-400')
                                            : 'text-gray-400'
                                    }`}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        {col.label}
                                        {isSortable && (
                                            <span className={`inline-flex flex-col -space-y-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover/th:opacity-40'}`}>
                                                <ChevronUpIcon className={`w-3 h-3 ${isActive && sortDir === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} />
                                                <ChevronDownIcon className={`w-3 h-3 ${isActive && sortDir === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} />
                                            </span>
                                        )}
                                    </span>
                                </th>
                            );
                        })}
                        {actions && (
                            <th className="px-6 py-4 bg-gray-50/50 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pr-8">
                                AKSI
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                    {data.map((row, rowIndex) => (
                        <tr 
                            key={rowIndex} 
                            className="group transition-colors hover:bg-gray-50/50"
                        >
                            {columns.map((col, colIndex) => (
                                <td 
                                    key={colIndex} 
                                    className={`px-6 py-5 text-sm first:pl-8 last:pr-8 ${col.className || ''}`}
                                >
                                    {col.render ? col.render(row, rowIndex) : (
                                        <span className="text-gray-600 font-medium">{row[col.key]}</span>
                                    )}
                                </td>
                            ))}
                            {actions && (
                                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium pr-8">
                                    <div className="flex justify-end transform transition-all duration-300 group-hover:translate-x-[-4px]">
                                        {actions(row)}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td 
                                colSpan={columns.length + (actions ? 1 : 0)} 
                                className="px-6 py-12 text-center"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">Data tidak ditemukan.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
