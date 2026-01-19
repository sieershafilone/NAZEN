const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/database');

// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, config.jwt.secret);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                member: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
            });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Account is not active.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token.',
        });
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
    }
    next();
};

// Check if user is member
const requireMember = (req, res, next) => {
    if (req.user.role !== 'MEMBER') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Member access only.',
        });
    }
    next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, config.jwt.secret);

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    member: true,
                },
            });

            if (user && user.status === 'ACTIVE') {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = {
    authenticate,
    requireAdmin,
    requireMember,
    optionalAuth,
};
