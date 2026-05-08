import { useForm, Head } from '@inertiajs/react';
import clsx from 'clsx';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Masuk" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-blue mb-4">
                            <span className="text-white text-2xl font-bold">TK</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">SI ERP TK Attauhid</h1>
                        <p className="text-sm text-gray-500 mt-1">Masuk ke akun Anda</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    autoFocus
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className={clsx(
                                        'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40',
                                        errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                                    )}
                                    placeholder="admin@tkaattauhid.sch.id"
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className={clsx(
                                        'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40',
                                        errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                                    )}
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue/40"
                                />
                                <label htmlFor="remember" className="text-sm text-gray-600">
                                    Ingat saya
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:opacity-60 transition-colors"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        © {new Date().getFullYear()} TK Attauhid · Sistem Informasi ERP
                    </p>
                </div>
            </div>
        </>
    );
}
