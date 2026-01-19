'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Users,
    CreditCard,
    TrendingUp,
    UserCheck,
    Calendar,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Settings,
} from 'lucide-react';
import { Card, StatCard, Badge, Avatar, Spinner } from '@/components/ui';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency, formatDate, formatRelativeTime, getDaysRemaining, getInitials } from '@/lib/utils';
import type { AdminDashboard } from '@/types';

export default function AdminDashboardPage() {
    const [data, setData] = useState<AdminDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardAPI.getAdmin();
                setData(response.data.data);
            } catch (error) {
                console.error('Failed to load dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500">Failed to load dashboard data</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Command <span className="text-orange-500 glow-text-orange">Center</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium tracking-wide">
                        Real-time analytics and management for <span className="text-white">Nazen Gym</span>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 glass-card rounded-xl border border-white/5 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Live System</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Base', value: data.members.total, icon: Users, color: 'orange', delay: 0.1 },
                    { label: 'Active Squad', value: data.members.active, icon: UserCheck, color: 'blue', delay: 0.2, trend: `${Math.round((data.members.active / Math.max(data.members.total, 1)) * 100)}%` },
                    { label: 'Check-ins Today', value: data.attendance.today, icon: Calendar, color: 'green', delay: 0.3 },
                    { label: 'Monthly Revenue', value: formatCurrency(data.revenue.thisMonth), icon: CreditCard, color: 'purple', delay: 0.4, trend: `${data.revenue.growth > 0 ? '+' : ''}${data.revenue.growth}%` },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: stat.delay }}
                        className="group relative"
                    >
                        <div className={`absolute inset-0 bg-${stat.color}-500/5 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="relative glass border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all duration-300">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-2xl bg-white/5 text-${stat.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon size={24} />
                                </div>
                                {stat.trend && (
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-900 border border-white/5 ${stat.color === 'orange' ? 'text-orange-500' : 'text-zinc-400'}`}>
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <div className="mt-6">
                                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">{stat.value}</h3>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Payments - 2/3 width on large screens */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2"
                >
                    <div className="glass border border-white/5 rounded-[2rem] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Financial Pulse</h2>
                                <p className="text-xs text-zinc-500 font-medium">Tracking recent membership transactions</p>
                            </div>
                            <Link href="/admin/payments" className="btn-premium py-2 px-4 shadow-none text-xs tracking-widest uppercase">
                                History
                            </Link>
                        </div>

                        <div className="p-4 overflow-x-auto">
                            <table className="premium-table">
                                <thead>
                                    <tr className="bg-transparent hover:!bg-transparent hover:!transform-none">
                                        <th className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Member</th>
                                        <th className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Plan</th>
                                        <th className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Amount</th>
                                        <th className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Status</th>
                                        <th className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-10 text-zinc-600 font-medium">No financial activity recorded today.</td>
                                        </tr>
                                    ) : (
                                        data.recentPayments.map((payment) => (
                                            <tr key={payment.id} className="group">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            fallback={getInitials(payment.member?.user?.fullName || 'M')}
                                                            size="sm"
                                                            className="border border-white/10"
                                                        />
                                                        <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                                                            {payment.member?.user?.fullName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-xs font-medium text-zinc-400 bg-white/5 px-2 py-1 rounded-md">
                                                        {payment.membership?.plan?.name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-sm font-bold text-white glow-text-orange font-mono">
                                                        {formatCurrency(payment.amount)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Badge variant="success" className="text-[10px] font-bold tracking-widest uppercase py-0.5 px-2">Paid</Badge>
                                                </td>
                                                <td>
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tabular-nums font-mono">
                                                        {formatRelativeTime(payment.createdAt)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {/* Sidebar Alerts - 1/3 width */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="glass border border-white/5 rounded-[2rem] p-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    <AlertCircle className="text-orange-500" size={18} />
                                    Expiring
                                </h2>
                                <p className="text-xs text-zinc-500 font-medium">Immediate action required</p>
                            </div>
                            <span className="text-sm font-black text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full">
                                {data.expiringMemberships.length}
                            </span>
                        </div>

                        <div className="space-y-5">
                            {data.expiringMemberships.length === 0 ? (
                                <p className="text-zinc-600 text-sm text-center py-6 font-medium">System clear. No pending expiries.</p>
                            ) : (
                                data.expiringMemberships.slice(0, 4).map((membership) => {
                                    const daysLeft = getDaysRemaining(membership.endDate);
                                    return (
                                        <div
                                            key={membership.id}
                                            className="group flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-orange-500/30 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    fallback={getInitials(membership.member?.user?.fullName || 'M')}
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                                                        {membership.member?.user?.fullName}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                                        {membership.member?.user?.mobile}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${daysLeft <= 3 ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                                                    {daysLeft}d left
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Add Member', icon: Users, href: '/admin/members?action=add', color: 'orange' },
                            { label: 'Attendance', icon: Calendar, href: '/admin/attendance', color: 'green' },
                            { label: 'Payments', icon: CreditCard, href: '/admin/payments?action=add', color: 'blue' },
                            { label: 'Settings', icon: Settings, href: '/admin/settings', color: 'purple' },
                        ].map((action, i) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="glass border border-white/5 p-5 rounded-2xl flex flex-col items-center gap-3 hover:border-white/20 transition-all group"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/10 flex items-center justify-center text-${action.color}-500 group-hover:scale-110 transition-transform`}>
                                    <action.icon size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
