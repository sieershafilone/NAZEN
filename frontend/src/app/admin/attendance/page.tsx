'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Filter, Search as SearchIcon } from 'lucide-react';
import { Card, Button, Badge, StatCard, EmptyState } from '@/components/ui';

export default function AttendancePage() {
    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Attendance <span className="text-orange-500 glow-text-orange">Logs</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium tracking-wide">
                        Monitor athlete check-ins and real-time gym traffic.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="group">
                        <Filter size={18} className="mr-2 group-hover:text-orange-500 transition-colors" />
                        Sort & Filter
                    </Button>
                    <Button className="btn-premium">
                        Manual Entry
                    </Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Morning Session" value="42" icon={<Users size={18} />} color="blue" />
                <StatCard title="Afternoon Session" value="28" icon={<Users size={18} />} color="purple" />
                <StatCard title="Evening Session" value="65" icon={<Users size={18} />} color="orange" />
                <StatCard title="Peak Traffic" value="6PM" icon={<Calendar size={18} />} color="green" />
            </div>

            {/* Content Area */}
            <Card variant="glass" className="min-h-[500px] flex flex-col justify-center items-center border-dashed border-2">
                <EmptyState
                    icon={<Calendar size={64} className="text-zinc-700 mb-2" />}
                    title="No Activity Detected"
                    description="Our biometric scanners are ready. Once athletes start checking in, logs will appear here in real-time."
                    action={
                        <Button variant="outline" className="mt-4">
                            Check Hardware Status
                        </Button>
                    }
                />
            </Card>
        </div>
    );
}
