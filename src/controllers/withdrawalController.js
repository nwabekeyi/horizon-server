const Withdrawal = require('../models/withdrawalModel'); // Adjust path if needed
const { User } = require('../models/userModel');

// Request a withdrawal
const requestWithdrawal = async (req, res) => {
    const { userId, amount, currency } = req.body;
  
    try {
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Check if the user has enough balance
      if (user.accountBalance < amount) {
        const withdrawalRequest = new Withdrawal({
          userId,
          amount,
          currency,
          status: 'failed', // Set status as 'failed' when insufficient balance
        });
        await withdrawalRequest.save();
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance',
          withdrawalRequest,
        });
      }
  
      // Create the withdrawal request with status 'pending' (balance not reduced yet)
      const withdrawalRequest = new Withdrawal({
        userId,
        amount,
        currency,
        status: 'pending',
      });
  
      // Save the withdrawal request to the database
      await withdrawalRequest.save();
  
      return res.status(201).json({
        success: true,
        message: 'Withdrawal request created successfully',
        withdrawalRequest,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };

// Get all withdrawals
const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve withdrawals', error: error.message });
  }
};

// Get one withdrawal
const getWithdrawalById = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }
    return res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve withdrawal', error: error.message });
  }
};

// Update withdrawal (amount, method, etc.)
const updateWithdrawal = async (req, res) => {
  try {
    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedWithdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    return res.status(200).json({ success: true, message: 'Withdrawal updated', data: updatedWithdrawal });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update withdrawal', error: error.message });
  }
};

// Delete withdrawal
const deleteWithdrawal = async (req, res) => {
  try {
    const deleted = await Withdrawal.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    return res.status(200).json({ success: true, message: 'Withdrawal deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete withdrawal', error: error.message });
  }
};

// Approve withdrawal (changes status to "approved" and deducts balance)
const approveWithdrawal = async (req, res) => {
    try {
      // Find the withdrawal request
      const withdrawalRequest = await Withdrawal.findById(req.params.id);
      if (!withdrawalRequest) {
        return res.status(404).json({ success: false, message: 'Withdrawal not found' });
      }
  
      // Find the user associated with the withdrawal request
      const user = await User.findById(withdrawalRequest.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Check if the withdrawal amount is valid
      if (user.accountBalance < withdrawalRequest.amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance to approve withdrawal',
        });
      }
  
      // Deduct the balance from the user's account
      user.accountBalance -= withdrawalRequest.amount;
      await user.save();
  
      // Update the withdrawal status to 'approved'
      withdrawalRequest.status = 'approved';
      await withdrawalRequest.save();
  
      return res.status(200).json({
        success: true,
        message: 'Withdrawal approved and balance updated',
        withdrawalRequest,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };

// Decline withdrawal (changes status to "declined")
const declineWithdrawal = async (req, res) => {
  try {
    const declined = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status: 'declined' },
      { new: true }
    );

    if (!declined) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    return res.status(200).json({ success: true, message: 'Withdrawal declined', data: declined });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to decline withdrawal', error: error.message });
  }
};

module.exports = {
  getAllWithdrawals,
  getWithdrawalById,
  updateWithdrawal,
  deleteWithdrawal,
  approveWithdrawal,
  declineWithdrawal,
  requestWithdrawal
};
