import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"; // <-- 1. Import Node's built-in http module
import { Server } from "socket.io"; // <-- 2. Import Server from socket.io
import userRoutes from "../routes/userRoutes.js";
import eventRoutes from "../routes/eventRoutes.js";
import taskRoutes from "../routes/taskRoutes.js";
import connectDB from "../config/db.js";

dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = http.createServer(app); // <-- 3. Create an http server from the Express app

// --- Define your allowed frontend URLs ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL, // This should be your Vercel frontend URL
  "https://event-frontend-madanks.vercel.app", // Hardcoding your known frontend URL is a good fallback
];

// --- 4. Setup Socket.IO Server ---
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Use the secure list of origins
    methods: ["GET", "POST"],
  },
});

// --- 5. Setup Express CORS ---
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- 6. Make Socket.IO accessible to your controllers ---
app.set("socketio", io);

// --- 7. Handle new socket connections ---
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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Event Backend API",
    version: "1.0.0",
    status: "running",
  });
});

// --- 8. Export the httpServer for Vercel, NOT the Express app ---
export default httpServer;