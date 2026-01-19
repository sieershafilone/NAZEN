const prisma = require('../config/database');

// Admin Dashboard Stats
const getAdminDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // This month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        // Last month
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

        // Parallel queries
        const [
            totalMembers,
            activeMembers,
            expiredMembers,
            todayAttendance,
            currentlyIn,
            thisMonthRevenue,
            lastMonthRevenue,
            recentPayments,
            expiringMemberships,
            newMembersThisMonth,
        ] = await Promise.all([
            // Total members
            prisma.member.count(),

            // Active memberships
            prisma.membership.count({
                where: { status: 'ACTIVE' },
            }),

            // Expired memberships
            prisma.membership.count({
                where: { status: 'EXPIRED' },
            }),

            // Today's attendance
            prisma.attendance.count({
                where: {
                    checkInTime: { gte: today, lt: tomorrow },
                },
            }),

            // Currently in gym
            prisma.attendance.count({
                where: {
                    checkInTime: { gte: today, lt: tomorrow },
                    checkOutTime: null,
                },
            }),

            // This month revenue
            prisma.payment.aggregate({
                where: {
                    status: 'COMPLETED',
                    paidAt: { gte: monthStart, lte: monthEnd },
                },
                _sum: { amount: true },
            }),

            // Last month revenue
            prisma.payment.aggregate({
                where: {
                    status: 'COMPLETED',
                    paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
                },
                _sum: { amount: true },
            }),

            // Recent payments
            prisma.payment.findMany({
                where: { status: 'COMPLETED' },
                include: {
                    member: {
                        include: { user: { select: { fullName: true } } },
                    },
                    membership: { include: { plan: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),

            // Expiring memberships (next 7 days)
            prisma.membership.findMany({
                where: {
                    status: 'ACTIVE',
                    endDate: {
                        gte: today,
                        lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
                include: {
                    member: {
                        include: { user: { select: { fullName: true, mobile: true } } },
                    },
                    plan: true,
                },
                orderBy: { endDate: 'asc' },
            }),

            // New members this month
            prisma.member.count({
                where: {
                    joinDate: { gte: monthStart, lte: monthEnd },
                },
            }),
        ]);

        const thisMonthTotal = thisMonthRevenue._sum.amount || 0;
        const lastMonthTotal = lastMonthRevenue._sum.amount || 0;
        const revenueGrowth = lastMonthTotal > 0
            ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
            : 100;

        res.json({
            success: true,
            data: {
                members: {
                    total: totalMembers,
                    active: activeMembers,
                    expired: expiredMembers,
                    newThisMonth: newMembersThisMonth,
                },
                attendance: {
                    today: todayAttendance,
                    currentlyIn,
                },
                revenue: {
                    thisMonth: parseFloat(thisMonthTotal),
                    lastMonth: parseFloat(lastMonthTotal),
                    growth: Math.round(revenueGrowth * 10) / 10,
                },
                recentPayments,
                expiringMemberships,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Member Dashboard Stats
const getMemberDashboard = async (req, res, next) => {
    try {
        const memberId = req.user.member?.id;

        if (!memberId) {
            return res.status(404).json({
                success: false,
                message: 'Member profile not found',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // This month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

        const [
            membership,
            attendanceThisMonth,
            recentAttendance,
            progress,
            workout,
            payments,
        ] = await Promise.all([
            // Active membership
            prisma.membership.findFirst({
                where: {
                    memberId,
                    status: { in: ['ACTIVE', 'FROZEN'] },
                },
                include: { plan: true },
                orderBy: { endDate: 'desc' },
            }),

            // Attendance this month
            prisma.attendance.count({
                where: {
                    memberId,
                    checkInTime: { gte: monthStart, lte: monthEnd },
                },
            }),

            // Recent attendance
            prisma.attendance.findMany({
                where: { memberId },
                orderBy: { checkInTime: 'desc' },
                take: 10,
            }),

            // Latest progress
            prisma.progressRecord.findMany({
                where: { memberId },
                orderBy: { recordedAt: 'desc' },
                take: 5,
            }),

            // Active workout
            prisma.memberWorkout.findFirst({
                where: { memberId, isActive: true },
                include: { workoutPlan: true },
            }),

            // Recent payments
            prisma.payment.findMany({
                where: { memberId, status: 'COMPLETED' },
                include: { membership: { include: { plan: true } } },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);

        // Calculate days remaining
        let daysRemaining = 0;
        if (membership) {
            const endDate = new Date(membership.endDate);
            daysRemaining = Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));
        }

        res.json({
            success: true,
            data: {
                membership: membership ? {
                    ...membership,
                    daysRemaining,
                } : null,
                attendance: {
                    thisMonth: attendanceThisMonth,
                    recent: recentAttendance,
                },
                progress,
                workout,
                payments,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAdminDashboard,
    getMemberDashboard,
};
