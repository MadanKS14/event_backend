import Event from '../models/eventModel.js';
import Task from '../models/taskModel.js';


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
      attendees: [req.user.id],
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Event creation failed', error: error.message });
  }
};


const getEvents = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query = {};
    } else {
      query = { attendees: req.user._id };
    }
    const events = await Event.find(query).populate('attendees', 'name');
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot modify a completed event' });
    }

    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot delete a completed event' });
    }

    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Task.deleteMany({ event: event._id });

    await event.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


const addAttendee = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot add attendees to a completed event' });
    }

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


const removeAttendee = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID is required' });

  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot remove attendees from a completed event' });
    }

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


const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('attendees', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

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