import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format currency to INR
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Format date to Indian format (DD/MM/YYYY)
export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

// Format date with time
export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
}

// Get days remaining
export function getDaysRemaining(endDate: string | Date): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

// Get membership status color
export function getMembershipStatusColor(status: string): string {
    switch (status) {
        case 'ACTIVE':
            return 'text-green-500 bg-green-500/10';
        case 'EXPIRED':
            return 'text-red-500 bg-red-500/10';
        case 'FROZEN':
            return 'text-blue-500 bg-blue-500/10';
        case 'CANCELLED':
            return 'text-gray-500 bg-gray-500/10';
        default:
            return 'text-gray-500 bg-gray-500/10';
    }
}

// Get payment status color
export function getPaymentStatusColor(status: string): string {
    switch (status) {
        case 'COMPLETED':
            return 'text-green-500 bg-green-500/10';
        case 'PENDING':
            return 'text-yellow-500 bg-yellow-500/10';
        case 'FAILED':
            return 'text-red-500 bg-red-500/10';
        case 'REFUNDED':
            return 'text-purple-500 bg-purple-500/10';
        default:
            return 'text-gray-500 bg-gray-500/10';
    }
}

// Generate initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
