import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "../routes/userRoutes.js";
import eventRoutes from "../routes/eventRoutes.js";
import taskRoutes from "../routes/taskRoutes.js";
import connectDB from "../config/db.js";

dotenv.config();

// Connect to database
connectDB();

const app = express();

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
    status: "running"
  });
});

// Export the app for Vercel
export default app;
