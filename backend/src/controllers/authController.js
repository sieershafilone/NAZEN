const prisma = require('../config/database');
const { generateToken, hashPassword, comparePassword, parsePhoneNumber } = require('../utils/helpers');

// Register new user (Admin only creates members)
const register = async (req, res, next) => {
    try {
        const { fullName, email, mobile, password, role } = req.body;
        const normalizedMobile = parsePhoneNumber(mobile);

        // Check if mobile already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { mobile: normalizedMobile },
                    ...(email ? [{ email }] : []),
                ],
            },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.mobile === normalizedMobile
                    ? 'Phone number already registered'
                    : 'Email already registered',
            });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                fullName,
                email: email || null,
                mobile: normalizedMobile,
                password: hashedPassword,
                role: role || 'MEMBER',
            },
        });

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login
const login = async (req, res, next) => {
    try {
        const { mobile, password } = req.body;
        const normalizedMobile = parsePhoneNumber(mobile);

        const user = await prisma.user.findUnique({
            where: { mobile: normalizedMobile },
            include: { member: true },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone number or password',
            });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Account is not active. Please contact admin.',
            });
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone number or password',
            });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    mobile: user.mobile,
                    role: user.role,
                    profilePhoto: user.profilePhoto,
                    member: user.member,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get current user
const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                member: {
                    include: {
                        memberships: {
                            where: { status: 'ACTIVE' },
                            include: { plan: true },
                            orderBy: { endDate: 'desc' },
                            take: 1,
                        },
                    },
                },
            },
        });

        res.json({
            success: true,
            data: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                profilePhoto: user.profilePhoto,
                status: user.status,
                createdAt: user.createdAt,
                member: user.member,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update password
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        const isPasswordValid = await comparePassword(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });

        res.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Update profile
const updateProfile = async (req, res, next) => {
    try {
        const { fullName, email, mobile } = req.body;

        // If mobile or email is being updated, check for uniqueness
        if (mobile || email) {
            let normalizedMobile = mobile ? parsePhoneNumber(mobile) : undefined;

            const existingUser = await prisma.user.findFirst({
                where: {
                    AND: [
                        { id: { not: req.user.id } }, // Exclude current user
                        {
                            OR: [
                                ...(normalizedMobile ? [{ mobile: normalizedMobile }] : []),
                                ...(email ? [{ email }] : []),
                            ],
                        },
                    ],
                },
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: existingUser.mobile === normalizedMobile
                        ? 'Phone number already registered'
                        : 'Email already registered',
                });
            }

            // If uniqueness check pass, add normalized mobile to update data if present
            if (mobile) {
                req.body.mobile = normalizedMobile;
            }
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                fullName,
                mobile: req.body.mobile, // Use potentially normalized mobile
                email: email || null,
            },
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Update profile photo
const updateProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const photoUrl = `/uploads/${req.file.filename}`;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { profilePhoto: photoUrl },
        });

        res.json({
            success: true,
            message: 'Profile photo updated successfully',
            data: {
                profilePhoto: user.profilePhoto,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updatePassword,
    updateProfile,
    updateProfilePhoto,
};
