'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Calendar,
    Dumbbell,
    ImageIcon,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Bell,
    Search,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { Avatar, Button, BrandLogo } from '@/components/ui';
import { getInitials } from '@/lib/utils';

const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/plans', label: 'Plans', icon: CreditCard },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/attendance', label: 'Attendance', icon: Calendar },
    { href: '/admin/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated, isLoading } = useAuthStore();
    const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Auth check
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        } else if (!isLoading && user?.role !== 'ADMIN') {
            router.push('/member');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [pathname, setSidebarOpen]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-700 border-t-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-orange-500/30">
            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full w-72 glass border-r border-white/5 z-50 transform transition-all duration-500 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                    <Link href="/admin" className="flex items-center gap-4 group">
                        <BrandLogo variant="default" className="w-40" />
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 mt-4 space-y-2 h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                    {adminNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                                    ? 'bg-gradient-to-r from-orange-500/20 to-transparent text-white border border-orange-500/20 shadow-lg shadow-orange-500/5'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full"
                                    />
                                )}
                                <item.icon size={20} className={`${isActive ? 'text-orange-500' : 'group-hover:text-orange-400'} transition-colors duration-300`} />
                                <span className="font-medium tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section (Sidebar Bottom) */}
                <div className="absolute bottom-6 left-6 right-6 p-4 glass-card rounded-2xl border border-white/5 flex items-center gap-3">
                    <Avatar
                        src={user?.profilePhoto}
                        fallback={getInitials(user?.fullName || 'A')}
                        size="sm"
                        className="border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Admin</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                {/* Copyright */}
                <div className="absolute bottom-1 w-full text-center pb-2">
                    <p className="text-[10px] text-zinc-600">© 2026 Nazen Gym</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-72 relative min-h-screen z-10">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-20 bg-[#020617]/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 lg:px-10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-white tracking-tight">
                                {adminNavItems.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Overview'}
                            </h2>
                            <p className="text-xs text-zinc-500 font-medium">System operational</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar - Premium Style */}
                        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/5 focus-within:border-orange-500/30 rounded-2xl px-5 py-2.5 w-72 transition-all duration-300">
                            <Search size={18} className="text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Universal Search..."
                                className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 w-full font-medium"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50" />
                        </button>

                        <div className="h-10 w-px bg-white/5 hidden sm:block" />

                        {/* Quick Action Button */}
                        <Button
                            onClick={() => router.push('/admin/members')}
                            size="sm"
                            className="btn-premium hidden sm:flex items-center gap-2"
                        >
                            <span className="text-xs font-bold uppercase tracking-wider">New Member</span>
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 lg:p-10 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
