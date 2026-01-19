import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (data: { mobile: string; password: string }) =>
        api.post('/auth/login', data),
    register: (data: { fullName: string; mobile: string; password: string }) =>
        api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updatePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.put('/auth/password', data),
    updateProfile: (data: { fullName?: string; email?: string; mobile?: string }) =>
        api.put('/auth/profile', data),
};

// Members API
export const membersAPI = {
    getAll: (params?: { search?: string; page?: number; limit?: number }) =>
        api.get('/members', { params }),
    getById: (id: string) => api.get(`/members/${id}`),
    create: (data: any) => api.post('/members', data),
    update: (id: string, data: any) => api.put(`/members/${id}`, data),
    delete: (id: string) => api.delete(`/members/${id}`),
    freeze: (id: string, data: { days: number; reason?: string }) =>
        api.put(`/members/${id}/freeze`, data),
    unfreeze: (id: string) => api.put(`/members/${id}/unfreeze`),
    extend: (id: string, data: { days: number; reason?: string }) =>
        api.put(`/members/${id}/extend`, data),
    getQR: (id: string) => api.get(`/members/${id}/qr`),
};

// Plans API
export const plansAPI = {
    getAll: (params?: { active?: boolean }) => api.get('/plans', { params }),
    getById: (id: string) => api.get(`/plans/${id}`),
    create: (data: any) => api.post('/plans', data),
    update: (id: string, data: any) => api.put(`/plans/${id}`, data),
    delete: (id: string) => api.delete(`/plans/${id}`),
};

// Payments API
export const paymentsAPI = {
    getAll: (params?: { memberId?: string; status?: string; page?: number }) =>
        api.get('/payments', { params }),
    getById: (id: string) => api.get(`/payments/${id}`),
    createManual: (data: any) => api.post('/payments/manual', data),
    createRazorpayOrder: (data: { memberId: string; planId: string }) =>
        api.post('/payments/razorpay/order', data),
    verifyRazorpay: (data: any) => api.post('/payments/razorpay/verify', data),
    downloadInvoice: (id: string) =>
        api.get(`/payments/${id}/invoice`, { responseType: 'blob' }),
    getMyPayments: () => api.get('/payments/member/history'),
    delete: (id: string) => api.delete(`/payments/${id}`),
};

// Attendance API
export const attendanceAPI = {
    getAll: (params?: { memberId?: string; date?: string; page?: number }) =>
        api.get('/attendance', { params }),
    getToday: () => api.get('/attendance/today'),
    checkIn: (data: { memberId: string }) => api.post('/attendance/checkin', data),
    checkOut: (data: { memberId: string }) => api.post('/attendance/checkout', data),
    checkInQR: (data: { qrData: string }) => api.post('/attendance/qr', data),
    getMemberAttendance: (params?: { month?: number; year?: number }) =>
        api.get('/attendance/member', { params }),
};

// Workouts API
export const workoutsAPI = {
    getAll: (params?: { active?: boolean; type?: string }) =>
        api.get('/workouts', { params }),
    getById: (id: string) => api.get(`/workouts/${id}`),
    create: (data: any) => api.post('/workouts', data),
    update: (id: string, data: any) => api.put(`/workouts/${id}`, data),
    delete: (id: string) => api.delete(`/workouts/${id}`),
    assign: (data: { memberId: string; workoutPlanId: string }) =>
        api.post('/workouts/assign', data),
    getMemberWorkout: () => api.get('/workouts/member'),
};

// Progress API
export const progressAPI = {
    getMemberProgress: () => api.get('/progress'),
    addProgress: (data: FormData) =>
        api.post('/progress', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getChart: (params?: { metric?: string; period?: string }) =>
        api.get('/progress/chart', { params }),
    deleteProgress: (id: string) => api.delete(`/progress/${id}`),
};

// Images API
export const imagesAPI = {
    getAll: (params?: { category?: string }) => api.get('/images', { params }),
    getGallery: (params?: { category?: string }) =>
        api.get('/images/gallery', { params }),
    getSlider: () => api.get('/images/slider'),
    upload: (data: FormData) =>
        api.post('/images', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    update: (id: string, data: any) => api.put(`/images/${id}`, data),
    delete: (id: string) => api.delete(`/images/${id}`),
};

// Settings API
export const settingsAPI = {
    get: () => api.get('/settings'),
    getPublic: () => api.get('/settings/public'),
    update: (data: any) => api.put('/settings', data),
    updateLogo: (data: FormData) =>
        api.put('/settings/logo', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

// Dashboard API
export const dashboardAPI = {
    getAdmin: () => api.get('/dashboard/admin'),
    getMember: () => api.get('/dashboard/member'),
};

export default api;
