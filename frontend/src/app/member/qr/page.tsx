'use client';

import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import { Card, Spinner } from '@/components/ui';
import { useAuthStore } from '@/store';
import { membersAPI } from '@/lib/api';

export default function QRPage() {
    const { user } = useAuthStore();
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQR = async () => {
            if (user?.member?.id) {
                try {
                    const res = await membersAPI.getQR(user.member.id);
                    setQrCode(res.data.data.qrCode);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchQR();
    }, [user]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <Card className="max-w-sm w-full p-8 text-center flex flex-col items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider">Access Pass</h1>
                    <p className="text-zinc-500 text-sm mt-1">Nazen Gym Access Control</p>
                </div>

                <div className="bg-white p-4 rounded-xl">
                    {loading ? (
                        <div className="w-48 h-48 flex items-center justify-center">
                            <Spinner variant="dark" />
                        </div>
                    ) : qrCode ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={qrCode} alt="Your QR Code" className="w-48 h-48" />
                    ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-zinc-100 rounded-lg">
                            <QrCode size={48} className="text-zinc-300" />
                        </div>
                    )}
                </div>

                <div className="text-xs text-zinc-500">
                    <p className="font-mono">{user?.member?.memberId}</p>
                    <p className="mt-2">Scan this at the entrance/exit.</p>
                </div>
            </Card>
        </div>
    );
}
