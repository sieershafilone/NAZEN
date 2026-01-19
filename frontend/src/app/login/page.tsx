'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Phone, Lock, Dumbbell } from 'lucide-react';
import { Button, Input, Card, BrandLogo } from '@/components/ui';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        mobile: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.mobile) {
            newErrors.mobile = 'Phone number is required';
        } else if (!/^(\+91)?[6-9]\d{9}$/.test(formData.mobile.replace(/\s/g, ''))) {
            newErrors.mobile = 'Enter a valid Indian phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const mobile = formData.mobile.startsWith('+91')
                ? formData.mobile
                : `+91${formData.mobile.replace(/\s/g, '')}`;

            const response = await authAPI.login({
                mobile,
                password: formData.password,
            });

            const { user, token } = response.data.data;
            setAuth(user, token);

            toast.success(`Welcome back, ${user.fullName}!`);

            // Redirect based on role
            if (user.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/member');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <BrandLogo variant="large" />
                </div>

                <Card className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold text-white mb-2">
                            Member Login
                        </h2>
                        <p className="text-zinc-500 text-xs">
                            Secure access for registered members only.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                        <Input
                            label="Phone Number"
                            type="tel"
                            placeholder=""
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            error={errors.mobile}
                            icon={<Phone size={18} />}
                            autoComplete="off"
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder=""
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                                icon={<Lock size={18} />}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-zinc-500 hover:text-zinc-300"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            loading={loading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-zinc-500 text-sm">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-orange-500 hover:text-orange-400 font-medium">
                                Contact Admin
                            </Link>
                        </p>
                    </div>
                </Card>


                {/* Copyright */}
                <div className="mt-8 text-center">
                    <p className="text-zinc-600 text-xs">
                        © 2026 Nazen Gym. All rights reserved.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
