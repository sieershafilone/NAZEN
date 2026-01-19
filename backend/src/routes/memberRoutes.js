const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public/Auth routes
router.use(authenticate);

// Member Self-Service Routes (Must come before /:id to avoid conflict if we had specific paths, but here fine)
// We need to allow members to fetch their own details.
// However, the frontend requests /members/:id.
// So we need a middleware to check if user is admin OR accessing their own id.

const requireAdminOrSelf = (req, res, next) => {
    if (req.user.role === 'ADMIN') return next();

    // Check if accessing their own member ID
    // ID comes from params.id
    if (req.user.member && req.user.member.id === req.params.id) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Access denied',
    });
};

// Admin Only Routes
router.get('/', requireAdmin, memberController.getAllMembers);
router.post('/', requireAdmin, memberController.createMember);

// Routes accessible by Admin or specific Member
router.get('/:id', requireAdminOrSelf, memberController.getMember);
router.put('/:id', requireAdmin, memberController.updateMember); // Only admin can update for now
router.delete('/:id', requireAdmin, memberController.deleteMember);

// Membership management (Admin only)
router.put('/:id/freeze', requireAdmin, memberController.freezeMembership);
router.put('/:id/unfreeze', requireAdmin, memberController.unfreezeMembership);
router.put('/:id/extend', requireAdmin, memberController.extendMembership);

// QR Code (Admin or Self)
router.get('/:id/qr', requireAdminOrSelf, memberController.getMemberQR);

module.exports = router;
