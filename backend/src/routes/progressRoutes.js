const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Member routes
router.get('/', authenticate, progressController.getMemberProgress);
router.post('/', authenticate, upload.single('photo'), progressController.addProgress);
router.get('/chart', authenticate, progressController.getProgressChart);

// Admin routes
router.get('/member/:memberId', authenticate, requireAdmin, progressController.getMemberProgress);
router.post('/member/:memberId', authenticate, requireAdmin, upload.single('photo'), progressController.addMemberProgress);
router.get('/chart/:memberId', authenticate, requireAdmin, progressController.getProgressChart);
router.delete('/:id', authenticate, requireAdmin, progressController.deleteProgress);

module.exports = router;
