import Event from '../models/eventModel.js';
import Task from '../models/taskModel.js'; // Import Task to delete tasks when an event is deleted

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin Only)
const createEvent = async (req, res) => {
  const { name, description, date, location } = req.body;
  if (!name || !description || !date || !location) {
    return res.status(400).json({ message: 'Please add all fields' });
  }
  try {
    const event = await Event.create({
      name,
      description,
      date,
      location,
      createdBy: req.user.id,
      attendees: [req.user.id], // Automatically add the creator as an attendee
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Event creation failed', error: error.message });
  }
};

// @desc    Get events (role-based)
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query = {}; // Admin gets all events
    } else {
      query = { attendees: req.user._id }; // User gets events they attend
    }
    const events = await Event.find(query).populate('attendees', 'name');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin Only)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // --- NEW CHECK ---
    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot modify a completed event' });
    }
    // --- END CHECK ---

    if (req.user.role !== 'admin') {
       return res.status(401).json({ message: 'User not authorized' });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin Only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // --- NEW CHECK ---
    // Note: You might allow admins to delete old events.
    // If so, you can comment out this check.
    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot delete a completed event' });
    }
    // --- END CHECK ---

    if (req.user.role !== 'admin') {
       return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Also delete all tasks for this event
    await Task.deleteMany({ event: event._id });

    await event.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add attendee to an event
// @route   POST /api/events/:id/attendees
// @access  Private (Admin Only)
const addAttendee = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // --- NEW CHECK ---
    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot add attendees to a completed event' });
    }
    // --- END CHECK ---

    if (req.user.role !== 'admin') {
       return res.status(401).json({ message: 'User not authorized' });
    }

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Attendee already added' });
    }
    
    event.attendees.push(userId);
    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove attendee from an event
// @route   DELETE /api/events/:id/attendees
// @access  Private (Admin Only)
const removeAttendee = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });
  
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // --- NEW CHECK ---
    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot remove attendees from a completed event' });
    }
    // --- END CHECK ---

    if (req.user.role !== 'admin') {
       return res.status(401).json({ message: 'User not authorized' });
    }

    event.attendees.pull(userId);
    await event.save();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('attendees', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // RBAC check: Allow if admin or an attendee
    const isAttendee = event.attendees.some(att => att._id.toString() === req.user.id);
    if (req.user.role === 'admin' || isAttendee) {
      res.status(200).json(event);
    } else {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  addAttendee,
  getEventById,
  removeAttendee,
};