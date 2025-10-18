import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an event name"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    date: {
      type: Date,
      required: [true, "Please add a date"],
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    illustration: {
      type: String,
      enum: ["conference", "workshop", "meeting", "party", "webinar"],
      default: "conference",
    },
    category: {
      type: String,
      enum: ["business", "social", "educational"],
      required: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Event", eventSchema);
