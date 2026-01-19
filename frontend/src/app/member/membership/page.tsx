'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Calendar, Shield } from 'lucide-react';
import { Card, Badge, Spinner } from '@/components/ui';
import { useAuthStore } from '@/store';
import { formatDate, formatCurrency, getDaysRemaining } from '@/lib/utils';
import { paymentsAPI } from '@/lib/api';
import type { Payment } from '@/types';

export default function MembershipPage() {
    const { user } = useAuthStore();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const membership = user?.member?.memberships?.[0];
    const daysRemaining = membership ? getDaysRemaining(membership.endDate) : 0;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await paymentsAPI.getMyPayments();
                setPayments(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (!membership) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Shield size={64} className="text-zinc-700 mb-4" />
                <h2 className="text-2xl font-bold text-white">No Active Membership</h2>
                <p className="text-zinc-500 mt-2">Contact the admin to activate your plan.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-white">My <span className="text-orange-500">Membership</span></h1>
                <p className="text-zinc-500 mt-2">Manage your plan and billing history.</p>
            </div>

            {/* Current Plan Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-0 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-black to-black opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="p-8 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-zinc-400 font-medium uppercase tracking-wider text-xs mb-1">Current Plan</h3>
                                <h2 className="text-3xl font-black text-white">{membership.plan?.name}</h2>
                            </div>
                            <Badge variant={membership.status === 'ACTIVE' ? 'success' : 'error'}>{membership.status}</Badge>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-orange-500" size={20} />
                                <div>
                                    <p className="text-sm text-zinc-400">Valid Until</p>
                                    <p className="text-white font-medium">{formatDate(membership.endDate)}</p>
                                </div>
                            </div>
                            <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-zinc-400 text-sm">Days Remaining</span>
                                    <span className="text-2xl font-bold text-white">{daysRemaining}</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (daysRemaining / (membership.plan?.durationDays || 30)) * 100)}%` }}
                                        className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {membership.plan?.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                                    <CheckCircle size={16} className="text-green-500" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Payment History */}
                <Card title="Payment History" icon={<CreditCard size={20} className="text-orange-500" />}>
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                        {loading ? (
                            <div className="py-8 flex justify-center"><Spinner /></div>
                        ) : payments.length === 0 ? (
                            <p className="text-zinc-500 text-center py-8">No payment history found.</p>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{payment.membership?.plan?.name || 'Payment'}</p>
                                                <p className="text-xs text-zinc-500 font-mono">{formatDate(payment.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold">{formatCurrency(Number(payment.amount))}</p>
                                            <span className={`text-[10px] font-bold ${payment.status === 'COMPLETED' ? 'text-green-500' : 'text-orange-500'}`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
