import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
// import { OAuth2Client } from "google-auth-library"; // ✨ ADD THIS
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // ✨ ADD THIS

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register new user
// @route   POST /api/users/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Create user
  try {
    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid user data", error: error.message });
  }
};

// Authenticate a user
// @route   POST /api/users/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  // Check for user by email
  const user = await User.findOne({ email });

  // Check if user exists and password matches
  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
};

// Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password"); // Find all users, exclude passwords
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export {
  registerUser,
  loginUser,
  getUsers,
};
