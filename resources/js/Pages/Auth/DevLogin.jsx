import React from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    UserIcon, 
    ShieldCheckIcon, 
    AcademicCapIcon, 
    BanknotesIcon, 
    BuildingLibraryIcon 
} from '@heroicons/react/24/outline';

const DevLogin = ({ roles }) => {
    const handleLogin = (email, password) => {
        console.log('Attempting dev login for:', email);
        router.post('/login2', {
            email: email,
            password: password,
        }, {
            onSuccess: () => console.log('Login success'),
            onError: (errors) => console.error('Login failed:', errors),
        });
    };

    const getIcon = (roleName) => {
        switch (roleName) {
            case 'super_admin': return <ShieldCheckIcon className="w-6 h-6" />;
            case 'bendahara': return <BanknotesIcon className="w-6 h-6" />;
            case 'admin_hr': return <UserIcon className="w-6 h-6" />;
            case 'kepala_sekolah': return <AcademicCapIcon className="w-6 h-6" />;
            case 'yayasan': return <BuildingLibraryIcon className="w-6 h-6" />;
            default: return <UserIcon className="w-6 h-6" />;
        }
    };

    const getColor = (roleName) => {
        switch (roleName) {
            case 'super_admin': return 'bg-rose-500 hover:bg-rose-600 shadow-rose-200';
            case 'bendahara': return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200';
            case 'admin_hr': return 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200';
            case 'kepala_sekolah': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
            case 'yayasan': return 'bg-violet-500 hover:bg-violet-600 shadow-violet-200';
            default: return 'bg-slate-500 hover:bg-slate-600 shadow-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <Head title="Development Login" />

            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Development Login Hub</h1>
                    <p className="text-slate-500">Quick access for testing different user perspectives.</p>
                    <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium border border-amber-200">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                        Local Development Only
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <button
                            key={role.name}
                            onClick={() => handleLogin(role.user_email, role.password)}
                            disabled={!role.user_email}
                            className={`group relative overflow-hidden p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 shadow-lg border border-transparent ${getColor(role.name)}`}
                        >
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="p-3 bg-white/20 rounded-xl w-fit mb-4">
                                    <div className="text-white">
                                        {getIcon(role.name)}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white capitalize mb-1">
                                    {role.name.replace('_', ' ')}
                                </h3>
                                <p className="text-white/80 text-sm font-medium">
                                    {role.user_name || 'No user found'}
                                </p>
                                <div className="mt-4 flex items-center text-white/90 text-sm font-bold">
                                    <span>Login Now</span>
                                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>
                            
                            {/* Decorative background shape */}
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        </button>
                    ))}
                </div>

                <div className="mt-12 p-4 bg-white rounded-xl border border-slate-200 flex items-start gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0">
                        <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-900 block mb-1">Architecture Sync:</span>
                            This portal is strictly for <code className="bg-slate-100 px-1 rounded text-rose-600">APP_ENV=local</code>. It bypasses password checks to accelerate testing of Role-Based Access Control (RBAC) and Financial Workflow observers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevLogin;
