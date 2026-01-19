'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store';
import { authAPI } from '@/lib/api';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    const { token, setAuth, logout, setLoading } = useAuthStore();

    // Check auth on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    setAuth(response.data.data, token);
                } catch {
                    logout();
                }
            } else {
                setLoading(false);
            }
        };

        checkAuth();
    }, [token, setAuth, logout, setLoading]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
