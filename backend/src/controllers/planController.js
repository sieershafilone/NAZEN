const prisma = require('../config/database');
const { calculateGST } = require('../utils/helpers');

// Get all plans
const getAllPlans = async (req, res, next) => {
    try {
        const { active } = req.query;

        const where = {};
        if (active !== undefined) {
            where.isActive = active === 'true';
        }

        const plans = await prisma.membershipPlan.findMany({
            where,
            orderBy: { durationDays: 'asc' },
        });

        res.json({
            success: true,
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};

// Get single plan
const getPlan = async (req, res, next) => {
    try {
        const { id } = req.params;

        const plan = await prisma.membershipPlan.findUnique({
            where: { id },
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found',
            });
        }

        res.json({
            success: true,
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

// Create plan (Admin only)
const createPlan = async (req, res, next) => {
    try {
        const {
            name,
            durationDays,
            basePrice,
            gstPercent = 18,
            description,
            features,
        } = req.body;

        // Calculate final price with GST
        const { totalAmount } = calculateGST(parseFloat(basePrice), parseFloat(gstPercent));

        const plan = await prisma.membershipPlan.create({
            data: {
                name,
                durationDays: parseInt(durationDays),
                basePrice: parseFloat(basePrice),
                gstPercent: parseFloat(gstPercent),
                finalPrice: totalAmount,
                description,
                features: features || [],
            },
        });

        res.status(201).json({
            success: true,
            message: 'Plan created successfully',
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

// Update plan (Admin only)
const updatePlan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            durationDays,
            basePrice,
            gstPercent,
            description,
            features,
            isActive,
        } = req.body;

        const existingPlan = await prisma.membershipPlan.findUnique({
            where: { id },
        });

        if (!existingPlan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found',
            });
        }

        // Calculate final price if basePrice or gstPercent changed
        let finalPrice = existingPlan.finalPrice;
        if (basePrice || gstPercent) {
            const price = parseFloat(basePrice || existingPlan.basePrice);
            const gst = parseFloat(gstPercent || existingPlan.gstPercent);
            const { totalAmount } = calculateGST(price, gst);
            finalPrice = totalAmount;
        }

        const plan = await prisma.membershipPlan.update({
            where: { id },
            data: {
                name,
                durationDays: durationDays ? parseInt(durationDays) : undefined,
                basePrice: basePrice ? parseFloat(basePrice) : undefined,
                gstPercent: gstPercent ? parseFloat(gstPercent) : undefined,
                finalPrice,
                description,
                features,
                isActive,
            },
        });

        res.json({
            success: true,
            message: 'Plan updated successfully',
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};

// Delete plan (Admin only)
const deletePlan = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if plan has active memberships
        const activeMemberships = await prisma.membership.count({
            where: {
                planId: id,
                status: 'ACTIVE',
            },
        });

        if (activeMemberships > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete plan. ${activeMemberships} active memberships are using this plan.`,
            });
        }

        await prisma.membershipPlan.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Plan deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan,
};
