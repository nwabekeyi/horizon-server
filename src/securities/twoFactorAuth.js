import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js';
import { sendEmail } from '../configs/emailConfig.js';
import jwt from 'jsonwebtoken';
import { prodUrl, nodeEnv } from '../configs/envConfig.js';

// Setup 2FA
export const setupTwoFA = async (req, res) => {
  const { userId, secret } = req.body;

  if (!secret) return res.status(400).json({ success: false, message: '2FA secret is required' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.twoFA.enabled) {
      return res.status(400).json({ success: false, message: '2FA is already enabled' });
    }

    const hashedSecret = await bcrypt.hash(secret, 10);
    user.twoFA = { enabled: true, secret: hashedSecret };
    await user.save();

    res.status(200).json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Verify 2FA Secret
export const verifyTwoFASecret = async (req, res) => {
  const { secret, userId } = req.body;

  if (!userId || !secret) {
    return res.status(400).json({ success: false, message: 'User ID and 2FA secret are required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.twoFA.enabled || !user.twoFA.secret || user.twoFA.length < 1) {
      return res.status(400).json({ success: false, message: '2FA is not enabled or secret is not set' });
    }

    const isMatch = await bcrypt.compare(secret, user.twoFA.secret);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA secret' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: '2FA verified successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Request to update 2FA secret
export const requestTwoFAUpdate = async (req, res) => {
  const { userId } = req.body;

  try {
    const token = jwt.sign({ userId }, process.env.TWO_FA_UPDATE_SECRET, { expiresIn: '10m' });
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const frontendUrl = nodeEnv === 'production' ? prodUrl : 'http://localhost:3000';
    await sendEmail({
      to: user.email,
      subject: 'Confirm 2FA Secret Update',
      template: 'confirm-2fa-update',
      data: { 
        name: user.firstName, 
        verificationLink: `${frontendUrl}/authentication/2FAUpdate?token=${token}` 
      },
    });

    console.log('token:', token);
    res.status(200).json({ success: true, message: 'Confirmation email sent for 2FA update' });
  } catch (error) {
    console.error('Error requesting 2FA update:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Confirm 2FA update
export const confirmTwoFAUpdate = async (req, res) => {
  const { token } = req.query;
  const { newSecret } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.TWO_FA_UPDATE_SECRET);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hashedSecret = await bcrypt.hash(newSecret, 10);
    user.twoFA.secret = hashedSecret;
    await user.save();

    res.status(200).json({ success: true, message: '2FA secret updated successfully' });
  } catch (error) {
    console.error('Error confirming 2FA update:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'The 2FA update token has expired. Please request a new update link.' });
    }
    return res.status(400).json({ success: false, message: 'Invalid token' });
  }
};

// Disable 2FA
export const disableTwoFA = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.twoFA = { enabled: false, secret: null };
    await user.save();

    res.status(200).json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};