'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
    CreditCard,
    Dumbbell,
    TrendingUp,
    Clock,
    Target,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { Card, StatCard, Badge, Spinner } from '@/components/ui';
import { dashboardAPI } from '@/lib/api';
import { formatCurrency, formatDate, getDaysRemaining, formatRelativeTime } from '@/lib/utils';
import type { MemberDashboard } from '@/types';

export default function MemberDashboardPage() {
    const [data, setData] = useState<MemberDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await dashboardAPI.getMember();
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

    const membership = data.membership;
    const daysRemaining = membership ? getDaysRemaining(membership.endDate) : 0;

    return (
        <div className="space-y-6">
            {/* Membership Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10" />
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-sm text-zinc-500 mb-1">Current Membership</p>
                            <h2 className="text-2xl font-bold text-white">
                                {membership?.plan?.name || 'No Active Plan'}
                            </h2>
                            {membership && (
                                <p className="text-zinc-400 mt-1">
                                    Valid until {formatDate(membership.endDate)}
                                </p>
                            )}
                        </div>

                        {membership && (
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-orange-500">{daysRemaining}</p>
                                    <p className="text-sm text-zinc-500">Days Left</p>
                                </div>
                                <div className="h-16 w-px bg-zinc-800" />
                                <div className="text-center">
                                    <Badge
                                        variant={
                                            membership.status === 'ACTIVE'
                                                ? 'success'
                                                : membership.status === 'FROZEN'
                                                    ? 'info'
                                                    : 'danger'
                                        }
                                        className="text-base px-4 py-1"
                                    >
                                        {membership.status}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Progress bar for days remaining */}
                    {membership && (
                        <div className="mt-6">
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${Math.min(100, (daysRemaining / membership.plan!.durationDays) * 100)}%`,
                                    }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                />
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <StatCard
                        title="This Month Visits"
                        value={data.attendance.thisMonth}
                        icon={<Calendar size={24} />}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <StatCard
                        title="Current Weight"
                        value={data.progress[0]?.weight ? `${data.progress[0].weight} kg` : 'N/A'}
                        icon={<TrendingUp size={24} />}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <StatCard
                        title="Active Workout"
                        value={data.workout?.workoutPlan?.name || 'None'}
                        icon={<Dumbbell size={24} />}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <StatCard
                        title="Total Spent"
                        value={formatCurrency(
                            data.payments.reduce((acc, p) => acc + Number(p.amount), 0)
                        )}
                        icon={<CreditCard size={24} />}
                    />
                </motion.div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Today's Workout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Dumbbell className="text-orange-500" size={20} />
                                Today&apos;s Workout
                            </h3>
                            <Link href="/member/workouts" className="text-sm text-orange-500 hover:text-orange-400">
                                View all →
                            </Link>
                        </div>

                        {data.workout ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">{data.workout.workoutPlan?.name}</p>
                                        <p className="text-sm text-zinc-500">{data.workout.workoutPlan?.type}</p>
                                    </div>
                                    <Badge>{data.workout.workoutPlan?.daysPerWeek} days/week</Badge>
                                </div>

                                <Link
                                    href="/member/workouts"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800/50 rounded-xl text-orange-500 hover:bg-zinc-800 transition-colors"
                                >
                                    Start Workout
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                <p className="text-zinc-500">No workout plan assigned yet</p>
                                <p className="text-sm text-zinc-600 mt-1">Contact your trainer to get one</p>
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Recent Attendance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="text-orange-500" size={20} />
                                Recent Visits
                            </h3>
                            <Link href="/member/attendance" className="text-sm text-orange-500 hover:text-orange-400">
                                View all →
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {data.attendance.recent.length === 0 ? (
                                <p className="text-zinc-500 text-center py-4">No visits recorded yet</p>
                            ) : (
                                data.attendance.recent.slice(0, 5).map((record) => (
                                    <div
                                        key={record.id}
                                        className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl"
                                    >
                                        <div>
                                            <p className="text-sm text-white">{formatDate(record.checkInTime)}</p>
                                            <p className="text-xs text-zinc-500">
                                                {new Date(record.checkInTime).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                                {record.checkOutTime &&
                                                    ` - ${new Date(record.checkOutTime).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}`}
                                            </p>
                                        </div>
                                        <Badge variant={record.method === 'QR' ? 'info' : 'default'}>
                                            {record.method}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Weight Progress */}
            {data.progress.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <TrendingUp className="text-orange-500" size={20} />
                                Weight Progress
                            </h3>
                            <Link href="/member/progress" className="text-sm text-orange-500 hover:text-orange-400">
                                View all →
                            </Link>
                        </div>

                        <div className="flex items-center gap-8 overflow-x-auto pb-2">
                            {data.progress.slice(0, 5).reverse().map((record, index) => (
                                <div key={record.id} className="flex flex-col items-center min-w-[80px]">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-2">
                                        <span className="text-lg font-bold text-white">{record.weight}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">{formatDate(record.recordedAt)}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
