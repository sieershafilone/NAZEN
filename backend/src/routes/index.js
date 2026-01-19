const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const memberRoutes = require('./memberRoutes');
const planRoutes = require('./planRoutes');
const paymentRoutes = require('./paymentRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const workoutRoutes = require('./workoutRoutes');
const progressRoutes = require('./progressRoutes');
const imageRoutes = require('./imageRoutes');
const settingsRoutes = require('./settingsRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/plans', planRoutes);
router.use('/payments', paymentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/workouts', workoutRoutes);
router.use('/progress', progressRoutes);
router.use('/images', imageRoutes);
router.use('/settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nazen Gym API is running',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
