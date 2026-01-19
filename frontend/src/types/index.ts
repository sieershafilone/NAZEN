// API Types for Nazen Gym Management System

// User & Auth Types
export interface User {
    id: string;
    fullName: string;
    email?: string;
    mobile: string;
    role: 'ADMIN' | 'MEMBER';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    profilePhoto?: string;
    createdAt: string;
    member?: Member;
}

export interface Member {
    id: string;
    memberId: string;
    userId: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    height?: number;
    weight?: number;
    fitnessGoal?: string;
    medicalNotes?: string;
    emergencyContact?: string;
    joinDate: string;
    user?: User;
    memberships?: Membership[];
    qrCode?: string;
}

// Membership Types
export interface MembershipPlan {
    id: string;
    name: string;
    durationDays: number;
    basePrice: number;
    gstPercent: number;
    finalPrice: number;
    description?: string;
    features?: string[];
    isActive: boolean;
}

export interface Membership {
    id: string;
    memberId: string;
    planId: string;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'CANCELLED';
    frozenDays: number;
    plan?: MembershipPlan;
    daysRemaining?: number;
    member?: Member;
}

// Payment Types
export interface Payment {
    id: string;
    invoiceNumber: string;
    memberId: string;
    membershipId: string;
    amount: number;
    gstAmount: number;
    paymentMethod: 'RAZORPAY' | 'UPI' | 'CASH' | 'BANK_TRANSFER';
    razorpayId?: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    paidAt?: string;
    createdAt: string;
    member?: Member;
    membership?: Membership;
}

// Attendance Types
export interface Attendance {
    id: string;
    memberId: string;
    checkInTime: string;
    checkOutTime?: string;
    method: 'QR' | 'MANUAL';
    member?: Member;
}

// Workout Types
export interface WorkoutPlan {
    id: string;
    name: string;
    type: 'PUSH_PULL_LEGS' | 'BRO_SPLIT' | 'FULL_BODY' | 'UPPER_LOWER' | 'CUSTOM';
    description?: string;
    exercises: WorkoutDay[];
    daysPerWeek: number;
    isActive: boolean;
}

export interface WorkoutDay {
    day: string;
    exercises: Exercise[];
}

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    muscle: string;
}

export interface MemberWorkout {
    id: string;
    memberId: string;
    workoutPlanId: string;
    assignedAt: string;
    isActive: boolean;
    workoutPlan?: WorkoutPlan;
}

// Progress Types
export interface ProgressRecord {
    id: string;
    memberId: string;
    weight?: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    photo?: string;
    notes?: string;
    recordedAt: string;
}

// Image Types
export interface GymImage {
    id: string;
    title: string;
    category: 'EXTERIOR' | 'INTERIOR' | 'EQUIPMENT' | 'GALLERY' | 'TRANSFORMATION';
    imageUrl: string;
    visibility: 'PUBLIC' | 'ADMIN_ONLY';
    sortOrder: number;
    uploadedAt: string;
}

// Settings Types
export interface GymSettings {
    id: string;
    gymName: string;
    tagline?: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    gstin?: string;
    logo?: string;
    workingHours?: Record<string, { open: string; close: string }>;
    currency: string;
    timezone: string;
    socialLinks?: {
        instagram?: string;
        facebook?: string;
        youtube?: string;
    };
}

// Dashboard Types
export interface AdminDashboard {
    members: {
        total: number;
        active: number;
        expired: number;
        newThisMonth: number;
    };
    attendance: {
        today: number;
        currentlyIn: number;
    };
    revenue: {
        thisMonth: number;
        lastMonth: number;
        growth: number;
    };
    recentPayments: Payment[];
    expiringMemberships: Membership[];
}

export interface MemberDashboard {
    membership: Membership | null;
    attendance: {
        thisMonth: number;
        recent: Attendance[];
    };
    progress: ProgressRecord[];
    workout: MemberWorkout | null;
    payments: Payment[];
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        items: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

// Form Types
export interface LoginForm {
    mobile: string;
    password: string;
}

export interface MemberForm {
    fullName: string;
    email?: string;
    mobile: string;
    password?: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    dateOfBirth: string;
    height?: number;
    weight?: number;
    fitnessGoal?: string;
    medicalNotes?: string;
    emergencyContact?: string;
    planId?: string;
}

export interface PlanForm {
    name: string;
    durationDays: number;
    basePrice: number;
    gstPercent?: number;
    description?: string;
    features?: string[];
}
