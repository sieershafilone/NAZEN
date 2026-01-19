const prisma = require('../config/database');
const { parseQRData } = require('../utils/qrGenerator');

// Check in (Manual)
const checkIn = async (req, res, next) => {
    try {
        const { memberId } = req.body;

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: {
                memberships: {
                    where: { status: 'ACTIVE' },
                    orderBy: { endDate: 'desc' },
                    take: 1,
                },
            },
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        // Check if membership is active
        if (member.memberships.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active membership found',
            });
        }

        // Check for existing check-in today without check-out
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingCheckIn = await prisma.attendance.findFirst({
            where: {
                memberId,
                checkInTime: { gte: today },
                checkOutTime: null,
            },
        });

        if (existingCheckIn) {
            return res.status(400).json({
                success: false,
                message: 'Already checked in. Please check out first.',
            });
        }

        const attendance = await prisma.attendance.create({
            data: {
                memberId,
                method: 'MANUAL',
            },
        });

        res.status(201).json({
            success: true,
            message: 'Check-in successful',
            data: attendance,
        });
    } catch (error) {
        next(error);
    }
};

// Check in via QR
const checkInQR = async (req, res, next) => {
    try {
        const { qrData } = req.body;

        const parsed = parseQRData(qrData);

        const member = await prisma.member.findUnique({
            where: { id: parsed.uuid },
            include: {
                user: true,
                memberships: {
                    where: { status: 'ACTIVE' },
                    orderBy: { endDate: 'desc' },
                    take: 1,
                },
            },
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        if (member.memberships.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active membership found',
                memberName: member.user.fullName,
            });
        }

        // Check for existing check-in
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingCheckIn = await prisma.attendance.findFirst({
            where: {
                memberId: member.id,
                checkInTime: { gte: today },
                checkOutTime: null,
            },
        });

        if (existingCheckIn) {
            // Auto check-out
            const attendance = await prisma.attendance.update({
                where: { id: existingCheckIn.id },
                data: { checkOutTime: new Date() },
            });

            return res.json({
                success: true,
                message: 'Check-out successful',
                data: {
                    ...attendance,
                    memberName: member.user.fullName,
                    action: 'CHECKOUT',
                },
            });
        }

        // New check-in
        const attendance = await prisma.attendance.create({
            data: {
                memberId: member.id,
                method: 'QR',
            },
        });

        res.status(201).json({
            success: true,
            message: 'Check-in successful',
            data: {
                ...attendance,
                memberName: member.user.fullName,
                action: 'CHECKIN',
            },
        });
    } catch (error) {
        next(error);
    }
};

// Check out
const checkOut = async (req, res, next) => {
    try {
        const { memberId } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findFirst({
            where: {
                memberId,
                checkInTime: { gte: today },
                checkOutTime: null,
            },
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'No check-in found for today',
            });
        }

        const updated = await prisma.attendance.update({
            where: { id: attendance.id },
            data: { checkOutTime: new Date() },
        });

        res.json({
            success: true,
            message: 'Check-out successful',
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

// Get all attendance (Admin)
const getAllAttendance = async (req, res, next) => {
    try {
        const { memberId, date, startDate, endDate, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (memberId) where.memberId = memberId;

        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);
            where.checkInTime = {
                gte: targetDate,
                lt: nextDay,
            };
        } else if (startDate || endDate) {
            where.checkInTime = {};
            if (startDate) where.checkInTime.gte = new Date(startDate);
            if (endDate) where.checkInTime.lte = new Date(endDate);
        }

        const [attendance, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                include: {
                    member: {
                        include: {
                            user: {
                                select: { fullName: true, profilePhoto: true },
                            },
                        },
                    },
                },
                skip,
                take: parseInt(limit),
                orderBy: { checkInTime: 'desc' },
            }),
            prisma.attendance.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                attendance,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get member attendance (for member dashboard)
const getMemberAttendance = async (req, res, next) => {
    try {
        const memberId = req.user.member?.id;

        if (!memberId) {
            return res.status(404).json({
                success: false,
                message: 'Member profile not found',
            });
        }

        const { month, year } = req.query;

        let startDate, endDate;
        if (month && year) {
            startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        } else {
            // Current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        const attendance = await prisma.attendance.findMany({
            where: {
                memberId,
                checkInTime: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { checkInTime: 'desc' },
        });

        // Calculate stats
        const totalDays = attendance.length;
        const totalHours = attendance.reduce((acc, a) => {
            if (a.checkOutTime) {
                const hours = (new Date(a.checkOutTime) - new Date(a.checkInTime)) / (1000 * 60 * 60);
                return acc + hours;
            }
            return acc;
        }, 0);

        res.json({
            success: true,
            data: {
                attendance,
                stats: {
                    totalDays,
                    totalHours: Math.round(totalHours * 10) / 10,
                    averageHours: totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get today's attendance count
const getTodayAttendance = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [total, currentlyIn] = await Promise.all([
            prisma.attendance.count({
                where: {
                    checkInTime: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
            prisma.attendance.count({
                where: {
                    checkInTime: {
                        gte: today,
                        lt: tomorrow,
                    },
                    checkOutTime: null,
                },
            }),
        ]);

        res.json({
            success: true,
            data: {
                total,
                currentlyIn,
                checkedOut: total - currentlyIn,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    checkIn,
    checkInQR,
    checkOut,
    getAllAttendance,
    getMemberAttendance,
    getTodayAttendance,
};
