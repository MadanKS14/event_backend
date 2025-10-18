import Event from '../models/eventModel.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin Only - checked by route middleware)
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

// @desc    Get events for the logged-in user (role-based)
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    let query = {};

    // --- THIS IS THE KEY RBAC LOGIC ---
    if (req.user.role === 'admin') {
      // If user is an admin, find all events
      query = {}; 
    } else {
      // If user is a regular user, find events where they are an attendee
      query = { attendees: req.user._id };
    }
    
    const events = await Event.find(query).populate('attendees', 'name');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin Only - checked by route middleware)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Auth is handled by 'authorizeAdmin' middleware in the route
    // We just double-check here for safety.
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
// @access  Private (Admin Only - checked by route middleware)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Auth is handled by 'authorizeAdmin' middleware
    if (req.user.role !== 'admin') {
       return res.status(401).json({ message: 'User not authorized' });
    }
    
    // We also need to delete all tasks associated with this event (future step)
    // await Task.deleteMany({ event: event._id });

    await event.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add attendee to an event
// @route   POST /api/events/:id/attendees
// @access  Private (Admin Only - checked by route middleware)
const addAttendee = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Auth is handled by 'authorizeAdmin' middleware
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
// @access  Private (Admin Only - checked by route middleware)
const removeAttendee = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });
  
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Auth is handled by 'authorizeAdmin' middleware
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

    // --- UPDATED RBAC LOGIC ---
    // Allow if user is an admin OR they are an attendee
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