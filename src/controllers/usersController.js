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
      address,
      gender,
      dateOfBirth
    } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update user details if provided, otherwise retain existing
      user.firstName = firstName ?? user.firstName;
      user.lastName = lastName ?? user.lastName;
      user.email = email ?? user.email;
      user.phone = phone ?? user.phone;
      user.role = role ?? user.role;
      user.address = address ?? user.address;
      user.gender = gender ?? user.gender;
      user.dateOfBirth = dateOfBirth ?? user.dateOfBirth;

      // Upload profile picture if provided
      if (req.file && req.file.path) {
        user.profilePicture = req.file.path;
      } else if (profilePicture) {
        user.profilePicture = profilePicture;
      }

      // Update other fields
      user.referralCode = referralCode ?? user.referralCode;
      user.referredBy = referredBy ?? user.referredBy;
      user.isBanned = typeof isBanned === 'boolean' ? isBanned : user.isBanned;

      // Update wallets if provided
      if (Array.isArray(wallets)) {
        user.wallets = wallets;
      }

      // Update twoFA if provided
      if (twoFA) {
        user.twoFA = {
          ...user.twoFA,
          ...twoFA,
        };
      }

      // Update transactions if provided
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

// Add account details
const addAccountDetails = async (req, res) => {
  const { userId } = req.params;
  const { currency, accountDetails } = req.body;

  if (!currency || !accountDetails) {
    return res.status(400).json({ message: 'currency and accountDetails are required' });
  }

  if (!['fiat', 'crypto'].includes(currency)) {
    return res.status(400).json({ message: 'Invalid currency type. Must be "fiat" or "crypto"' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const detail = { currency, accountDetails: {} };

    if (currency === 'fiat') {
      const { bankName, accountName, accountNumber } = accountDetails;
      if (!bankName || !accountName || !accountNumber) {
        return res.status(400).json({ message: 'bankName, accountName, and accountNumber are required for fiat' });
      }

      detail.accountDetails.bankName = bankName;
      detail.accountDetails.accountName = accountName;
      detail.accountDetails.accountNumber = accountNumber;
    }

    if (currency === 'crypto') {
      const { address } = accountDetails;
      if (!address) {
        return res.status(400).json({ message: 'address is required for crypto' });
      }

      detail.accountDetails.address = address;
    }

    // Add new detail (append or update existing one with same currency)
    const existingIndex = user.paymentDetails.findIndex(pd => pd.currency === currency);
    if (existingIndex !== -1) {
      user.paymentDetails[existingIndex] = detail; // overwrite existing
    } else {
      user.paymentDetails.push(detail); // append new
    }

    await user.save();
    res.status(200).json({ message: 'Account details added/updated successfully', paymentDetails: user.paymentDetails });

  } catch (error) {
    console.error('Error adding account details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//delete user 
// Delete a user by ID
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    res.status(200).json({ message: 'User deleted successfully', deletedUser: user });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user', error: error.message });
  }
};



module.exports = { createUser, updateUser, deleteUser, getUsers, getUser, addAccountDetails };