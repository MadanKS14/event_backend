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

    // --- RBAC Security Check ---
    // Use the role from auth middleware. Only admin can create tasks.
    if (req.user.role !== "admin") {
      return res
        .status(403) // 403 Forbidden
        .json({ message: "User not authorized to create tasks" });
    }

    // (Optional check: ensure admin is the one who created this event)
    // if (event.createdBy.toString() !== req.user.id) {
    //   return res
    //     .status(401)
    //     .json({ message: "Admin not authorized for this specific event" });
    // }

    const task = await Task.create({
      name,
      deadline,
      event: eventId,
      assignedAttendee: assignedAttendeeId,
      // We can assume 'status' defaults to 'Pending' in your model
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
    // --- RBAC Security Check ---
    let query = { event: req.params.eventId };

    // If the user is a regular user, only find tasks
    // assigned to them for this event.
    if (req.user.role === "user") {
      query.assignedAttendee = req.user._id;
    }

    // If user is 'admin', the query has no 'assignedAttendee' filter,
    // so they will get ALL tasks for the event.
    const tasks = await Task.find(query).populate(
      "assignedAttendee",
      "name email"
    );

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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

    // --- NEW AUTHORIZATION CHECK ---
    // Check if the task is assigned to the logged-in user
    const isAssignedUser =
      task.assignedAttendee &&
      task.assignedAttendee.toString() === req.user._id.toString();

    // Allow update if:
    // 1. The user is an 'admin'
    // 2. The user is the one assigned to the task
    if (req.user.role === "admin" || isAssignedUser) {
      task.status = status;
      await task.save();

      const io = req.app.get("socketio");
      const populatedTask = await task.populate(
        "assignedAttendee",
        "name email"
      );
      io.to(task.event.toString()).emit("task-updated", populatedTask);

      res.status(200).json(populatedTask);
    } else {
      // If not admin AND not assigned user, deny access.
      return res.status(403).json({ message: "User not authorized" }); // 403 Forbidden
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get event progress based on task completion
// @route   GET /api/tasks/progress/:eventId
const getEventProgress = async (req, res) => {
  try {
    // This query might also need to be user-aware
    // For now, we'll get progress for ALL tasks in the event
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