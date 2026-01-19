const prisma = require('../config/database');

// Get member progress
const getMemberProgress = async (req, res, next) => {
    try {
        const memberId = req.user.member?.id || req.params.memberId;

        if (!memberId) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        const progress = await prisma.progressRecord.findMany({
            where: { memberId },
            orderBy: { recordedAt: 'desc' },
        });

        // Calculate stats
        const stats = {
            totalRecords: progress.length,
            latestWeight: progress[0]?.weight || null,
            startWeight: progress[progress.length - 1]?.weight || null,
            weightChange: null,
        };

        if (stats.latestWeight && stats.startWeight) {
            stats.weightChange = parseFloat((stats.latestWeight - stats.startWeight).toFixed(2));
        }

        res.json({
            success: true,
            data: {
                progress,
                stats,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Add progress record
const addProgress = async (req, res, next) => {
    try {
        const memberId = req.user.member?.id;

        if (!memberId) {
            return res.status(404).json({
                success: false,
                message: 'Member profile not found',
            });
        }

        const { weight, bodyFat, chest, waist, hips, arms, thighs, notes, recordedAt } = req.body;

        let photo = null;
        if (req.file) {
            photo = `/uploads/${req.file.filename}`;
        }

        const progress = await prisma.progressRecord.create({
            data: {
                memberId,
                weight: weight ? parseFloat(weight) : null,
                bodyFat: bodyFat ? parseFloat(bodyFat) : null,
                chest: chest ? parseFloat(chest) : null,
                waist: waist ? parseFloat(waist) : null,
                hips: hips ? parseFloat(hips) : null,
                arms: arms ? parseFloat(arms) : null,
                thighs: thighs ? parseFloat(thighs) : null,
                photo,
                notes,
                recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
            },
        });

        // Update member's weight
        if (weight) {
            await prisma.member.update({
                where: { id: memberId },
                data: { weight: parseFloat(weight) },
            });
        }

        res.status(201).json({
            success: true,
            message: 'Progress recorded successfully',
            data: progress,
        });
    } catch (error) {
        next(error);
    }
};

// Admin add progress for member
const addMemberProgress = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const { weight, bodyFat, chest, waist, hips, arms, thighs, notes, recordedAt } = req.body;

        let photo = null;
        if (req.file) {
            photo = `/uploads/${req.file.filename}`;
        }

        const progress = await prisma.progressRecord.create({
            data: {
                memberId,
                weight: weight ? parseFloat(weight) : null,
                bodyFat: bodyFat ? parseFloat(bodyFat) : null,
                chest: chest ? parseFloat(chest) : null,
                waist: waist ? parseFloat(waist) : null,
                hips: hips ? parseFloat(hips) : null,
                arms: arms ? parseFloat(arms) : null,
                thighs: thighs ? parseFloat(thighs) : null,
                photo,
                notes,
                recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
            },
        });

        // Update member's weight
        if (weight) {
            await prisma.member.update({
                where: { id: memberId },
                data: { weight: parseFloat(weight) },
            });
        }

        res.status(201).json({
            success: true,
            message: 'Progress recorded successfully',
            data: progress,
        });
    } catch (error) {
        next(error);
    }
};

// Delete progress record
const deleteProgress = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.progressRecord.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Progress record deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Get progress chart data
const getProgressChart = async (req, res, next) => {
    try {
        const memberId = req.user.member?.id || req.params.memberId;
        const { metric = 'weight', period = '6m' } = req.query;

        if (!memberId) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        // Calculate start date based on period
        const startDate = new Date();
        switch (period) {
            case '1m':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case '3m':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case '6m':
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(startDate.getMonth() - 6);
        }

        const progress = await prisma.progressRecord.findMany({
            where: {
                memberId,
                recordedAt: { gte: startDate },
            },
            select: {
                recordedAt: true,
                weight: true,
                bodyFat: true,
                chest: true,
                waist: true,
                hips: true,
                arms: true,
                thighs: true,
            },
            orderBy: { recordedAt: 'asc' },
        });

        // Format for chart
        const chartData = progress.map((p) => ({
            date: p.recordedAt,
            value: p[metric] ? parseFloat(p[metric]) : null,
        })).filter((p) => p.value !== null);

        res.json({
            success: true,
            data: {
                metric,
                period,
                chartData,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMemberProgress,
    addProgress,
    addMemberProgress,
    deleteProgress,
    getProgressChart,
};
