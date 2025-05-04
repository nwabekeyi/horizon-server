import { User } from '../models/userModel.js'; // Adjust path if needed
import mongoose from 'mongoose';

// Helper: Check valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
