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
import { protect, authorizeAdmin } from '../middleware/authMiddleware.js'; // Make sure authorizeAdmin is imported

const router = express.Router();

// GET /api/events - Open to all logged-in users (admins get all, users get theirs)
// POST /api/events - ADMINS ONLY
router.route('/')
  .get(protect, getEvents)
  .post(protect, authorizeAdmin, createEvent); // <-- ✅ ADDED authorizeAdmin

// GET /api/events/:id - Open to admins and attendees
// PUT /api/events/:id - ADMINS ONLY
// DELETE /api/events/:id - ADMINS ONLY
router.route('/:id')
  .get(protect, getEventById)
  .put(protect, authorizeAdmin, updateEvent) // <-- ✅ ADDED authorizeAdmin
  .delete(protect, authorizeAdmin, deleteEvent); // <-- ✅ ADDED authorizeAdmin

// Route for managing attendees - ADMINS ONLY
router.route('/:id/attendees')
  .post(protect, authorizeAdmin, addAttendee) // <-- ✅ ADDED authorizeAdmin
  .delete(protect, authorizeAdmin, removeAttendee); // <-- ✅ ADDED authorizeAdmin

export default router;