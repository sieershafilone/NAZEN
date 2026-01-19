'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Scale, Activity } from 'lucide-react';
import { Card, Spinner } from '@/components/ui';
import { membersAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export default function ProgressPage() {
    const { user } = useAuthStore();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            if (user?.member?.id) {
                try {
                    const res = await membersAPI.getById(user.member.id);
                    setRecords(res.data.data.progressRecords || []);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProgress();
    }, [user]);

    if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

    const latest = records[0];
    const initial = records[records.length - 1];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-white">Fitness <span className="text-orange-500">Progress</span></h1>
                <p className="text-zinc-500 mt-2">Track your body metrics and composition.</p>
            </div>

            {latest && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card title="Current Weight" icon={<Scale size={18} className="text-blue-500" />}>
                        <p className="text-3xl font-black text-white">{latest.weight} <span className="text-sm font-medium text-zinc-500">kg</span></p>
                        {initial && (
                            <p className={`text-xs mt-2 font-medium ${latest.weight < initial.weight ? 'text-green-500' : 'text-zinc-500'}`}>
                                {latest.weight < initial.weight ? '-' : '+'}{(latest.weight - initial.weight).toFixed(1)} kg since start
                            </p>
                        )}
                    </Card>
                    <Card title="Body Fat %" icon={<Activity size={18} className="text-orange-500" />}>
                        <p className="text-3xl font-black text-white">{latest.bodyFat}%</p>
                    </Card>
                </div>
            )}

            <Card title="Measurement History">
                {records.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                        No progress records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900/50 text-xs text-zinc-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 rounded-l-xl">Date</th>
                                    <th className="p-4">Weight (kg)</th>
                                    <th className="p-4">Body Fat (%)</th>
                                    <th className="p-4 rounded-r-xl">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {records.map((record) => (
                                    <tr key={record.id} className="group hover:bg-zinc-900/30 transition-colors">
                                        <td className="p-4 text-white font-medium">{formatDate(record.recordedAt)}</td>
                                        <td className="p-4 text-zinc-300">{record.weight}</td>
                                        <td className="p-4 text-zinc-300">{record.bodyFat}</td>
                                        <td className="p-4 text-zinc-500 text-sm italic">{record.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
