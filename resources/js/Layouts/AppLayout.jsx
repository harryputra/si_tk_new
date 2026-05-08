import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    HomeIcon,
    UsersIcon,
    AcademicCapIcon,
    BanknotesIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    CalculatorIcon,
    ChartBarIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    BriefcaseIcon,
    QueueListIcon,
    Square3Stack3DIcon,
    TrophyIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigationGroups = [
    {
        title: 'Utama',
        items: [
            { name: 'Dashboard', href: '/', icon: HomeIcon },
        ]
    },
    {
        title: 'Akademik',
        items: [
            { name: 'Penerimaan Siswa', href: '/ppdb', icon: UsersIcon },
            { name: 'Data Siswa', href: '/siswa', icon: UsersIcon },
            { name: 'Data Kelas', href: '/kelas', icon: Square3Stack3DIcon },
            { name: 'Tahun Ajaran', href: '/tahun-ajaran', icon: AcademicCapIcon },
            { name: 'Kenaikan Kelas', href: '/kenaikan-kelas', icon: ArrowTrendingUpIcon },
            { name: 'Pemetaan Kelas', href: '/plotting', icon: QueueListIcon },
            { name: 'Kelulusan', href: '/kelulusan', icon: TrophyIcon },
        ]
    },
    {
        title: 'Master Data',
        items: [
            { name: 'Data Guru', href: '/guru', icon: BriefcaseIcon },
            { name: 'Rekening', href: '/akun', icon: BanknotesIcon },
            { name: 'Tarif Biaya', href: '/tarif', icon: CalculatorIcon },
            { name: 'Kategori Biaya', href: '/kategori-biaya', icon: QueueListIcon },
            { name: 'Akun RKAS (COA)', href: '/rkas-account', icon: ChartBarIcon },
            { name: 'Jenis Siswa', href: '/jenis-siswa', icon: UsersIcon },
        ]
    },
    {
        title: 'Keuangan',
        items: [
            { name: 'RKAS', href: '/rkas', icon: ChartBarIcon },
            { name: 'Tagihan (SPP)', href: '/tagihan', icon: DocumentTextIcon },
            { name: 'Pembayaran', href: '/pembayaran', icon: BanknotesIcon },
            { name: 'Pengajuan Biaya', href: '/pengajuan', icon: ClipboardDocumentListIcon },
        ]
    },
    {
        title: 'SDM & Payroll',
        items: [
            { name: 'Absensi Guru', href: '/absensi', icon: ClipboardDocumentListIcon },
            { name: 'Komponen Gaji', href: '/komponen-gaji', icon: QueueListIcon },
            { name: 'Penugasan Gaji', href: '/penugasan-gaji', icon: BriefcaseIcon },
            { name: 'Penggajian', href: '/penggajian', icon: CalculatorIcon },
        ]
    },
    {
        title: 'Laporan',
        items: [
            { name: 'Laporan Finansial', href: '/laporan', icon: ChartBarIcon },
            { name: 'Tunggakan', href: '/tunggakan-dashboard', icon: ExclamationTriangleIcon },
            { name: 'Variance RKAS', href: '/laporan-rkas/variance', icon: ChartBarIcon },
            { name: 'Cash Flow RKAS', href: '/laporan-rkas/cash-flow', icon: ArrowTrendingUpIcon },
            { name: 'Rekap Gaji', href: '/laporan-payroll/rekap', icon: CalculatorIcon },
            { name: 'Mutasi Potongan', href: '/laporan-payroll/mutasi-potongan', icon: ClipboardDocumentListIcon },
            { name: 'Audit Kepegawaian', href: '/laporan-payroll/audit-kepegawaian', icon: DocumentTextIcon },
        ]
    },
    {
        title: 'Pengaturan',
        items: [
            { name: 'Profil Sekolah', href: '/pengaturan-sekolah', icon: BuildingOfficeIcon },
        ]
    },
];

export default function AppLayout({ children, title }) {
    const { url } = usePage();
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar-collapsed') === 'true';
        }
        return false;
    });

    const navRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    }, [isCollapsed]);

    // Persist sidebar scroll position
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;

        // Restore position
        const savedScroll = sessionStorage.getItem('sidebar-scroll');
        if (savedScroll) {
            nav.scrollTop = parseInt(savedScroll, 10);
        }

        const handleScroll = () => {
            sessionStorage.setItem('sidebar-scroll', nav.scrollTop);
        };

        nav.addEventListener('scroll', handleScroll);
        return () => nav.removeEventListener('scroll', handleScroll);
    }, []);

    function logout(e) {
        e.preventDefault();
        router.post('/logout');
    }

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 h-full',
                    isCollapsed ? 'w-20' : 'w-72',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full w-72 lg:w-auto'
                )}
            >
                {/* Logo Section */}
                <div className={clsx(
                    "flex h-20 items-center border-b border-gray-100 transition-all duration-300 shrink-0",
                    isCollapsed ? "px-0 justify-center" : "px-6 gap-3"
                )}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-blue shadow-lg shadow-brand-blue/20 shrink-0">
                        <span className="text-white text-sm font-black tracking-tighter">TK</span>
                    </div>
                    {!isCollapsed && (
                        <div className="leading-none flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 tracking-tight">SI ERP</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate">TK Attauhid</p>
                        </div>
                    )}
                    <button
                        className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Nav Container */}
                <nav 
                    ref={navRef}
                    className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-6 overscroll-contain"
                >
                    {navigationGroups.map((group, idx) => (
                        <div key={group.title} className={clsx(idx > 0 && "mt-8")}>
                            {!isCollapsed && (
                                <h3 className="px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                    {group.title}
                                </h3>
                            )}
                            {isCollapsed && idx > 0 && <div className="mx-6 border-t border-gray-100 mb-4" />}
                            
                            <ul className="space-y-1 px-3">
                                {group.items.map((item) => {
                                    const active = url === item.href
                                        || (item.href !== '/' && url.startsWith(item.href));
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={clsx(
                                                    'relative flex items-center gap-3 rounded-2xl transition-all duration-200 group',
                                                    isCollapsed ? 'justify-center p-3' : 'px-5 py-3',
                                                    active
                                                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                )}
                                                title={isCollapsed ? item.name : ''}
                                            >
                                                <item.icon className={clsx(
                                                    "shrink-0 transition-transform duration-200",
                                                    isCollapsed ? "h-6 w-6" : "h-5 w-5",
                                                    !active && "group-hover:scale-110"
                                                )} />
                                                {!isCollapsed && (
                                                    <span className="text-xs font-bold tracking-tight truncate">{item.name}</span>
                                                )}
                                                {active && !isCollapsed && (
                                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white opacity-50" />
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Collapse Toggle (Desktop Only) */}
                <div className="hidden lg:flex px-3 py-4 border-t border-gray-100 shrink-0">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center justify-center w-full py-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all group"
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <ChevronLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sembunyikan Menu</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* User footer */}
                <div className={clsx(
                    "border-t border-gray-100 transition-all duration-300 shrink-0",
                    isCollapsed ? "p-4" : "p-6"
                )}>
                    <div className={clsx("flex items-center", isCollapsed ? "justify-center" : "gap-4")}>
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-900 text-white text-xs font-black shrink-0 shadow-lg shadow-gray-200">
                            {auth?.user?.name?.charAt(0) ?? '?'}
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-black text-gray-900 truncate tracking-tight">{auth?.user?.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold truncate uppercase tracking-tighter">Administrator</p>
                            </div>
                        )}
                        {!isCollapsed && (
                            <button
                                onClick={logout}
                                title="Logout"
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden bg-[#fafafa]">
                {/* Top bar (Mobile only or for sticky headers) */}
                <header className="lg:hidden sticky top-0 z-30 flex h-16 items-center gap-4 bg-white border-b border-gray-100 px-4 shrink-0">
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest truncate">{title || 'SI ERP TK'}</h1>
                </header>

                <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar overscroll-contain h-full">
                    <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12">
                        {children}
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
                .overscroll-contain {
                    overscroll-behavior: contain;
                }
            `}} />
        </div>
    );
}
