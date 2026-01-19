'use client';

import { useEffect, useState } from 'react';
import { Card, Spinner } from '@/components/ui';
import { ImageIcon } from 'lucide-react';
// Assuming we might have a robust gallery API later, but for now using a placeholder or basic fetch if available.
// Since there wasn't a dedicated member gallery API call in my context, I'll mock/setup a placeholder that implies functionality.

export default function MemberGalleryPage() {
    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-white">Gym <span className="text-orange-500">Gallery</span></h1>
                <p className="text-zinc-500 mt-2">Highlights from the community.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Placeholders for now as user likely hasn't uploaded real images yet */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-zinc-900 rounded-xl border border-white/5 flex items-center justify-center group overflow-hidden relative cursor-pointer">
                        <ImageIcon className="text-zinc-800 group-hover:text-zinc-700 transition-colors" size={32} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs text-white uppercase tracking-widest font-bold">View</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center py-12">
                <p className="text-zinc-600">More photos coming soon...</p>
            </div>
        </div>
    );
}
