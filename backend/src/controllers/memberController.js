const prisma = require('../config/database');
const { generateMemberId, hashPassword, calculateEndDate, parsePhoneNumber } = require('../utils/helpers');
const { generateMemberQR } = require('../utils/qrGenerator');

// Get all members
const getAllMembers = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { memberId: { contains: search, mode: 'insensitive' } },
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { user: { mobile: { contains: search } } },
            ];
        }

        const [members, total] = await Promise.all([
            prisma.member.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            mobile: true,
                            status: true,
                            profilePhoto: true,
                        },
                    },
                    memberships: {
                        where: { status: 'ACTIVE' },
                        include: { plan: true },
                        orderBy: { endDate: 'desc' },
                        take: 1,
                    },
                },
                skip,
                take: parseInt(limit),
                orderBy: { joinDate: 'desc' },
            }),
            prisma.member.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                members,
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

// Get single member
const getMember = async (req, res, next) => {
    try {
        const { id } = req.params;

        const member = await prisma.member.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        mobile: true,
                        status: true,
                        profilePhoto: true,
                        createdAt: true,
                    },
                },
                memberships: {
                    include: { plan: true },
                    orderBy: { startDate: 'desc' },
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                attendance: {
                    orderBy: { checkInTime: 'desc' },
                    take: 30,
                },
                progressRecords: {
                    orderBy: { recordedAt: 'desc' },
                    take: 10,
                },
                memberWorkouts: {
                    where: { isActive: true },
                    include: { workoutPlan: true },
                },
            },
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        // Generate QR code
        const qrCode = await generateMemberQR(member.memberId, member.id);

        res.json({
            success: true,
            data: {
                ...member,
                qrCode,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Create new member
const createMember = async (req, res, next) => {
    try {
        const {
            fullName,
            email,
            mobile,
            password,
            gender,
            dateOfBirth,
            height,
            weight,
            fitnessGoal,
            medicalNotes,
            emergencyContact,
            planId,
        } = req.body;

        const normalizedMobile = parsePhoneNumber(mobile);

        // Check if mobile already exists
        const existingUser = await prisma.user.findUnique({
            where: { mobile: normalizedMobile },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Phone number already registered',
            });
        }

        // Generate member ID
        const memberId = await generateMemberId(prisma);

        // Hash password
        const hashedPassword = await hashPassword(password || mobile.slice(-6)); // Default: last 6 digits of phone

        // Create user and member in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    fullName,
                    email: email || null,
                    mobile: normalizedMobile,
                    password: hashedPassword,
                    role: 'MEMBER',
                },
            });

            // Create member
            const member = await tx.member.create({
                data: {
                    memberId,
                    userId: user.id,
                    gender,
                    dateOfBirth: new Date(dateOfBirth),
                    height: height ? parseFloat(height) : null,
                    weight: weight ? parseFloat(weight) : null,
                    fitnessGoal,
                    medicalNotes,
                    emergencyContact,
                },
            });

            // Create membership if plan selected
            let membership = null;
            if (planId) {
                const plan = await tx.membershipPlan.findUnique({
                    where: { id: planId },
                });

                if (plan) {
                    const startDate = new Date();
                    const endDate = calculateEndDate(startDate, plan.durationDays);

                    membership = await tx.membership.create({
                        data: {
                            memberId: member.id,
                            planId: plan.id,
                            startDate,
                            endDate,
                            status: 'ACTIVE',
                        },
                    });
                }
            }

            return { user, member, membership };
        });

        res.status(201).json({
            success: true,
            message: 'Member created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Update member
const updateMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            fullName,
            email,
            gender,
            dateOfBirth,
            height,
            weight,
            fitnessGoal,
            medicalNotes,
            emergencyContact,
            status,
        } = req.body;

        const member = await prisma.member.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        // Update in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update user
            const user = await tx.user.update({
                where: { id: member.userId },
                data: {
                    fullName,
                    email: email || null,
                    status: status || undefined,
                },
            });

            // Update member
            const updatedMember = await tx.member.update({
                where: { id },
                data: {
                    gender,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    height: height ? parseFloat(height) : undefined,
                    weight: weight ? parseFloat(weight) : undefined,
                    fitnessGoal,
                    medicalNotes,
                    emergencyContact,
                },
            });

            return { user, member: updatedMember };
        });

        res.json({
            success: true,
            message: 'Member updated successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Delete member
const deleteMember = async (req, res, next) => {
    try {
        const { id } = req.params;

        const member = await prisma.member.findUnique({
            where: { id },
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        // Delete user (cascades to member due to relation)
        await prisma.user.delete({
            where: { id: member.userId },
        });

        res.json({
            success: true,
            message: 'Member deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Freeze membership
const freezeMembership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { days, reason } = req.body;

        const membership = await prisma.membership.findFirst({
            where: {
                memberId: id,
                status: 'ACTIVE',
            },
        });

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'No active membership found',
            });
        }

        const updatedMembership = await prisma.membership.update({
            where: { id: membership.id },
            data: {
                status: 'FROZEN',
                frozenDays: days,
                frozenAt: new Date(),
                notes: reason,
            },
        });

        res.json({
            success: true,
            message: 'Membership frozen successfully',
            data: updatedMembership,
        });
    } catch (error) {
        next(error);
    }
};

// Unfreeze membership
const unfreezeMembership = async (req, res, next) => {
    try {
        const { id } = req.params;

        const membership = await prisma.membership.findFirst({
            where: {
                memberId: id,
                status: 'FROZEN',
            },
        });

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'No frozen membership found',
            });
        }

        // Extend end date by frozen days
        const newEndDate = new Date(membership.endDate);
        newEndDate.setDate(newEndDate.getDate() + membership.frozenDays);

        const updatedMembership = await prisma.membership.update({
            where: { id: membership.id },
            data: {
                status: 'ACTIVE',
                endDate: newEndDate,
                unfrozenAt: new Date(),
            },
        });

        res.json({
            success: true,
            message: 'Membership unfrozen successfully',
            data: updatedMembership,
        });
    } catch (error) {
        next(error);
    }
};

// Extend membership
const extendMembership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { days, reason } = req.body;

        const membership = await prisma.membership.findFirst({
            where: {
                memberId: id,
                status: { in: ['ACTIVE', 'EXPIRED'] },
            },
            orderBy: { endDate: 'desc' },
        });

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: 'No membership found',
            });
        }

        const currentEnd = new Date(membership.endDate);
        const newEndDate = new Date(Math.max(currentEnd.getTime(), Date.now()));
        newEndDate.setDate(newEndDate.getDate() + parseInt(days));

        const updatedMembership = await prisma.membership.update({
            where: { id: membership.id },
            data: {
                status: 'ACTIVE',
                endDate: newEndDate,
                notes: reason ? `${membership.notes || ''}\nExtended: ${reason}` : membership.notes,
            },
        });

        res.json({
            success: true,
            message: 'Membership extended successfully',
            data: updatedMembership,
        });
    } catch (error) {
        next(error);
    }
};

// Get member QR code
const getMemberQR = async (req, res, next) => {
    try {
        const { id } = req.params;

        const member = await prisma.member.findUnique({
            where: { id },
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        const qrCode = await generateMemberQR(member.memberId, member.id);

        res.json({
            success: true,
            data: {
                memberId: member.memberId,
                qrCode,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember,
    freezeMembership,
    unfreezeMembership,
    extendMembership,
    getMemberQR,
};
