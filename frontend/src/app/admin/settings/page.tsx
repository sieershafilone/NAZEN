'use client';

import React from 'react';
import { authAPI, settingsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Globe, Save } from 'lucide-react';
import { Card, Button, Input, Select } from '@/components/ui';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = React.useState('General Profile');
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    // Password update state
    const [passwordData, setPasswordData] = React.useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [updatingPassword, setUpdatingPassword] = React.useState(false);

    // Mobile update state
    const [mobileData, setMobileData] = React.useState({
        currentMobile: '',
        newMobile: ''
    });
    const [updatingMobile, setUpdatingMobile] = React.useState(false);

    const [formData, setFormData] = React.useState({
        gymName: '',
        operationalEmail: '',
        primaryContact: '',
        timezone: 'IST',
        currencyUnit: 'INR',
        dateProtocol: 'DD/MM/YYYY',
    });

    // Notification settings state
    const [notifications, setNotifications] = React.useState({
        emailAlerts: true,
        smsAlerts: false,
        marketingEmails: false,
    });

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch real user data
                const userResponse = await authAPI.getMe();
                if (userResponse.data.success) {
                    setMobileData(prev => ({
                        ...prev,
                        currentMobile: userResponse.data.data.mobile
                    }));
                }

                // Fetch real gym settings
                const settingsResponse = await settingsAPI.get();
                if (settingsResponse.data.success && settingsResponse.data.data) {
                    const data = settingsResponse.data.data;
                    setFormData({
                        gymName: data.gymName || '',
                        operationalEmail: data.email || '',
                        primaryContact: data.phone || '',
                        timezone: 'IST', // Assuming this isn't in DB yet or using default
                        currencyUnit: 'INR',
                        dateProtocol: 'DD/MM/YYYY',
                    });

                    if (data.notificationSettings) {
                        setNotifications({
                            emailAlerts: data.notificationSettings.emailAlerts ?? true,
                            smsAlerts: data.notificationSettings.smsAlerts ?? false,
                            marketingEmails: data.notificationSettings.marketingEmails ?? false,
                        });
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMobileData(prev => ({ ...prev, [name]: value }));
    };

    // ... (mobile and password update handlers omitted for brevity, they are unchanged)

    const handleUpdateMobile = async () => {
        if (!mobileData.newMobile) {
            toast.error('Please enter a new phone number');
            return;
        }

        if (mobileData.newMobile.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        if (mobileData.newMobile === mobileData.currentMobile) {
            toast.error('New number must be different from current');
            return;
        }

        setUpdatingMobile(true);
        try {
            await authAPI.updateProfile({
                mobile: mobileData.newMobile
            });
            toast.success('Phone number updated successfully');
            setMobileData(prev => ({
                ...prev,
                currentMobile: prev.newMobile,
                newMobile: ''
            }));
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to update phone number';
            toast.error(message);
        } finally {
            setUpdatingMobile(false);
        }
    };

    const handleUpdateCredentials = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
            toast.error('Please fill in all password fields');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setUpdatingPassword(true);
        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Credentials updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Failed to update credentials';
            toast.error(message);
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsAPI.update({
                gymName: formData.gymName,
                email: formData.operationalEmail,
                phone: formData.primaryContact,
                notificationSettings: notifications
            });
            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { label: 'General Profile', icon: Globe },
        { label: 'Security & Access', icon: Shield },
        { label: 'Notification Matrix', icon: Bell },
        { label: 'System Prefs', icon: Settings },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        System <span className="text-orange-500 glow-text-orange">Control</span>
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium tracking-wide">
                        Configure your gym's digital fingerprint and preferences.
                    </p>
                </div>
                <Button
                    className="btn-premium group"
                    onClick={handleSave}
                    disabled={saving || loading}
                    loading={saving}
                >
                    <Save size={18} className="mr-2" />
                    Commit Changes
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Navigation Sidebar */}
                <div className="space-y-2">
                    {tabs.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.label
                                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-bold text-sm tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Configuration Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Profile Section */}
                    {activeTab === 'General Profile' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                            <Card variant="glass" className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-6">Identity Configuration</h3>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <Input
                                            label="Gym Name"
                                            name="gymName"
                                            value={formData.gymName}
                                            onChange={handleChange}
                                            placeholder="Nazen High Performance"
                                        />
                                        <Input
                                            label="Operational Email"
                                            name="operationalEmail"
                                            value={formData.operationalEmail}
                                            onChange={handleChange}
                                            placeholder="hq@nazengym.com"
                                        />
                                        <Input
                                            label="Primary Contact"
                                            name="primaryContact"
                                            value={formData.primaryContact}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                        />
                                        <Select
                                            label="Timezone"
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'IST', label: '(GMT+05:30) India Standard Time' },
                                                { value: 'UTC', label: '(GMT+00:00) UTC' },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-6">Regional Settings</h3>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <Select
                                            label="Currency Unit"
                                            name="currencyUnit"
                                            value={formData.currencyUnit}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'INR', label: 'Indian Rupee (₹)' },
                                                { value: 'USD', label: 'US Dollar ($)' },
                                            ]}
                                        />
                                        <Select
                                            label="Date Protocol"
                                            name="dateProtocol"
                                            value={formData.dateProtocol}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'DD/MM/YYYY', label: 'DD / MM / YYYY' },
                                                { value: 'MM/DD/YYYY', label: 'MM / DD / YYYY' },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Security Section */}
                    {activeTab === 'Security & Access' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <Card variant="glass" className="space-y-6">
                                <h3 className="text-xl font-bold text-white">Admin Access</h3>

                                <div className="space-y-4 pb-6 border-b border-white/5">
                                    <h4 className="text-sm font-semibold text-zinc-400">Update Phone Number</h4>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Input
                                            label="Current Phone Number"
                                            value={mobileData.currentMobile}
                                            disabled
                                            className="opacity-50"
                                        />
                                        <Input
                                            label="New Phone Number"
                                            name="newMobile"
                                            value={mobileData.newMobile}
                                            onChange={handleMobileChange}
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={handleUpdateMobile}
                                        loading={updatingMobile}
                                        disabled={updatingMobile || !mobileData.newMobile}
                                    >
                                        Update Phone Number
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-zinc-400">Update Password</h4>
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="••••••••"
                                    />
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Input
                                            label="New Password"
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                        />
                                        <Input
                                            label="Confirm New Password"
                                            type="password"
                                            name="confirmNewPassword"
                                            value={passwordData.confirmNewPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={handleUpdateCredentials}
                                        loading={updatingPassword}
                                        disabled={updatingPassword}
                                    >
                                        Update Credentials
                                    </Button>
                                </div>
                            </Card>
                            <Card variant="glass" className="space-y-6">
                                <h3 className="text-xl font-bold text-white">Login History</h3>
                                <div className="space-y-3">
                                    {[
                                        { date: 'Today, 10:23 AM', ip: '192.168.1.1', device: 'Chrome / Windows', status: 'Success' },
                                        { date: 'Yesterday, 8:45 PM', ip: '192.168.1.1', device: 'Chrome / Windows', status: 'Success' },
                                        { date: 'Jan 15, 2:12 PM', ip: '142.25.12.5', device: 'Safari / iPhone', status: 'Failed' },
                                    ].map((log, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div>
                                                <p className="text-sm font-bold text-white">{log.device}</p>
                                                <p className="text-xs text-zinc-500 font-mono">{log.ip} • {log.date}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase ${log.status === 'Success' ? 'text-green-500' : 'text-red-500'}`}>{log.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Notifications Section */}
                    {activeTab === 'Notification Matrix' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <Card variant="glass" className="space-y-6">
                                <h3 className="text-xl font-bold text-white">Alert Configuration</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'System Emails', desc: 'Receive daily summary reports via email', state: notifications.emailAlerts, key: 'emailAlerts' },
                                        { label: 'SMS Notifications', desc: 'Urgent alerts for membership expiry/payments', state: notifications.smsAlerts, key: 'smsAlerts' },
                                        { label: 'Marketing Communications', desc: 'Send automated promo campaigns to members', state: notifications.marketingEmails, key: 'marketingEmails' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                            <div>
                                                <p className="font-bold text-white">{item.label}</p>
                                                <p className="text-xs text-zinc-500">{item.desc}</p>
                                            </div>
                                            <div
                                                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !item.state }))}
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.state ? 'bg-orange-500' : 'bg-zinc-700'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${item.state ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* System Prefs Section */}
                    {activeTab === 'System Prefs' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <Card variant="glass" className="space-y-6">
                                <h3 className="text-xl font-bold text-white">Data Retention</h3>
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><Settings size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-blue-400">Automatic Backups</h4>
                                        <p className="text-xs text-blue-200/60 mt-1">System performs daily encrypted backups at 00:00 UTC.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400">Database Size</span>
                                        <span className="text-white font-mono">24.5 MB</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-400">Storage Used</span>
                                        <span className="text-white font-mono">1.2 GB / 50 GB</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-orange-500 h-full w-[2%]"></div>
                                    </div>
                                </div>
                            </Card>

                            <Card variant="outline" className="p-8 flex items-center justify-between border-red-500/20 bg-red-500/5">
                                <div className="space-y-1">
                                    <h4 className="text-red-500 font-bold">Nuclear Option</h4>
                                    <p className="text-xs text-zinc-500 font-medium">Permanently wipe all gym records and system data.</p>
                                </div>
                                <Button variant="danger" size="sm">Factory Reset</Button>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
