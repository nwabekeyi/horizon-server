const Withdrawal = require('../models/withdrawalModel');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../configs/emailConfig');
const { User } = require('../models/userModel');
const createMulter = require('../configs/multerConfig');
const BrokerFee = require('../models/brokersFeeModel');

const requestWithdrawal = async (req, res) => {
  const brokerFeeProofUpload = createMulter("broker_fee_proofs", "png").single("brokerFeeProof");

  brokerFeeProofUpload(req, res, async (err) => {
    if (err) {
      console.error("Broker Fee Proof upload error:", err);
      return res.status(400).json({ message: "Broker Fee Proof upload failed", error: err.message });
    }

    const { user, amount, brokerFee } = req.body;
    const remarks = req.body.remarks || "";

    // Validate required fields
    if (!user || !amount || !brokerFee || !req.file?.path) {
      return res.status(400).json({ 
        error: 'Missing required fields: user, amount, brokerFee, or brokerFeeProof.' 
      });
    }

    // Validate that amount and brokerFee are valid numbers
    if (isNaN(amount) || isNaN(brokerFee)) {
      return res.status(400).json({ 
        error: 'Amount and brokerFee must be valid numbers.' 
      });
    }

    if (amount < 0) {
      return res.status(400).json({ 
        error: 'Amount cannot be negative.' 
      });
    }

    if (brokerFee < 0) {
      return res.status(400).json({ 
        error: 'Broker fee cannot be negative.' 
      });
    }

    try {
      // Fetch the broker fee percentage from the BrokerFee model
      const brokerFeeDoc = await BrokerFee.findOne();
      if (!brokerFeeDoc) {
        return res.status(400).json({ 
          error: 'Broker fee percentage not set. Please contact admin to initialize it.' 
        });
      }

      const brokerFeePercentage = brokerFeeDoc.fee; // e.g., 5 (for 5%)
      const expectedBrokerFee = (amount * brokerFeePercentage) / 100;

      // Validate provided brokerFee against expected value with tolerance for floating-point precision
      const tolerance = 0.01; // Small tolerance for floating-point comparison
      if (Math.abs(brokerFee - expectedBrokerFee) > tolerance) {
        return res.status(400).json({ 
          error: `Invalid broker fee. Expected ${expectedBrokerFee.toFixed(2)} (${brokerFeePercentage}% of ${amount}), but got ${brokerFee}.` 
        });
      }

      // Create the withdrawal document
      const withdrawal = new Withdrawal({
        user,
        amount,
        brokerFee,
        brokerFeeProof: req.file.path,
        remarks,
      });

      await withdrawal.save();
      res.status(201).json({
        message: 'Withdrawal request created successfully.',
        withdrawalId: withdrawal._id,
        brokerFeeProofUrl: req.file.path,
      });
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });
};



// Approve withdrawal
const approveWithdrawalRequest = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal request not found.' });
    }

    if (withdrawal.status === 'approved') {
      return res.status(400).json({ error: 'Withdrawal has already been approved.' });
    }

    const rawPin = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedPin = await bcrypt.hash(rawPin, 10);

    withdrawal.status = 'approved';
    withdrawal.withdrawalPin = hashedPin;
    await withdrawal.save();

    const user = await User.findById(withdrawal.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await sendEmail({
      to: user.email,
      subject: 'Withdrawal Request Approved',
      template: 'withdrawalApproval',
      data: {
        firstName: user.firstName,
        rawPin: rawPin,
      },
    });

    res.status(200).json({
      message: 'Withdrawal approved and email sent successfully.',
      withdrawalId: withdrawal._id,
    });
  } catch (error) {
    console.error('Error approving withdrawal request:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Make withdrawal
const makeWithdrawal = async (req, res) => {
  const { withdrawalId, userId, paymentAccountDetails, withdrawalPin } = req.body;

  if (!withdrawalId || !userId || !paymentAccountDetails || !withdrawalPin) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found.' });
    }

    if (withdrawal.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized: user mismatch.' });
    }

    // Check if withdrawalPin exists
    if (!withdrawal.withdrawalPin) {
      return res.status(400).json({ error: 'No withdrawal PIN set for this withdrawal.' });
    }

    if (withdrawal.withdrawalPin === 0) {
      return res.status(400).json({ error: 'Inavlid withdrawal, no withdrawal pin available in database' });
    }

    const isPinValid = await bcrypt.compare(withdrawalPin, withdrawal.withdrawalPin);
    if (!isPinValid) {
      return res.status(401).json({ error: 'Invalid withdrawal PIN.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.accountBalance < withdrawal.amount) {
      return res.status(400).json({ error: 'Insufficient account balance.' });
    }

    // Update the withdrawal details
    withdrawal.paymentAccountDetails = paymentAccountDetails;
    withdrawal.status = 'processing';

    // Set withdrawalPin to null after successful validation
    withdrawal.withdrawalPin = 0;

    // Save the updated withdrawal object
    await withdrawal.save();

    res.status(200).json({
      message: 'Withdrawal is now processing.',
      withdrawalId: withdrawal._id,
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


// ✅ Mark withdrawal as successful
const markWithdrawalAsPaid = async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found.' });
    }

    if (withdrawal.status === 'successful') {
      return res.status(400).json({ error: 'Withdrawal is already marked as successful.' });
    }

    if (!withdrawal.paymentAccountDetails || withdrawal.paymentAccountDetails.trim() === "") {
      return res.status(400).json({ error: 'Cannot mark withdrawal as successful without payment account details.' });
    }

    const user = await User.findById(withdrawal.user);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.accountBalance < withdrawal.amount) {
      return res.status(400).json({ error: 'User has insufficient balance for this withdrawal.' });
    }

    // Subtract the withdrawal amount from user account balance
    user.accountBalance -= withdrawal.amount;
    await user.save();

    withdrawal.status = 'successful';
    await withdrawal.save();

    res.status(200).json({
      message: 'Withdrawal marked as successful and user balance updated.',
      withdrawalId: withdrawal._id,
    });
  } catch (error) {
    console.error('Error marking withdrawal as paid:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};



// ✅ Get withdrawals by userId
const getWithdrawalsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const withdrawals = await Withdrawal.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ withdrawals });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// ✅ Get all withdrawals (admin or system view)
const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('user', 'firstName lastName email') // optional: populate user info
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ withdrawals });
  } catch (error) {
    console.error('Error fetching all withdrawals:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


// Decline withdrawal
const declineWithdrawalRequest = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body; // Optional: allow admins to add a reason for decline

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal request not found.' });
    }

    if (withdrawal.status === 'declined') {
      return res.status(400).json({ error: 'Withdrawal is already declined.' });
    }

    if (withdrawal.status === 'successful') {
      return res.status(400).json({ error: 'Cannot decline a completed withdrawal.' });
    }

    withdrawal.status = 'declined';
    withdrawal.remarks = reason || withdrawal.remarks; // append reason if provided
    await withdrawal.save();

    const user = await User.findById(withdrawal.user);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Withdrawal Request Declined',
        template: 'withdrawalDeclined', // ensure this template exists
        data: {
          firstName: user.firstName,
          reason: reason || 'No reason provided.',
        },
      });
    }

    res.status(200).json({
      message: 'Withdrawal request declined.',
      withdrawalId: withdrawal._id,
    });
  } catch (error) {
    console.error('Error declining withdrawal request:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};



// Get withdrawal by ID
const getWithdrawalById = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await Withdrawal.findById(id).populate('user', 'firstName lastName email');
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found.' });
    }
    res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    console.error('Error fetching withdrawal by ID:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update withdrawal
const updateWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method } = req.body;
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found.' });
    }
    withdrawal.amount = amount || withdrawal.amount;
    withdrawal.paymentAccountDetails = method || withdrawal.paymentAccountDetails;
    await withdrawal.save();
    res.status(200).json({ message: 'Withdrawal updated successfully.', data: withdrawal });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete withdrawal
const deleteWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await Withdrawal.findByIdAndDelete(id);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found.' });
    }
    res.status(200).json({ message: 'Withdrawal deleted successfully.' });
  } catch (error) {
    console.error('Error deleting withdrawal:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  requestWithdrawal,
  approveWithdrawal: approveWithdrawalRequest,
  declineWithdrawal: declineWithdrawalRequest,
  getWithdrawalById, // Add this
  updateWithdrawal,  // Add this
  deleteWithdrawal,  // Add this
  makeWithdrawal,
  markWithdrawalAsPaid,
  getWithdrawalsByUserId,
  getAllWithdrawals,
};

