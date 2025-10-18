import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// --- Define your allowed origins ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
  "https://event-frontend-madanks.vercel.app",
  process.env.FRONTEND_URL, // In case you use the env var
];

// --- 1. Socket.IO Server Setup (Fixed CORS) ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // <-- Use your secure origin list
    methods: ["GET", "POST"],
  },
});

// --- 2. Express CORS setup ---
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make socket.io available to controllers
app.set("socketio", io);

// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-event-room", (eventId) => {
    socket.join(eventId);
    console.log(`User ${socket.id} joined room for event ${eventId}`);
  });

  socket.on("leave-event-room", (eventId) => {
    socket.leave(eventId);
    console.log(`User ${socket.id} left room for event ${eventId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// --- 3. API Routes ---
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);

// --- 4. THIS IS THE FIX ---
// Remove the server.listen() and export the server
// Vercel will handle the rest.
export default server;