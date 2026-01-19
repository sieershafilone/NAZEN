'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-sans';

        const variants = {
            primary: 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/30 focus:ring-orange-500 border border-white/10',
            secondary: 'bg-white/5 backdrop-blur-md text-white hover:bg-white/10 focus:ring-white/20 border border-white/10',
            outline: 'border-2 border-white/10 text-white hover:bg-white/5 focus:ring-white/20',
            ghost: 'text-zinc-400 hover:text-white hover:bg-white/5 focus:ring-white/10',
            danger: 'bg-red-600/20 text-red-500 hover:bg-red-600/30 focus:ring-red-500 border border-red-500/20',
        };

        const sizes = {
            sm: 'px-4 py-2 text-[10px]',
            md: 'px-6 py-3 text-xs',
            lg: 'px-8 py-4 text-sm',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500',
                            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                            'transition-all duration-200',
                            icon && 'pl-10',
                            error && 'border-red-500 focus:ring-red-500',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white',
                        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                        'transition-all duration-200 cursor-pointer',
                        error && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);
Select.displayName = 'Select';

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    glow?: boolean;
    variant?: 'default' | 'glass' | 'outline';
    title?: string;
    icon?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover, glow, variant = 'default', title, icon, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'rounded-[2rem] p-8 transition-all duration-500',
                    variant === 'default' && 'bg-[#09090b] border border-white/5',
                    variant === 'glass' && 'glass border border-white/5',
                    variant === 'outline' && 'bg-transparent border-2 border-dashed border-white/5',
                    hover && 'hover:border-white/10 hover:shadow-2xl hover:shadow-black',
                    glow && 'hover:shadow-orange-500/5',
                    className
                )}
                {...props}
            >
                {(title || icon) && (
                    <div className="flex items-center gap-3 mb-6">
                        {icon && <div className="text-zinc-500">{icon}</div>}
                        {title && <h3 className="text-lg font-bold text-white capitalize">{title}</h3>}
                    </div>
                )}
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({
    className,
    variant = 'default',
    children,
    ...props
}) => {
    const variants = {
        default: 'bg-white/5 text-zinc-400 border border-white/10',
        success: 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-sm shadow-green-500/10',
        warning: 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm shadow-orange-500/10',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm shadow-red-500/10',
        info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm shadow-blue-500/10',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

// Avatar Component
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({
    className,
    src,
    alt,
    fallback,
    size = 'md',
    ...props
}) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    return (
        <div
            className={cn(
                'relative rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-semibold text-white overflow-hidden',
                sizes[size],
                className
            )}
            {...props}
        >
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                fallback
            )}
        </div>
    );
};

// Spinner Component
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-2 border-zinc-700 border-t-orange-500',
                sizes[size],
                className
            )}
        />
    );
};

// Loading Overlay
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                {message && <p className="text-zinc-400">{message}</p>}
            </div>
        </div>
    );
};

// Empty State
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && <div className="text-zinc-600 mb-4">{icon}</div>}
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">{title}</h3>
            {description && <p className="text-zinc-500 mb-4 max-w-sm">{description}</p>}
            {action}
        </div>
    );
};

// Stat Card
interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: { value: number; positive: boolean };
    className?: string;
    color?: 'orange' | 'blue' | 'green' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    className,
    color = 'orange'
}) => {
    const colors = {
        orange: 'text-orange-500 bg-orange-500/10 blur-orange-500/10',
        blue: 'text-blue-500 bg-blue-500/10 blur-blue-500/10',
        green: 'text-green-500 bg-green-500/10 blur-green-500/10',
        purple: 'text-purple-500 bg-purple-500/10 blur-purple-500/10',
    };

    return (
        <Card variant="glass" className={cn('relative group overflow-hidden', className)} hover>
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[60px] opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${colors[color].split(' ')[1]}`} />

            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{title}</p>
                    <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums font-mono">{value}</h3>
                    {trend && (
                        <div className={cn('inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono',
                            trend.positive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </div>
                    )}
                </div>
                {icon && (
                    <div className={cn('p-3.5 rounded-2xl transition-all duration-300 group-hover:scale-110', colors[color].split(' ')[0], 'bg-white/5 border border-white/5')}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
};

export * from './BrandLogo';
