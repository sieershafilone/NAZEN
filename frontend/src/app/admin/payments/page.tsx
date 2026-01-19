'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ArrowUpRight, ArrowDownRight, Download, Filter, Search as SearchIcon, Plus, Trash2, X, Check, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

import { Card, Button, Badge, StatCard, Spinner, EmptyState } from '@/components/ui';
import { paymentsAPI, membersAPI, plansAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Payment, Member, MembershipPlan } from '@/types';

// --- Types & Schemas ---

const transactionSchema = z.object({
    memberId: z.string().min(1, 'Member is required'),
    planId: z.string().min(1, 'Plan is required'),
    paymentMethod: z.enum(['CASH', 'UPI', 'BANK_TRANSFER']),
    notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function PaymentsPage() {
    // --- State ---
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showRecordModal, setShowRecordModal] = useState(false);

    // Stats State (Mocked for now, can be computed from real data)
    const stats = {
        totalRevenue: payments.reduce((acc, p) => acc + Number(p.amount), 0),
        pending: 0, // In this system, we mostly record completed payments
        refunds: 0,
        avgCheck: payments.length > 0 ? payments.reduce((acc, p) => acc + Number(p.amount), 0) / payments.length : 0
    };

    // --- Fetch Data ---
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await paymentsAPI.getAll();
            setPayments(response.data.data.payments);
        } catch (error) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // --- Handlers ---
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(payments.map(p => p.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} transaction(s)? This cannot be undone.`)) return;

        try {
            await Promise.all(Array.from(selectedIds).map(id => paymentsAPI.delete(id)));
            toast.success('Transactions deleted successfully');
            setSelectedIds(new Set());
            fetchPayments();
        } catch (error) {
            toast.error('Failed to delete transactions');
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Financial <span className="text-orange-500 glow-text-orange">Pulse</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium tracking-wide">
                        Monitor revenue streams and transaction history.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="group hidden sm:flex">
                        <Download size={18} className="mr-2 group-hover:text-blue-500 transition-colors" />
                        Export Reports
                    </Button>
                    <Button onClick={() => setShowRecordModal(true)} className="btn-premium shadow-lg shadow-orange-500/20">
                        <Plus size={18} className="mr-2" />
                        Record Transaction
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<CreditCard size={18} />} color="orange" />
                <StatCard title="Pending" value={formatCurrency(stats.pending)} icon={<CreditCard size={18} />} color="blue" />
                <StatCard title="Refunds" value={formatCurrency(stats.refunds)} icon={<ArrowDownRight size={18} />} color="purple" />
                <StatCard title="Avg Check" value={formatCurrency(stats.avgCheck)} icon={<ArrowUpRight size={18} />} color="green" />
            </div>

            {/* Content Area */}
            <Card variant="glass" className="overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/30">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <h2 className="text-xl font-bold text-white tracking-tight">Recent Transactions</h2>
                        {selectedIds.size > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleDeleteSelected}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-bold"
                            >
                                <Trash2 size={14} /> Delete ({selectedIds.size})
                            </motion.button>
                        )}
                    </div>
                    <div className="flex items-center gap-4 bg-black/40 rounded-xl px-4 py-2 border border-white/5 w-full sm:w-64 focus-within:border-orange-500/50 transition-colors">
                        <SearchIcon size={16} className="text-zinc-500" />
                        <input type="text" placeholder="Find transaction..." className="bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 w-full" />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Spinner size="lg" />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="h-64 flex items-center justify-center">
                            <EmptyState
                                title="No Transactions"
                                description="Record a new transaction to see it here."
                                icon={<CreditCard size={48} className="text-zinc-700 mb-4" />}
                            />
                        </div>
                    ) : (
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th className="w-12 text-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={payments.length > 0 && selectedIds.size === payments.length}
                                            className="rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-0 checked:bg-orange-500 checked:border-orange-500"
                                        />
                                    </th>
                                    <th>Transaction ID</th>
                                    <th>Member</th>
                                    <th>Status</th>
                                    <th className="text-right">Amount</th>
                                    <th>Date</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="group">
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(payment.id)}
                                                onChange={() => handleSelectRow(payment.id)}
                                                className="rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-0"
                                            />
                                        </td>
                                        <td className="font-mono text-zinc-400 text-xs">
                                            {payment.invoiceNumber}
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{payment.member?.user?.fullName || 'Unknown'}</span>
                                                <span className="text-[10px] text-zinc-500 font-mono">{payment.member?.memberId}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant={payment.status === 'COMPLETED' ? 'success' : 'warning'}>{payment.status}</Badge>
                                        </td>
                                        <td className="text-right">
                                            <span className="text-sm font-bold text-white glow-text-orange tabular-nums font-mono">{formatCurrency(Number(payment.amount))}</span>
                                        </td>
                                        <td className="text-xs font-medium text-zinc-500 tabular-nums font-mono">
                                            {formatDate(payment.createdAt)}
                                        </td>
                                        <td className="text-center">
                                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                                                <ArrowUpRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Record Transaction Modal */}
            <RecordTransactionModal
                isOpen={showRecordModal}
                onClose={() => setShowRecordModal(false)}
                onSuccess={() => {
                    fetchPayments();
                    setShowRecordModal(false);
                }}
            />
        </div>
    );
}

// --- Record Transaction Modal Component ---

function RecordTransactionModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            paymentMethod: 'CASH'
        }
    });

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                const [mRes, pRes] = await Promise.all([membersAPI.getAll({ limit: 100 }), plansAPI.getAll()]);
                setMembers(mRes.data.data.members || []);
                setPlans(pRes.data.data || []);
            };
            loadData();
        }
    }, [isOpen]);

    const onSubmit = async (data: TransactionFormValues) => {
        try {
            await paymentsAPI.createManual(data);
            toast.success('Transaction recorded');
            onSuccess();
        } catch (error) {
            toast.error('Failed to record transaction');
        }
    };

    const selectedPlanId = watch('planId');
    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#09090b] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">Record Transaction</h2>
                        <p className="text-zinc-500 text-xs mt-0.5">Manually log a payment</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-zinc-400 hover:text-white" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">Select Member</label>
                            <select {...register('memberId')} className="input-premium w-full">
                                <option value="">-- Choose Member --</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.user?.fullName} ({m.memberId})</option>
                                ))}
                            </select>
                            {errors.memberId && <span className="text-red-500 text-xs">{errors.memberId.message}</span>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">Select Plan</label>
                            <select {...register('planId')} className="input-premium w-full">
                                <option value="">-- Choose Plan --</option>
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - ₹{p.finalPrice}</option>
                                ))}
                            </select>
                            {errors.planId && <span className="text-red-500 text-xs">{errors.planId.message}</span>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">Payment Method</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['CASH', 'UPI', 'BANK_TRANSFER'].map(method => (
                                    <label key={method} className="cursor-pointer">
                                        <input type="radio" value={method} {...register('paymentMethod')} className="peer sr-only" />
                                        <div className="p-2 text-center rounded-lg border border-white/10 bg-zinc-900 peer-checked:bg-white peer-checked:text-black peer-checked:border-white transition-all text-xs font-bold hover:bg-zinc-800">
                                            {method.replace('_', ' ')}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {selectedPlan && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-orange-200 text-sm font-medium">Total Amount</span>
                                <span className="text-orange-500 text-xl font-black">₹{selectedPlan.finalPrice}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                        <Button type="button" variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="btn-premium w-full">
                            {isSubmitting ? <Spinner size="sm" /> : 'Record Payment'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
