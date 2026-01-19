'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, CheckCircle2, Trash2, Edit2, X, Save } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

import { Card, Button, Badge, StatCard, Spinner, EmptyState, Input } from '@/components/ui';
import { plansAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { MembershipPlan } from '@/types';

// --- Schema ---
const planSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    durationDays: z.coerce.number().min(1, 'Duration must be at least 1 day'),
    basePrice: z.coerce.number().min(0, 'Price must be positive'),
    description: z.string().optional(),
    features: z.array(z.object({ value: z.string() })).optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

export default function PlansPage() {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await plansAPI.getAll();
            // Handle both structure types just in case: { data: [...] } or { data: { data: [...] } }
            const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data.data) ? res.data.data : []);
            setPlans(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan? Clients on this plan will NOT be affected, but new sales will stop.')) return;
        try {
            await plansAPI.delete(id);
            toast.success('Plan deleted successfully');
            fetchPlans();
        } catch (error) {
            toast.error('Failed to delete plan');
        }
    };

    const handleEdit = (plan: MembershipPlan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Membership <span className="text-orange-500 glow-text-orange">Plans</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium tracking-wide">
                        Configure and manage subscription tiers for your athletes.
                    </p>
                </div>
                <Button onClick={handleCreate} className="btn-premium group">
                    <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Create New Plan
                </Button>
            </div>

            {/* Quick Stats (Computed from current plans) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Active Plans"
                    value={plans.length}
                    icon={<CreditCard size={20} />}
                    color="orange"
                />
                <StatCard
                    title="Avg Price"
                    value={plans.length > 0 ? formatCurrency(plans.reduce((acc, p) => acc + Number(p.finalPrice || p.basePrice), 0) / plans.length) : '₹0'}
                    icon={<CreditCard size={20} />}
                    color="blue"
                />
            </div>

            {/* Plans Grid */}
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            ) : plans.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                    <EmptyState
                        title="No Active Plans"
                        description="Create a membership tier to get started."
                        icon={<CreditCard size={48} className="text-zinc-700 mb-4" />}
                        action={
                            <Button onClick={handleCreate} variant="outline" className="mt-4">
                                Create First Plan
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="h-full"
                        >
                            <Card variant="glass" hover className="relative group overflow-hidden h-full flex flex-col">
                                <div className="mb-8 p-1">
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white glow-text-orange">
                                            {formatCurrency(plan.finalPrice || plan.basePrice)}
                                        </span>
                                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                            / {plan.durationDays} Days
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 text-xs mt-2 line-clamp-2 min-h-[2.5em]">
                                        {plan.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    {plan.features && plan.features.slice(0, 5).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm text-zinc-400">
                                            <div className="w-5 h-5 min-w-[1.25rem] rounded-full bg-orange-500/10 flex items-center justify-center">
                                                <CheckCircle2 size={12} className="text-orange-500" />
                                            </div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-3">
                                    <div className="flex flex-col mr-auto">
                                        <span className="text-white font-bold">--</span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Active</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                        <Trash2 size={16} />
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(plan)}>
                                        <Edit2 size={14} className="mr-2" /> Modify
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )
            }

            {/* Create/Edit Modal */}
            <PlanModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingPlan}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchPlans();
                }}
            />
        </div >
    );
}

// --- Plan Modal Component ---

function PlanModal({ isOpen, onClose, initialData, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    initialData: MembershipPlan | null;
    onSuccess: () => void;
}) {
    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: '',
            durationDays: 30,
            basePrice: 0,
            description: '',
            features: [{ value: 'Gym Access' }, { value: 'Locker Access' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "features"
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    durationDays: initialData.durationDays,
                    basePrice: initialData.basePrice,
                    description: initialData.description || '',
                    features: initialData.features?.map(f => ({ value: f })) || []
                });
            } else {
                reset({
                    name: '',
                    durationDays: 30,
                    basePrice: 0,
                    description: '',
                    features: [{ value: 'Gym Access' }]
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = async (data: PlanFormValues) => {
        try {
            const formattedData = {
                ...data,
                features: data.features?.map(f => f.value).filter(Boolean) || []
            };

            if (initialData) {
                await plansAPI.update(initialData.id, formattedData);
                toast.success('Plan updated successfully');
            } else {
                await plansAPI.create(formattedData);
                toast.success('Plan created successfully');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save plan');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#09090b] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 sticky top-0 z-10 backdrop-blur-md">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">{initialData ? 'Edit Plan' : 'New Plan'}</h2>
                        <p className="text-zinc-500 text-xs mt-0.5">{initialData ? 'Modify existing tier' : 'Create a new membership tier'}</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-zinc-400 hover:text-white" /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Plan Name"
                            placeholder="e.g. Gold Tier"
                            {...register('name')}
                            error={errors.name?.message}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="number"
                                label="Duration (Days)"
                                {...register('durationDays')}
                                error={errors.durationDays?.message}
                            />
                            <Input
                                type="number"
                                label="Price (₹)"
                                {...register('basePrice')}
                                error={errors.basePrice?.message}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                            <textarea
                                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-20"
                                placeholder="Brief description of the plan..."
                                {...register('description')}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Features</label>
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <input
                                            {...register(`features.${index}.value`)}
                                            className="flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="Feature description"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" size="sm" onClick={() => append({ value: '' })} className="w-full mt-2">
                                    <Plus size={14} className="mr-2" /> Add Feature
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                        <Button type="button" variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="btn-premium w-full">
                            {isSubmitting ? <Spinner size="sm" /> : (initialData ? 'Save Changes' : 'Create Plan')}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

