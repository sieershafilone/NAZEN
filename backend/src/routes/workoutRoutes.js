const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public/Member routes
router.get('/', authenticate, workoutController.getAllWorkouts);
router.get('/member', authenticate, workoutController.getMemberWorkout);
router.get('/:id', authenticate, workoutController.getWorkout);

// Admin routes
router.post('/', authenticate, requireAdmin, workoutController.createWorkout);
router.put('/:id', authenticate, requireAdmin, workoutController.updateWorkout);
router.delete('/:id', authenticate, requireAdmin, workoutController.deleteWorkout);
router.post('/assign', authenticate, requireAdmin, workoutController.assignWorkout);

// Admin get member workout
router.get('/member/:memberId', authenticate, requireAdmin, workoutController.getMemberWorkout);

module.exports = router;
