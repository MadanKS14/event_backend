import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getMe,
  updateUserProfile,
  createUserByAdmin, 
} from "../controllers/userController.js";
import { protect, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, getMe);

router.get("/", protect, authorizeAdmin, getUsers);

router.put("/profile", protect, updateUserProfile);

router.post('/', protect, authorizeAdmin, createUserByAdmin);

export default router;
