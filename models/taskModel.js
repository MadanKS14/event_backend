import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a task name'],
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  assignedAttendee: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Task', taskSchema);