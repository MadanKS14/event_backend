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

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  },
});

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("socketio", io);

io.on("connection", (socket) => {

  socket.on("join-event-room", (eventId) => {
    socket.join(eventId);
  });

  socket.on("leave-event-room", (eventId) => {
    socket.leave(eventId);
  });

  socket.on("disconnect", () => {
  });
});

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;