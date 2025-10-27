import Task from "../models/taskModel.js";
import Event from "../models/eventModel.js";


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
    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot add tasks to a completed event' });
    }

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
      status: "Pending",
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
    if (!event) {
        return res.status(404).json({ message: "Associated event not found" });
    }
    if (new Date(event.date) < new Date()) {
      return res.status(403).json({ message: 'Cannot update tasks for a completed event' });
    }

    const isAssignedUser =
      task.assignedAttendee &&
      task.assignedAttendee.toString() === req.user._id.toString();

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
      return res.status(403).json({ message: "User not authorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



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