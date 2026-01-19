'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Shield,
    Users,
    Activity,
    Dumbbell,
    X,
    Check,
    ChevronDown,
    Save,
    Calendar,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react';
import { Button, Card, Input, Badge, Avatar, Spinner, EmptyState, StatCard } from '@/components/ui';
import { membersAPI, plansAPI } from '@/lib/api';
import { formatDate, getInitials, getDaysRemaining } from '@/lib/utils';
import type { Member, MembershipPlan } from '@/types';
import toast from 'react-hot-toast';

// --- Validation Schemas ---
const memberSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit number'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    height: z.string().optional(),
    weight: z.string().optional(),
    fitnessGoal: z.string().optional(),
    emergencyContact: z.string().optional(),
    planId: z.string().min(1, 'Please select a membership plan'),
});

type MemberFormValues = z.infer<typeof memberSchema>;

export default function MembersPage() {
    // --- State ---
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'FROZEN'>('ALL');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    // --- Data Fetching ---
    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await membersAPI.getAll({ search, page, limit: 10 });
            let filteredMembers = response.data.data.members;

            if (statusFilter !== 'ALL') {
                filteredMembers = filteredMembers.filter((m: Member) => {
                    const status = m.memberships?.[0]?.status || 'EXPIRED';
                    return status === statusFilter;
                });
            }

            setMembers(filteredMembers);
            setTotalPages(response.data.data.pagination.totalPages);
        } catch (error) {
            toast.error('Failed to load roster');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await plansAPI.getAll();
            setPlans(response.data.data.filter((p: MembershipPlan) => p.isActive));
        } catch (error) {
            console.error('Failed to load plans');
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [search, page, statusFilter]);

    useEffect(() => {
        fetchPlans();
    }, []);

    // --- Actions ---
    const handleDelete = async (id: string) => {
        if (!confirm('This action cannot be undone. Archive this athlete?')) return;
        try {
            await membersAPI.delete(id);
            toast.success('Archived athlete successfully');
            fetchMembers();
        } catch (error) {
            toast.error('Failed to archive');
        }
    };

    const handleView = async (id: string) => {
        try {
            const response = await membersAPI.getById(id);
            setSelectedMember(response.data.data);
            setShowViewModal(true);
        } catch (error) {
            toast.error('Could not fetch details');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase sm:text-5xl">
                        Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Roster</span>
                    </h1>
                    <p className="text-zinc-400 font-medium tracking-wide max-w-xl">
                        Command center for athlete management. Monitor performance, track memberships, and manage access protocols.
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="h-14 px-8 bg-white text-black hover:bg-orange-500 hover:text-white transition-all duration-300 font-black tracking-wider uppercase rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
                >
                    <Plus size={20} className="mr-2" />
                    Induct Athlete
                </Button>
            </div>

            {/* --- Stats Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Athletes" value={members.length.toString()} icon={<Users size={16} />} color="blue" />
                <StatCard title="Active Protocols" value="12" icon={<Activity size={16} />} color="green" />
                <StatCard title="Performance Risk" value="3" icon={<Dumbbell size={16} />} color="purple" />
                <StatCard title="Pending Review" value="5" icon={<Shield size={16} />} color="orange" />
            </div>

            {/* --- Controls & Filter Bar --- */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Code name, ID or Comms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-600 font-medium"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {(['ALL', 'ACTIVE', 'EXPIRED', 'FROZEN'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${statusFilter === status
                                ? 'bg-white text-black shadow-lg scale-105'
                                : 'bg-black/40 text-zinc-500 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Data Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full h-96 flex items-center justify-center">
                        <Spinner size="lg" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="col-span-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                        <EmptyState
                            icon={<Users size={48} className="text-zinc-700 mb-4" />}
                            title="Roster Empty"
                            description="No athletes match the current criteria."
                            action={<Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('ALL') }}>Clear Filters</Button>}
                        />
                    </div>
                ) : (
                    members.map((member, i) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            onView={() => handleView(member.id)}
                            onDelete={() => handleDelete(member.id)}
                            index={i}
                        />
                    ))
                )}
            </div>

            {/* --- Modals --- */}
            <AddMemberModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                plans={plans}
                onSuccess={() => {
                    fetchMembers();
                    setShowAddModal(false);
                }}
            />

            {selectedMember && (
                <ViewMemberModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    member={selectedMember}
                />
            )}
        </div>
    );
}

// --- Sub-components for cleaner file ---

function MemberCard({ member, onView, onDelete, index }: { member: Member, onView: () => void, onDelete: () => void, index: number }) {
    const activePlan = member.memberships?.[0];
    const status = activePlan?.status || 'INACTIVE';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-[#111318] border border-white/5 rounded-3xl p-6 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 flex flex-col justify-between h-full"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800 group-hover:bg-orange-500 transition-colors" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <Avatar
                        src={member.user?.profilePhoto}
                        fallback={getInitials(member.user?.fullName || '?')}
                        size="md"
                        className="ring-2 ring-black group-hover:ring-orange-500 transition-all shadow-lg"
                    />
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight group-hover:text-orange-400 transition-colors truncate max-w-[140px]">
                            {member.user?.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={status === 'ACTIVE' ? 'success' : status === 'EXPIRED' ? 'danger' : 'default'}>
                                {status}
                            </Badge>
                            <span className="text-[10px] bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded text-zinc-500 font-mono">
                                {member.memberId}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions Dropdown Trigger (Simplified to buttons for now) */}
                <div className="flex gap-1">
                    <button onClick={onView} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
                        <Eye size={18} />
                    </button>
                    <button onClick={onDelete} className="p-2 hover:bg-red-500/10 rounded-full text-zinc-500 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Current Plan</p>
                    <p className="text-sm font-bold text-white truncate">{activePlan?.plan?.name || 'None'}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Access</p>
                    <p className="text-sm font-mono text-zinc-300">
                        {activePlan ? `${getDaysRemaining(activePlan.endDate)} days` : '--'}
                    </p>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Joined</p>
                    <p className="text-sm font-mono text-zinc-300">{formatDate(member.joinDate)}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Mobile</p>
                    <p className="text-sm font-mono text-zinc-300 truncate">{member.user?.mobile}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                    {member.fitnessGoal || 'NO GOAL SET'}
                </span>
                <motion.button
                    whileHover={{ x: 3 }}
                    onClick={onView}
                    className="text-xs font-bold text-orange-500 flex items-center hover:text-orange-400"
                >
                    Full Dossier <ArrowUpRight size={12} className="ml-1" />
                </motion.button>
            </div>
        </motion.div>
    );
}

function AddMemberModal({ isOpen, onClose, plans, onSuccess }: { isOpen: boolean, onClose: () => void, plans: MembershipPlan[], onSuccess: () => void }) {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<MemberFormValues>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            gender: 'MALE',
            dateOfBirth: ''
        }
    });

    const onSubmit = async (data: MemberFormValues) => {
        try {
            await membersAPI.create({
                ...data,
                height: data.height ? Number(data.height) : undefined,
                weight: data.weight ? Number(data.weight) : undefined,
            });
            toast.success('Athlete inducted successfully');
            reset();
            onSuccess();
        } catch (error) {
            toast.error('Failed to create member');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#09090b] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-wider">Induct New Athlete</h2>
                        <p className="text-zinc-500 text-xs mt-1">Fill in the required protocol data.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-zinc-400" /></button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar">
                    <form id="add-member-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">Identity Protocol</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-400">Full Name</label>
                                    <input {...register('fullName')} className="input-premium w-full" placeholder="ex. John Doe" />
                                    {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-400">Date of Birth</label>
                                    <input type="date" {...register('dateOfBirth')} className="input-premium w-full" />
                                    {errors.dateOfBirth && <span className="text-red-500 text-xs">{errors.dateOfBirth.message}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-400">Gender</label>
                                    <select {...register('gender')} className="input-premium w-full">
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">Comms Channel</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-400">Mobile Number</label>
                                    <input {...register('mobile')} className="input-premium w-full" placeholder="10-digit number" />
                                    {errors.mobile && <span className="text-red-500 text-xs">{errors.mobile.message}</span>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-zinc-400">Email (Optional)</label>
                                    <input {...register('email')} className="input-premium w-full" placeholder="athlete@example.com" />
                                    {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h3 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-4">Access Level</h3>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-400">Select Plan</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {plans.map(plan => (
                                        <label key={plan.id} className="cursor-pointer relative group">
                                            <input type="radio" value={plan.id} {...register('planId')} className="peer sr-only" />
                                            <div className="p-4 rounded-xl border border-white/10 bg-zinc-900 peer-checked:bg-white/5 peer-checked:border-orange-500 transition-all hover:bg-zinc-800">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-white">{plan.name}</span>
                                                    <span className="text-xs text-orange-500 font-mono">₹{plan.finalPrice}</span>
                                                </div>
                                                <div className="text-xs text-zinc-500">{plan.durationDays} Days Access</div>
                                            </div>
                                            <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity">
                                                <div className="bg-orange-500 rounded-full p-0.5"><Check size={10} className="text-black" /></div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.planId && <span className="text-red-500 text-xs">{errors.planId.message}</span>}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button form="add-member-form" disabled={isSubmitting} className="btn-premium min-w-[140px]">
                        {isSubmitting ? <Spinner size="sm" /> : <><Save size={18} className="mr-2" /> Confirm Induction</>}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

function ViewMemberModal({ isOpen, onClose, member }: { isOpen: boolean, onClose: () => void, member: Member }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#09090b] w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
            >
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-orange-900/20 to-transparent pointer-events-none" />

                <div className="p-8 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-6">
                            <Avatar src={member.user?.profilePhoto} fallback={getInitials(member.user?.fullName || '?')} size="xl" className="ring-4 ring-black shadow-2xl" />
                            <div>
                                <h1 className="text-3xl font-black text-white">{member.user?.fullName}</h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="outline" className="font-mono">{member.memberId}</Badge>
                                    <Badge variant="success">Active</Badge>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-black/50 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                    </div>
                </div>

                <div className="px-8 pb-8 overflow-y-auto custom-scrollbar space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Weight', value: member.weight ? `${member.weight} KG` : '--', icon: Dumbbell },
                            { label: 'Height', value: member.height ? `${member.height} CM` : '--', icon: Activity },
                            { label: 'Goal', value: member.fitnessGoal || 'TBD', icon: TrendingUp },
                            { label: 'Joined', value: formatDate(member.joinDate), icon: Calendar },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-zinc-500 text-xs font-bold uppercase tracking-wider">
                                    <stat.icon size={14} /> {stat.label}
                                </div>
                                <div className="text-xl font-bold text-white">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Personal Data</h3>
                            <div className="space-y-4">
                                <InfoRow label="Mobile" value={member.user?.mobile} />
                                <InfoRow label="Email" value={member.user?.email} />
                                <InfoRow label="DOB" value={formatDate(member.dateOfBirth)} />
                                <InfoRow label="Emergency" value={member.emergencyContact} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Membership Status</h3>
                            {member.memberships?.[0] ? (
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-orange-400 font-bold text-lg">{member.memberships[0].plan?.name}</span>
                                        <Badge variant="success">Active</Badge>
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        Valid until <span className="text-white font-bold">{formatDate(member.memberships[0].endDate)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-zinc-500 italic">No active membership found.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex justify-end gap-3 mt-auto">
                    <Button variant="secondary" onClick={onClose}>Close Dossier</Button>
                </div>
            </motion.div>
        </div>
    );
}

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-dashed border-white/5 last:border-0">
        <span className="text-zinc-500 text-sm">{label}</span>
        <span className="text-zinc-200 font-medium text-sm">{value || 'N/A'}</span>
    </div>
);
