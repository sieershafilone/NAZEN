const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/gallery', imageController.getGallery);
router.get('/slider', imageController.getSliderImages);

// Protected routes (with optional auth for visibility check)
router.get('/', optionalAuth, imageController.getAllImages);
router.get('/:id', optionalAuth, imageController.getImage);

// Admin routes
router.post('/', authenticate, requireAdmin, upload.single('image'), imageController.uploadImage);
router.put('/:id', authenticate, requireAdmin, imageController.updateImage);
router.delete('/:id', authenticate, requireAdmin, imageController.deleteImage);

module.exports = router;
