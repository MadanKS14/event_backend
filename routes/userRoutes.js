import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getMe,
  updateUserProfile, // ✅ Import getMe controller
} from "../controllers/userController.js";
import { protect, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Private route for logged-in users to fetch their profile
router.get("/me", protect, getMe);

// ✅ Admin-only route to list all users
router.get("/", protect, authorizeAdmin, getUsers);

router.put("/profile", protect, updateUserProfile);

export default router;
