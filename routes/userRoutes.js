import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
} from "../controllers/userController.js";

// 1. Import authorizeAdmin
import { protect, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// 2. Add authorizeAdmin to this route
router.route("/").get(protect, authorizeAdmin, getUsers);

export default router;