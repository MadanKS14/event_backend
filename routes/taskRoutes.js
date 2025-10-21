import express from 'express';
import {
  createTask,
  getTasksByEvent,
  updateTaskStatus,
  getEventProgress,
} from '../controllers/taskController.js';
import { protect,authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/',authorizeAdmin, createTask);
router.get('/event/:eventId', getTasksByEvent);
router.put('/:id', updateTaskStatus);
router.get('/progress/:eventId', getEventProgress);

export default router;