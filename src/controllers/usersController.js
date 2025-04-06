const bcrypt = require('bcrypt');
const {User} = require('../models/userModel');
const RegistrationPin = require('../models/registrationPinModel');
const createMulter = require('../configs/multerConfig');


// Create user with PIN verification
const createUser = async (req, res) => {
  console.log('Create User Request Body:', req.body);
  const { firstName, lastName, email, password, role, pin } = req.body || {};

  if (!firstName || !lastName || !email || !password || !pin) {
    return res.status(400).json({ message: 'All fields (firstName, lastName, email, password, pin) are required' });
  }

  try {
    // Verify PIN
    const registrationPin = await RegistrationPin.findOne({ email, pin });
    if (!registrationPin) {
      return res.status(400).json({ message: 'Invalid or expired PIN' });
    }

    // Check if PIN is expired
    if (new Date() > registrationPin.expiresAt) {
      return res.status(400).json({ message: 'PIN has expired. Please generate a new one.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();

    // Optionally delete the used PIN
    await RegistrationPin.deleteOne({ _id: registrationPin._id });

    // Welcome message
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
    console.error('Error creating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    res.status(500).json({
      message: 'Server error: Unable to create user',
      error: error.message || error,
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  const profilePictureUpload = createMulter("profile_pictures", "png").single("profilePicture");

  // Handle profile picture upload
  profilePictureUpload(req, res, async (err) => {
    if (err) {
      console.error("Profile Picture upload error:", err);
      return res.status(400).json({ message: "Profile picture upload failed", error: err.message });
    }

    const userId = req.params.id;
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      profilePicture,
      wallets,
      twoFA,
      referralCode,
      referredBy,
      isBanned,
      transactions,
    } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      user.firstName = firstName ?? user.firstName;
      user.lastName = lastName ?? user.lastName;
      user.email = email ?? user.email;
      user.phone = phone ?? user.phone;
      user.role = role ?? user.role;

      // Upload profile picture
      if (req.file && req.file.path) {
        user.profilePicture = req.file.path;
      } else if (profilePicture) {
        user.profilePicture = profilePicture;
      }

      // Update other fields
      user.referralCode = referralCode ?? user.referralCode;
      user.referredBy = referredBy ?? user.referredBy;
      user.isBanned = typeof isBanned === 'boolean' ? isBanned : user.isBanned;

      if (Array.isArray(wallets)) {
        user.wallets = wallets;
      }

      if (twoFA) {
        user.twoFA = {
          ...user.twoFA,
          ...twoFA,
        };
      }

      if (Array.isArray(transactions)) {
        user.transactions = [...new Set([...user.transactions, ...transactions])];
      }

      await user.save();

      return res.status(200).json({ message: 'User updated successfully', user });

    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
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