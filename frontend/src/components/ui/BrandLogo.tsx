'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
    className?: string;
    variant?: 'default' | 'large' | 'icon';
    withGlow?: boolean;
}

export const BrandLogo = ({ className, variant = 'default', withGlow = true }: BrandLogoProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1], // Custom "Apple-like" easing
                delay: 0.1
            }}
            whileHover={{
                scale: 1.02,
                filter: 'brightness(1.1)',
                transition: { duration: 0.3 }
            }}
            className={cn(
                "relative flex items-center justify-center",
                // Optical alignment container - Height based sizing for natural aspect ratio
                variant === 'default' && "h-14 w-auto aspect-[3/1]",
                variant === 'large' && "h-32 w-auto aspect-[3/1]",
                variant === 'icon' && "h-12 w-12",
                className
            )}
        >
            {/* Ambient Glow - Subtle "Behind the Glass" effect */}
            {withGlow && (
                <div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    aria-hidden="true"
                />
            )}

            {/* Logo Image with engineered alignment */}
            <div className="relative w-full h-full filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_15px_rgba(255,100,50,0.3)] transition-all duration-300">
                <Image
                    src="/logo-white.png"
                    alt="Nazen Gym"
                    fill
                    className={cn(
                        // Clean projection
                        "object-contain",
                        // Optical alignment tweaks
                        variant === 'default' && "object-center md:object-left",
                        variant === 'large' && "object-center",
                        variant === 'icon' && "object-center"
                    )}
                    priority
                />
            </div>

            {/* Micro-noise texture overlay for "tactile" feel */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </motion.div>
    );
};
