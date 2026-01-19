'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ImageIcon, Plus, Grid, List, Camera } from 'lucide-react';
import { Card, Button, Badge, StatCard, EmptyState } from '@/components/ui';

export default function GalleryPage() {
    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Visual <span className="text-orange-500 glow-text-orange">Archive</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium tracking-wide">
                        Curate your gym's atmosphere and transformation stories.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" className="p-3">
                        <Grid size={18} />
                    </Button>
                    <Button variant="secondary" size="sm" className="p-3">
                        <List size={18} />
                    </Button>
                    <Button className="btn-premium">
                        <Camera size={18} className="mr-2" />
                        Upload Media
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <Card variant="glass" className="min-h-[500px] flex flex-col justify-center items-center border-dashed border-2">
                <EmptyState
                    icon={<ImageIcon size={64} className="text-zinc-700 mb-2" />}
                    title="Vault is Empty"
                    description="Your high-resolution gym photos and transformation stories will be safely stored here."
                    action={
                        <Button className="btn-premium mt-4">
                            Select Files
                        </Button>
                    }
                />
            </Card>

            {/* Quick Stats (Bottom) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard title="Total Media" value="0" icon={<ImageIcon size={18} />} color="blue" />
                <StatCard title="Storage Used" value="0 MB" icon={<Grid size={18} />} color="purple" />
                <StatCard title="Last Upload" value="Never" icon={<Camera size={18} />} color="orange" />
            </div>
        </div>
    );
}
