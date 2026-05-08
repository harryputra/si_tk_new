import clsx from 'clsx';

export default function StatusBadge({ status, type = 'default' }) {
    let colors = '';
    
    switch (status) {
        case 'aktif':
        case 'hadir':
        case 'paid':
        case 'lunas':
        case 'approved':
        case 'disbursed':
            colors = 'bg-green-100 text-green-800 border-green-200';
            break;
        case 'alumni':
        case 'partial':
        case 'izin':
            colors = 'bg-blue-100 text-blue-800 border-blue-200';
            break;
        case 'keluar':
        case 'alfa':
        case 'unpaid':
        case 'rejected':
        case 'nonaktif':
            colors = 'bg-red-100 text-red-800 border-red-200';
            break;
        case 'pending':
        case 'draft':
        case 'sakit':
            colors = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            break;
        default:
            colors = 'bg-gray-100 text-gray-800 border-gray-200';
    }

    return (
        <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize', colors)}>
            {status}
        </span>
    );
}
