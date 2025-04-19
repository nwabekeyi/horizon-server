// controllers/twoFAController.js
const bcrypt = require('bcrypt');
const { User } = require('../models/userModel');
const { sendEmail } = require('../configs/emailConfig');
const jwt = require('jsonwebtoken');
const {prodUrl}= require('../configs/envConfig');

// Setup 2FA
const setupTwoFA = async (req, res) => {
  const { userId } = req.user;
  const { secret } = req.body;

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
const verifyTwoFASecret = async (req, res) => {
  const { userId } = req.user;
  const { secret } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.twoFA.enabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled' });
    }

    const isMatch = await bcrypt.compare(secret, user.twoFA.secret);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA secret' });
    }

    res.status(200).json({ success: true, message: '2FA verified successfully' });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Request to update 2FA secret
const requestTwoFAUpdate = async (req, res) => {
  const { userId } = req.user;

  try {
    const token = jwt.sign({ userId }, process.env.TWO_FA_UPDATE_SECRET, { expiresIn: '10m' });
    const user = await User.findById(userId);

    await sendEmail({
      to: user.email,
      subject: 'Confirm 2FA Secret Update',
      template: 'confirm-2fa-update',
      data: { name: user.firstName,  verificationLink: `${prodUrl}/api/2fa/confirm-update/${token}` },
    });
 console.log('token:', token);
    res.status(200).json({ success: true, message: 'Confirmation email sent for 2FA update' });
  } catch (error) {
    console.error('Error requesting 2FA update:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Confirm 2FA update
const confirmTwoFAUpdate = async (req, res) => {
  const { token } = req.params;
  const { newSecret } = req.body;

  try {
    const { userId } = jwt.verify(token, process.env.TWO_FA_UPDATE_SECRET);
    const user = await User.findById(userId);

    const hashedSecret = await bcrypt.hash(newSecret, 10);
    user.twoFA.secret = hashedSecret;
    await user.save();

    res.status(200).json({ success: true, message: '2FA secret updated successfully' });
  } catch (error) {
    console.error('Error confirming 2FA update:', error);
    res.status(500).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Disable 2FA
const disableTwoFA = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    user.twoFA = { enabled: false, secret: null };
    await user.save();

    res.status(200).json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  setupTwoFA,
  verifyTwoFASecret,
  requestTwoFAUpdate,
  confirmTwoFAUpdate,
  disableTwoFA,
};
















