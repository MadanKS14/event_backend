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
import { protect, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getEvents)
  .post(protect, authorizeAdmin, createEvent);


router.route('/:id')
  .get(protect, getEventById)
  .put(protect, authorizeAdmin, updateEvent)
  .delete(protect, authorizeAdmin, deleteEvent); 

router.route('/:id/attendees')
  .post(protect, authorizeAdmin, addAttendee) 
  .delete(protect, authorizeAdmin, removeAttendee);
export default router;