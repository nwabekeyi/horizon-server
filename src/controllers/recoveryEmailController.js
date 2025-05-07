import { User } from '../models/userModel.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { sendEmail } from '../configs/emailConfig.js';

// Helper: Check valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Generate a random temporary password
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8); // Simple 8-character random string
};

// POST initiate account recovery
export const initiateAccountRecovery = async (req, res) => {
  const { email } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid or missing email address' });
  }

  try {
    // Find user by primary email
    const user = await User.findOne({ email }).select('+password +twoFA.secret');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if recovery email exists and has length > 0
    if (!user.recoveryEmail || user.recoveryEmail.length < 1) {
      return res.status(400).json({ success: false, error: 'Recovery email not set' });
    }

    // Generate a temporary password
    const tempPassword = generateTempPassword();
    const saltRounds = 10;
    const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);

    // Update user with temporary password and mark it as requiring reset
    user.password = hashedTempPassword;
    user.mustResetPassword = true; // Ensure this field exists in your schema
    await user.save();

    // Prepare recovery data
    const recoveryData = {
      email: user.email,
      tempPassword, // Send plaintext temporary password
    };

    // Send recovery email to recoveryEmail
    await sendEmail({
      to: user.recoveryEmail,
      subject: 'Account Recovery - 247 Active Trading',
      template: 'recovery',
      data: {
        firstName: user.firstName,
        email: recoveryData.email,
        tempPassword: recoveryData.tempPassword,
        twoFASecret: recoveryData.twoFASecret, // Include 2FA secret as requested
        recoveryDate: new Date().toLocaleString(),
      },
    });

    res.status(200).json({ success: true, message: 'Recovery information sent to your recovery email' });
  } catch (err) {
    console.error('Error initiating account recovery:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


// GET recovery email
export const getRecoveryEmail = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId).select('recoveryEmail');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ recoveryEmail: user.recoveryEmail || null });
  } catch (err) {
    console.error('Error getting recovery email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT recovery email (add/update)
export const setRecoveryEmail = async (req, res) => {
  const { userId } = req.params;
  const { recoveryEmail } = req.body;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  if (!recoveryEmail || typeof recoveryEmail !== 'string' || !/^\S+@\S+\.\S+$/.test(recoveryEmail)) {
    return res.status(400).json({ error: 'Invalid or missing recovery email address' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.recoveryEmail = recoveryEmail;
    await user.save();

    res.status(200).json({ message: 'Recovery email updated', recoveryEmail });
  } catch (err) {
    console.error('Error setting recovery email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE recovery email
export const removeRecoveryEmail = async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.recoveryEmail = undefined;
    await user.save();

    res.status(200).json({ message: 'Recovery email removed' });
  } catch (err) {
    console.error('Error removing recovery email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
