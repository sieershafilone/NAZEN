const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public route - get all active plans
router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlan);

// Admin routes
router.post('/', authenticate, requireAdmin, planController.createPlan);
router.put('/:id', authenticate, requireAdmin, planController.updatePlan);
router.delete('/:id', authenticate, requireAdmin, planController.deletePlan);

module.exports = router;
