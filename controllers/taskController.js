import Task from "../models/taskModel.js";
import Event from "../models/eventModel.js";

// @desc    Create a task for an event
// @route   POST /api/tasks
// @access  Private (Admin Only)
const createTask = async (req, res) => {
  const { name, deadline, eventId, assignedAttendeeId } = req.body;

  if (!name || !deadline || !eventId || !assignedAttendeeId) {
    return res.status(400).json({ message: "Please add all required fields" });
  }

  try {
    // --- CHECK 1: Ensure event exists and is not completed ---
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot add tasks to a completed event' });
    }
    // --- END CHECK ---

    // --- RBAC Security Check ---
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "User not authorized to create tasks" });
    }

    const task = await Task.create({
      name,
      deadline,
      event: eventId,
      assignedAttendee: assignedAttendeeId,
      status: "Pending", // Explicitly set status
    });

    const io = req.app.get("socketio");
    const populatedTask = await task.populate("assignedAttendee", "name email");
    // Emit to the specific event room
    io.to(eventId).emit("task-created", populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Task creation failed", error: error.message });
  }
};



// @desc    Get all tasks for a specific event
// @route   GET /api/tasks/event/:eventId
// @access  Private (Role-Aware)
const getTasksByEvent = async (req, res) => {
  try {
    let query = { event: req.params.eventId };

    if (req.user.role === "user") {
      query.assignedAttendee = req.user._id;
    }

    const tasks = await Task.find(query).populate(
      "assignedAttendee",
      "name email"
    );

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private (Role-Aware)
const updateTaskStatus = async (req, res) => {
  const { status } = req.body;

  if (!status || !["Pending", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status provided" });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // --- CHECK 2: Ensure the event is not completed ---
    const event = await Event.findById(task.event);
    if (!event) {
        // Should ideally not happen if DB is consistent, but good to check
        return res.status(404).json({ message: "Associated event not found" });
    }
    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot update tasks for a completed event' });
    }
    // --- END CHECK ---

    const isAssignedUser =
      task.assignedAttendee &&
      task.assignedAttendee.toString() === req.user._id.toString();

    // Allow update if admin OR assigned user
    if (req.user.role === "admin" || isAssignedUser) {
      task.status = status;
      await task.save();

      const io = req.app.get("socketio");
      const populatedTask = await task.populate(
        "assignedAttendee",
        "name email"
      );
      // Emit to the specific event room
      io.to(task.event.toString()).emit("task-updated", populatedTask);

      res.status(200).json(populatedTask);
    } else {
      return res.status(403).json({ message: "User not authorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// @desc    Get event progress based on task completion
// @route   GET /api/tasks/progress/:eventId
// @access  Private
const getEventProgress = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ event: req.params.eventId });
    if (totalTasks === 0) {
      return res.status(200).json({ progress: 0 });
    }
    const completedTasks = await Task.countDocuments({
      event: req.params.eventId,
      status: "Completed",
    });
    const progress = Math.round((completedTasks / totalTasks) * 100);
    res.status(200).json({ progress });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export { createTask, getTasksByEvent, updateTaskStatus, getEventProgress };