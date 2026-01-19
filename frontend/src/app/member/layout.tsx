'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CreditCard,
    Calendar,
    Dumbbell,
    TrendingUp,
    ImageIcon,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Bell,
    QrCode,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { settingsAPI } from '@/lib/api';
import { Avatar, Button, Badge } from '@/components/ui';
import { getInitials, getDaysRemaining } from '@/lib/utils';

const memberNavItems = [
    { href: '/member', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/member/membership', label: 'Membership', icon: CreditCard },
    { href: '/member/attendance', label: 'Attendance', icon: Calendar },
    { href: '/member/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/member/progress', label: 'Progress', icon: TrendingUp },
    { href: '/member/gallery', label: 'Gallery', icon: ImageIcon },
];

export default function MemberLayout({
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
        } else if (!isLoading && user?.role === 'ADMIN') {
            router.push('/admin');
        }
    }, [isLoading, isAuthenticated, user, router]);

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [pathname, setSidebarOpen]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isLoading || !isAuthenticated || user?.role !== 'MEMBER') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-700 border-t-orange-500" />
            </div>
        );
    }

    const membership = user.member?.memberships?.[0];
    const daysRemaining = membership ? getDaysRemaining(membership.endDate) : 0;

    return (
        <div className="min-h-screen bg-black">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-zinc-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
                    <Link href="/member" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="Nazen Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <span className="font-bold text-white">Nazen</span>
                            <span className="text-zinc-500 text-xs block -mt-0.5">Member Portal</span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-zinc-500 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Membership Status */}
                {membership && (
                    <div className="p-4 border-b border-zinc-800">
                        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-3">
                            <p className="text-xs text-zinc-400 mb-1">{membership.plan?.name}</p>
                            <div className="flex items-center justify-between">
                                <Badge variant={membership.status === 'ACTIVE' ? 'success' : 'warning'}>
                                    {membership.status}
                                </Badge>
                                <span className="text-sm text-orange-500 font-medium">
                                    {daysRemaining} days left
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {memberNavItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/member' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-500 border border-orange-500/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>

                {/* Copyright */}
                <div className="absolute bottom-1 w-full text-center pb-2">
                    <p className="text-[10px] text-zinc-600">© 2026 Nazen Gym</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 h-16 bg-black/80 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden text-zinc-400 hover:text-white"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-semibold text-white hidden sm:block">
                            Welcome, {user?.fullName?.split(' ')[0]}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* QR Code */}
                        <Link
                            href="/member/qr"
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                            <QrCode size={20} />
                        </Link>

                        {/* Notifications */}
                        <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
                            <Bell size={20} />
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 hover:bg-zinc-800 rounded-xl px-3 py-2 transition-colors"
                            >
                                <Avatar
                                    src={user?.profilePhoto}
                                    fallback={getInitials(user?.fullName || 'M')}
                                    size="sm"
                                />
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-white">{user?.fullName}</p>
                                    <p className="text-xs text-zinc-500">{user?.member?.memberId}</p>
                                </div>
                                <ChevronDown size={16} className="text-zinc-500" />
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
                                    >
                                        <Link
                                            href="/member/profile"
                                            className="block px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                        >
                                            Profile Settings
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
