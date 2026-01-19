'use client';

import { useEffect, useState } from 'react';
import { Dumbbell, Play, Timer, Activity } from 'lucide-react';
import { Card, Spinner, Badge } from '@/components/ui';
import { membersAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import type { WorkoutPlan } from '@/types';

export default function WorkoutsPage() {
    const { user } = useAuthStore();
    const [plan, setPlan] = useState<WorkoutPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            if (user?.member?.id) {
                try {
                    const res = await membersAPI.getById(user.member.id);
                    // Assuming the API returns memberWorkouts and we take the active one
                    const activeWorkout = res.data.data.memberWorkouts?.find((mw: any) => mw.isActive)?.workoutPlan;
                    setPlan(activeWorkout || null);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPlan();
    }, [user]);

    if (loading) return <div className="flex justify-center p-12"><Spinner /></div>;

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <Dumbbell size={64} className="text-zinc-800 mb-6" />
                <h2 className="text-2xl font-bold text-white">No Workout Plan Assigned</h2>
                <p className="text-zinc-500 mt-2 max-w-md">Your trainer hasn&apos;t assigned a specific workout plan yet. Speak to the floor manager to get started.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-white">My <span className="text-orange-500">Program</span></h1>
                <p className="text-zinc-500 mt-2">{plan.name} • {plan.daysPerWeek} Days / Week</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plan.exercises?.map((day: any, i: number) => (
                    <Card key={i} className="flex flex-col h-full border-t-4 border-t-orange-500">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-white">{day.day}</h3>
                            <div className="p-2 bg-zinc-900 rounded-lg">
                                <Dumbbell size={16} className="text-zinc-500" />
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            {day.exercises.map((ex: any, j: number) => (
                                <div key={j} className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-sm">{ex.name}</p>
                                        <div className="flex gap-3 text-xs text-zinc-500 mt-1">
                                            <span>{ex.sets} Sets</span>
                                            <span>•</span>
                                            <span>{ex.reps} Reps</span>
                                        </div>
                                    </div>
                                    {ex.muscle && (
                                        <Badge variant="outline" className="text-[10px]">{ex.muscle}</Badge>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5">
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <Play size={14} /> Start Session
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
