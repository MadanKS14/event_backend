import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.route("/").get(protect, getUsers);

export default router;
