'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Terminal, Target, Zap } from 'lucide-react';
import { Card, Button, Badge, StatCard } from '@/components/ui';

export default function WorkoutsPage() {
    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Training <span className="text-orange-500 glow-text-orange">Matrix</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium tracking-wide">
                        Engineer and assign high-performance workout protocols.
                    </p>
                </div>
                <Button className="btn-premium group">
                    <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    New Protocol
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Protocols" value="24" icon={<Dumbbell size={18} />} color="orange" />
                <StatCard title="Active Assigns" value="184" icon={<Target size={18} />} color="blue" />
                <StatCard title="New This Week" value="5" icon={<Plus size={18} />} color="green" />
                <StatCard title="Avg Intensity" value="8.5" icon={<Zap size={18} />} color="purple" />
            </div>

            {/* Protocols Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { name: 'Hypertrophy Max', exercises: 12, level: 'Advanced', color: 'orange' },
                    { name: 'Strength Core', exercises: 8, level: 'Intermediate', color: 'blue' },
                    { name: 'Endurance Pro', exercises: 15, level: 'Elite', color: 'purple' },
                ].map((plan, i) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card variant="glass" hover className="group relative">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`p-3 rounded-2xl bg-${plan.color}-500/10 text-${plan.color}-500`}>
                                    <Dumbbell size={24} />
                                </div>
                                <Badge variant="info">{plan.level}</Badge>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-sm text-zinc-500 mb-6 font-medium">Systematic approach to {plan.name.toLowerCase()} goals.</p>

                            <div className="flex items-center gap-4 py-4 border-t border-white/5">
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">{plan.exercises}</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Exercises</span>
                                </div>
                                <div className="w-px h-8 bg-white/5" />
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">45m</span>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Duration</span>
                                </div>
                            </div>

                            <Button variant="secondary" className="w-full mt-4 group">
                                View Script
                                <Terminal size={14} className="ml-2 group-hover:text-orange-500 transition-colors" />
                            </Button>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
