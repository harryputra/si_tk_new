import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { ExclamationTriangleIcon, CheckCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function ConfirmationModal({
    show = false,
    title = 'Konfirmasi',
    description = 'Apakah Anda yakin ingin melakukan tindakan ini?',
    onConfirm = () => {},
    onCancel = () => {},
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    loading = false,
    variant = 'danger', // danger, success, info
}) {
    const icons = {
        danger: <ExclamationTriangleIcon className="w-5 h-5 text-rose-600" />,
        success: <CheckCircleIcon className="w-5 h-5 text-emerald-600" />,
        info: <QuestionMarkCircleIcon className="w-5 h-5 text-blue-600" />,
    };

    const variantStyles = {
        danger: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100',
        success: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
    };

    return (
        <Modal
            show={show}
            onClose={onCancel}
            title={title}
            description={description}
            icon={icons[variant]}
            maxWidth="md"
            footer={
                <>
                    <Button
                        onClick={onConfirm}
                        loading={loading}
                        className={`px-6 py-2 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${variantStyles[variant]}`}
                    >
                        {confirmText}
                    </Button>
                    <Button
                        onClick={onCancel}
                        variant="secondary"
                        className="px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                        {cancelText}
                    </Button>
                </>
            }
        >
            <div className="py-2">
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {description}
                </p>
            </div>
        </Modal>
    );
}
