const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Admin dashboard
router.get('/admin', authenticate, requireAdmin, dashboardController.getAdminDashboard);

// Member dashboard
router.get('/member', authenticate, dashboardController.getMemberDashboard);

module.exports = router;
