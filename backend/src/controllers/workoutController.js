const prisma = require('../config/database');

// Get all workout plans
const getAllWorkouts = async (req, res, next) => {
    try {
        const { active, type } = req.query;

        const where = {};
        if (active !== undefined) where.isActive = active === 'true';
        if (type) where.type = type;

        const workouts = await prisma.workoutPlan.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: workouts,
        });
    } catch (error) {
        next(error);
    }
};

// Get single workout
const getWorkout = async (req, res, next) => {
    try {
        const { id } = req.params;

        const workout = await prisma.workoutPlan.findUnique({
            where: { id },
        });

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout plan not found',
            });
        }

        res.json({
            success: true,
            data: workout,
        });
    } catch (error) {
        next(error);
    }
};

// Create workout plan (Admin)
const createWorkout = async (req, res, next) => {
    try {
        const { name, type, description, exercises, daysPerWeek } = req.body;

        const workout = await prisma.workoutPlan.create({
            data: {
                name,
                type,
                description,
                exercises: exercises || [],
                daysPerWeek: daysPerWeek || 5,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Workout plan created successfully',
            data: workout,
        });
    } catch (error) {
        next(error);
    }
};

// Update workout plan (Admin)
const updateWorkout = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type, description, exercises, daysPerWeek, isActive } = req.body;

        const workout = await prisma.workoutPlan.update({
            where: { id },
            data: {
                name,
                type,
                description,
                exercises,
                daysPerWeek,
                isActive,
            },
        });

        res.json({
            success: true,
            message: 'Workout plan updated successfully',
            data: workout,
        });
    } catch (error) {
        next(error);
    }
};

// Delete workout plan (Admin)
const deleteWorkout = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.workoutPlan.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Workout plan deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Assign workout to member (Admin)
const assignWorkout = async (req, res, next) => {
    try {
        const { memberId, workoutPlanId, notes } = req.body;

        // Deactivate previous assignments
        await prisma.memberWorkout.updateMany({
            where: { memberId, isActive: true },
            data: { isActive: false },
        });

        const assignment = await prisma.memberWorkout.upsert({
            where: {
                memberId_workoutPlanId: {
                    memberId,
                    workoutPlanId,
                },
            },
            create: {
                memberId,
                workoutPlanId,
                notes,
                isActive: true,
            },
            update: {
                isActive: true,
                notes,
                assignedAt: new Date(),
            },
        });

        res.json({
            success: true,
            message: 'Workout assigned successfully',
            data: assignment,
        });
    } catch (error) {
        next(error);
    }
};

// Get member's workout
const getMemberWorkout = async (req, res, next) => {
    try {
        const memberId = req.user.member?.id || req.params.memberId;

        if (!memberId) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        const assignment = await prisma.memberWorkout.findFirst({
            where: {
                memberId,
                isActive: true,
            },
            include: {
                workoutPlan: true,
            },
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'No workout plan assigned',
            });
        }

        res.json({
            success: true,
            data: assignment,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllWorkouts,
    getWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    assignWorkout,
    getMemberWorkout,
};
