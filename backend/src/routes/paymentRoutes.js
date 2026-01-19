const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, requireAdmin, requireMember } = require('../middleware/auth');

// Admin routes
router.get('/', authenticate, requireAdmin, paymentController.getAllPayments);
router.get('/:id', authenticate, paymentController.getPayment);
router.post('/manual', authenticate, requireAdmin, paymentController.createManualPayment);
router.delete('/:id', authenticate, requireAdmin, paymentController.deletePayment);

// Razorpay routes
router.post('/razorpay/order', authenticate, paymentController.createRazorpayOrder);
router.post('/razorpay/verify', authenticate, paymentController.verifyRazorpayPayment);

// Invoice download
router.get('/:id/invoice', authenticate, paymentController.downloadInvoice);

// Member routes
router.get('/member/history', authenticate, paymentController.getMemberPayments);

module.exports = router;
