const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validate');

// Validation schemas
const loginSchema = {
    mobile: { required: true, phone: true },
    password: { required: true, minLength: 6 },
};

const registerSchema = {
    fullName: { required: true, minLength: 2 },
    mobile: { required: true, phone: true },
    password: { required: true, minLength: 6 },
};

const updatePasswordSchema = {
    currentPassword: { required: true },
    newPassword: { required: true, minLength: 6 },
};

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/password', authenticate, validate(updatePasswordSchema), authController.updatePassword);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/profile/photo', authenticate, upload.single('photo'), authController.updateProfilePhoto);

module.exports = router;
