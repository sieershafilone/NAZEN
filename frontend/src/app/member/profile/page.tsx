'use client';

import { useAuthStore } from '@/store';
import { Card, Avatar, Badge, Button } from '@/components/ui';
import { getInitials } from '@/lib/utils';
import { Mail, Phone, Calendar, User, Ruler, Weight } from 'lucide-react';

export default function MemberProfilePage() {
    const { user } = useAuthStore();
    const member = user?.member;

    if (!user || !member) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="relative">
                <div className="h-32 bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-2xl border border-white/5" />
                <div className="absolute -bottom-12 left-8">
                    <div className="p-1.5 bg-black rounded-full">
                        <Avatar
                            src={user.profilePhoto}
                            fallback={getInitials(user.fullName)}
                            size="xl"
                            className="w-24 h-24 text-2xl border-2 border-black"
                        />
                    </div>
                </div>
                <div className="absolute top-4 right-4">
                    <Badge variant={member.memberships?.[0]?.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {member.memberships?.[0]?.status || 'INACTIVE'}
                    </Badge>
                </div>
            </div>

            <div className="pt-16 px-4">
                <h1 className="text-3xl font-black text-white">{user.fullName}</h1>
                <p className="text-zinc-500 font-mono text-sm mt-1">{member.memberId}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Personal Info" icon={<User size={18} className="text-orange-500" />}>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail size={16} className="text-zinc-600" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase">Email</p>
                                <p className="text-sm text-white">{user.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={16} className="text-zinc-600" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase">Phone</p>
                                <p className="text-sm text-white">{user.mobile}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-zinc-600" />
                            <div>
                                <p className="text-xs text-zinc-500 uppercase">DOB</p>
                                <p className="text-sm text-white">{member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Physical Stats" icon={<ActivityIcon size={18} className="text-blue-500" />}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500">
                                <Ruler size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 uppercase">Height</p>
                                <p className="text-lg font-bold text-white">{member.height || '-'} <span className="text-xs font-normal text-zinc-600">cm</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500">
                                <Weight size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 uppercase">Weight</p>
                                <p className="text-lg font-bold text-white">{member.weight || '-'} <span className="text-xs font-normal text-zinc-600">kg</span></p>
                            </div>
                        </div>
                    </div>
                    {member.fitnessGoal && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                            <p className="text-xs text-zinc-500 uppercase mb-2">Fitness Goal</p>
                            <p className="text-sm text-white italic">{member.fitnessGoal}</p>
                        </div>
                    )}
                </Card>
            </div>

            <div className="flex justify-end pt-8">
                <Button variant="outline" className="text-red-500 border-red-500/20 hover:bg-red-500/10">Request Profile Edit</Button>
            </div>
        </div>
    );
}

function ActivityIcon(props: any) {
    return <Activity {...props} />;
}
import { Activity } from 'lucide-react';
