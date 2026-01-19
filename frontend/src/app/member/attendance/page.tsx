'use client';

import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, Spinner } from '@/components/ui';
import { membersAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store';
import type { Attendance } from '@/types';

export default function AttendancePage() {
    const { user } = useAuthStore();
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    const stats = {
        total: attendance.length,
        thisMonth: attendance.filter(a => new Date(a.checkInTime).getMonth() === new Date().getMonth()).length,
        avgDuration: attendance.length > 0
            ? Math.round(attendance.reduce((acc, curr) => {
                if (!curr.checkOutTime) return acc;
                return acc + (new Date(curr.checkOutTime).getTime() - new Date(curr.checkInTime).getTime()) / (1000 * 60);
            }, 0) / attendance.length)
            : 0
    };

    useEffect(() => {
        const fetchAttendance = async () => {
            if (user?.member?.id) {
                try {
                    const res = await membersAPI.getById(user.member.id);
                    setAttendance(res.data.data.attendance || []);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchAttendance();
    }, [user]);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-white">Attendance <span className="text-orange-500">Record</span></h1>
                <p className="text-zinc-500 mt-2">Track your consistency and workout sessions.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Total Sessions</p>
                        <p className="text-2xl font-black text-white">{stats.total}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">This Month</p>
                        <p className="text-2xl font-black text-white">{stats.thisMonth}</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Avg. Duration</p>
                        <p className="text-2xl font-black text-white">{stats.avgDuration} <span className="text-sm text-zinc-500 font-normal">mins</span></p>
                    </div>
                </Card>
            </div>

            {/* Attendance List */}
            <Card title="Recent Activity">
                {loading ? (
                    <div className="h-40 flex items-center justify-center"><Spinner /></div>
                ) : attendance.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500">No attendance records found yet.</div>
                ) : (
                    <div className="space-y-4">
                        {attendance.map((record) => {
                            const duration = record.checkOutTime
                                ? Math.round((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60))
                                : null;

                            return (
                                <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:bg-zinc-800/50 transition-colors gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                                            <span className="text-xs font-bold text-zinc-400">
                                                {new Date(record.checkInTime).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{formatDate(record.checkInTime)}</p>
                                            <p className="text-xs text-zinc-500">
                                                {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {' - '}
                                                {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider">Duration</p>
                                            <p className="text-white font-bold">{duration ? `${duration} mins` : 'Active'}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${record.method === 'QR' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                            {record.method}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}
