import express from 'express';
import {
  createTask,
  getTasksByEvent,
  updateTaskStatus,
  getEventProgress,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all task routes
router.use(protect);

router.post('/', createTask);
router.get('/event/:eventId', getTasksByEvent);
router.put('/:id', updateTaskStatus);
router.get('/progress/:eventId', getEventProgress); // For the bonus point

export default router;