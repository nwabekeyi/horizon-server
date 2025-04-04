const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { signJwt } = require('../utils/JWTconfig');

// Create user
const createUser = async (req, res) => {
    console.log('Request Body:', req.body); // Debug log
    const { firstName, lastName, email, password, role } = req.body || {}; // Fallback to empty object
  
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email is already in use" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ firstName, lastName, email, password: hashedPassword, role });
      await user.save();
  
      const welcomeMessage = `Hello ${firstName}, your account has been successfully created. Welcome to our platform!`;
      res.status(201).json({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          dateJoined: user.dateJoined,
        },
        message: welcomeMessage,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: "Validation error", error: error.message });
      }
      res.status(500).json({
        message: "Server error: Unable to create user",
        error: error.message || error,
      });
    }
  };
// Update user
const updateUser = async (req, res) => {
  const { firstName, lastName, email, role } = req.body;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a user by ID
const getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

module.exports = { createUser, updateUser, deleteUser, getUsers, getUser };
