import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

/* ------------------------- TOKEN GENERATION ------------------------- */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* ------------------------- REGISTER USER ------------------------- */
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // user or admin
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid user data", error: error.message });
  }
};

/* ------------------------- LOGIN USER ------------------------- */
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // important for frontend role-based routing
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid credentials" });
  }
};

/* ------------------------- GET ALL USERS (Admin Only) ------------------------- */
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ------------------------- GET CURRENT LOGGED-IN USER ------------------------- */
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user profile (name & password)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { name, password } = req.body;

  // Find the user by their ID (from the 'protect' middleware)
  const user = await User.findById(req.user._id);

  if (user) {
    // Update name if it was provided
    if (name) {
      user.name = name;
    }

    // Update password if it was provided
    // The .pre('save') hook in your userModel will automatically hash it
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    // Send back the updated user info with a new token
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id), // Send a new token
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};


export { registerUser, loginUser, getUsers,getMe,updateUserProfile };