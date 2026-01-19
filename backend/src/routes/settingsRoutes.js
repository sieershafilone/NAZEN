const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route
router.get('/public', settingsController.getPublicSettings);

// Admin routes
router.get('/', authenticate, requireAdmin, settingsController.getSettings);
router.put('/', authenticate, requireAdmin, settingsController.updateSettings);
router.put('/logo', authenticate, requireAdmin, upload.single('logo'), settingsController.updateLogo);

module.exports = router;
