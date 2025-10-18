import Task from "../models/taskModel.js";
import Event from "../models/eventModel.js";

// Create a task for an event
// @route   POST /api/tasks
const createTask = async (req, res) => {
  const { name, deadline, eventId, assignedAttendeeId } = req.body;

  if (!name || !deadline || !eventId || !assignedAttendeeId) {
    return res.status(400).json({ message: "Please add all required fields" });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.createdBy.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "User not authorized to manage this event" });
    }

    const task = await Task.create({
      name,
      deadline,
      event: eventId,
      assignedAttendee: assignedAttendeeId,
    });

    const io = req.app.get("socketio");
    const populatedTask = await task.populate("assignedAttendee", "name email");
    io.to(eventId).emit("task-created", populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Task creation failed", error: error.message });
  }
};

// Get all tasks for a specific event
// @route   GET /api/tasks/event/:eventId
const getTasksByEvent = async (req, res) => {
  try {
    const tasks = await Task.find({ event: req.params.eventId }).populate(
      "assignedAttendee",
      "name email"
    );
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update task status
// @route   PUT /api/tasks/:id
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

    const event = await Event.findById(task.event);
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    task.status = status;
    await task.save();

    const io = req.app.get("socketio");
    const populatedTask = await task.populate("assignedAttendee", "name email");
    io.to(task.event.toString()).emit("task-updated", populatedTask);

    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get event progress based on task completion
// @route   GET /api/tasks/progress/:eventId
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

export {
  createTask,
  getTasksByEvent,
  updateTaskStatus,
  getEventProgress,
};
