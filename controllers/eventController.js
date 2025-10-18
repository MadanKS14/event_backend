import Event from '../models/eventModel.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
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
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Event creation failed', error: error.message });
  }
};

// @desc    Get all events created by the user
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user.id) {
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
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    await event.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add attendee to an event
// @route   POST /api/events/:id/attendees
// @access  Private
const addAttendee = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id) {
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
// @access  Private
const removeAttendee = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
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
    // This is the correct version with .populate()
    const event = await Event.findById(req.params.id).populate('attendees', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    res.status(200).json(event);
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