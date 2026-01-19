const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Admin routes
router.get('/', authenticate, requireAdmin, attendanceController.getAllAttendance);
router.get('/today', authenticate, requireAdmin, attendanceController.getTodayAttendance);
router.post('/checkin', authenticate, requireAdmin, attendanceController.checkIn);
router.post('/checkout', authenticate, requireAdmin, attendanceController.checkOut);
router.post('/qr', authenticate, attendanceController.checkInQR);

// Member routes
router.get('/member', authenticate, attendanceController.getMemberAttendance);

module.exports = router;
