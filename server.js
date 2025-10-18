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
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// CORS configuration for Express routes
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "http://localhost:8080",
    // Add your production domain here
    process.env.FRONTEND_URL || "https://your-frontend-domain.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("socketio", io);

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

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
