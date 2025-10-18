import express from 'express';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  addAttendee,
  getEventById,
  removeAttendee,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here are protected
router.route('/').get(protect, getEvents).post(protect, createEvent);
router.route('/:id').get(protect, getEventById).put(protect, updateEvent).delete(protect, deleteEvent);

// Route for managing attendees for a specific event
router.route('/:id/attendees').post(protect, addAttendee).delete(protect, removeAttendee);

export default router;