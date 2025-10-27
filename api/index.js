import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import userRoutes from "../routes/userRoutes.js";
import eventRoutes from "../routes/eventRoutes.js";
import taskRoutes from "../routes/taskRoutes.js";
import connectDB from "../config/db.js";

dotenv.config();

connectDB();

const app = express();
const httpServer = http.createServer(app);

// Setup Socket.IO Server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
});

// Setup Express CORS
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join-event-room", (eventId) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined room for event ${eventId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.get("/", (req, res) => {
  res.json({
    message: "Event Backend API",
    version: "1.0.0",
    status: "running",
  });
});

export default httpServer;