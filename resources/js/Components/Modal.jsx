import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    title = '',
    description = '',
    icon,
    footer,
    children,
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
    }[maxWidth];

    return (
        <Transition show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={close}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" aria-hidden="true" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel
                                className={`relative w-full ${maxWidthClass} bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden transform transition-all flex flex-col max-h-[calc(100vh-3rem)]`}
                            >
                                <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-100 bg-white shrink-0">
                                    {icon && (
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue shrink-0">
                                            {icon}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <Dialog.Title className="text-base font-bold text-gray-900 leading-tight">
                                            {title}
                                        </Dialog.Title>
                                        {description && (
                                            <Dialog.Description className="text-xs text-gray-500 mt-0.5">
                                                {description}
                                            </Dialog.Description>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={close}
                                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors rounded-lg p-1.5 -mt-0.5 -mr-1.5"
                                        aria-label="Close"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-6">
                                    {children}
                                </div>

                                {footer && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-row-reverse gap-3 shrink-0">
                                        {footer}
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
