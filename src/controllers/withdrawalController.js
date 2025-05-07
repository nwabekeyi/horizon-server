// src/controllers/withdrawalsController.js
import Withdrawal from '../models/withdrawalModel.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../configs/emailConfig.js';
import { User } from '../models/userModel.js';
import createMulter from '../configs/multerConfig.js';
import BrokerFee from '../models/brokersFeeModel.js';
import { deleteFromCloudinary } from '../configs/cloudinaryConfig.js';
import mongoose from 'mongoose';

export const requestWithdrawal = async (req, res) => {
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
export const approveWithdrawal = async (req) => {
  try {
    const { withdrawalId } = req.params;
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return { success: false, message: 'Withdrawal request not found.' };
    }

    if (withdrawal.status === 'approved') {
      return { success: false, message: 'Withdrawal has already been approved.' };
    }

    const rawPin = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedPin = await bcrypt.hash(rawPin, 10);

    withdrawal.status = 'approved';
    withdrawal.withdrawalPin = hashedPin;
    await withdrawal.save();

    const user = await User.findById(withdrawal.user);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    await sendEmail({
      to: user.email,
      subject: 'Withdrawal Request Approved',
      template: 'withdrawalApproval',
      data: {
        firstName: user.firstName,
        rawPin: rawPin,
        withdrawalDetails: {
          amount: withdrawal.amount,
          brokerFee: withdrawal.brokerFee,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt.toLocaleDateString(),
        },
      },
    });

    return {
      success: true,
      message: 'Withdrawal approved and email sent successfully.',
      withdrawalId: withdrawal._id,
    };
  } catch (error) {
    console.error('Error approving withdrawal request:', error);
    return { success: false, message: 'Internal server error.' };
  }
};

// Decline withdrawal
export const declineWithdrawal = async (req) => {
  try {
    const { withdrawalId } = req.params;
    const { reason } = req.body;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return { success: false, message: 'Withdrawal request not found.' };
    }

    if (withdrawal.status === 'declined') {
      return { success: false, message: 'Withdrawal is already declined.' };
    }

    if (withdrawal.status === 'successful') {
      return { success: false, message: 'Cannot decline a completed withdrawal.' };
    }

    withdrawal.status = 'declined';
    withdrawal.remarks = reason || withdrawal.remarks;
    await withdrawal.save();

    const user = await User.findById(withdrawal.user);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Withdrawal Request Declined',
        template: 'withdrawalDeclined',
        data: {
          firstName: user.firstName,
          reason: reason || 'No reason provided.',
          withdrawalDetails: {
            amount: withdrawal.amount,
            brokerFee: withdrawal.brokerFee,
            status: withdrawal.status,
            createdAt: withdrawal.createdAt.toLocaleDateString(),
          },
        },
      });
    }

    return {
      success: true,
      message: 'Withdrawal request declined.',
      withdrawalId: withdrawal._id,
    };
  } catch (error) {
    console.error('Error declining withdrawal request:', error);
    return { success: false, message: 'Internal server error.' };
  }
};


// Make withdrawal
export const makeWithdrawal = async (req, res) => {
  const { withdrawalId, userId, paymentAccountDetails, withdrawalPin } = req.body;
  // Validate required fields
  if (!withdrawalId || !userId || !paymentAccountDetails || !withdrawalPin) {
    return res.status(400).json({ error: 'Missing required fields: withdrawalId, userId, paymentAccountDetails, or withdrawalPin.' });
  }

  // Validate ObjectId formats
  if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
    return res.status(400).json({ error: 'Invalid withdrawalId format.' });
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId format.' });
  }

  // Validate withdrawalPin is a string
  if (typeof withdrawalPin !== 'string') {
    return res.status(400).json({ error: 'withdrawalPin must be a string.' });
  }

  try {
    // Find the withdrawal by ID
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found.' });
    }

    // Verify user ownership
    if (!withdrawal.user || withdrawal.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized: User does not own this withdrawal.' });
    }

    // Check if withdrawal is in approved state
    if (withdrawal.status !== 'approved') {
      return res.status(400).json({ error: `Withdrawal must be in approved status to process. Current status: ${withdrawal.status}.` });
    }

    // Check if withdrawalPin exists and is valid
    if (!withdrawal.withdrawalPin || withdrawal.withdrawalPin === '0') {
      return res.status(400).json({ error: 'No valid withdrawal PIN set for this withdrawal.' });
    }

    // Validate withdrawal pin using bcrypt
    let isPinValid;
    try {
      isPinValid = await bcrypt.compare(withdrawalPin, withdrawal.withdrawalPin);
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      return res.status(500).json({ error: 'Error validating withdrawal PIN.' });
    }

    if (!isPinValid) {
      return res.status(401).json({ error: 'Invalid withdrawal PIN.' });
    }

    // Verify user exists and has sufficient balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (typeof user.accountBalance !== 'number' || user.accountBalance < withdrawal.amount) {
      return res.status(400).json({ error: 'Insufficient account balance.' });
    }

    // Update withdrawal details
    withdrawal.paymentAccountDetails = paymentAccountDetails;
    withdrawal.status = 'processing';
    withdrawal.withdrawalPin = '0'; // Clear the pin after successful validation

    // Save the updated withdrawal
    await withdrawal.save();

    return res.status(200).json({
      message: 'Withdrawal is now processing.',
      withdrawalId: withdrawal._id,
    });
  } catch (error) {
    // Detailed error logging for debugging
    console.error('Error processing withdrawal:', {
      error: error.message,
      stack: error.stack,
      withdrawalId,
      userId,
    });

    // Specific error handling for known issues
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(503).json({ error: 'Database error. Please try again later.' });
    }

    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Mark withdrawal as successful
export const markWithdrawalAsPaid = async (req) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return { success: false, message: 'Withdrawal not found.' };
    }

    if (withdrawal.status === 'successful') {
      return { success: false, message: 'Withdrawal is already marked as successful.' };
    }

    if (!withdrawal.paymentAccountDetails || withdrawal.paymentAccountDetails === "") {
      return { success: false, message: 'Cannot mark withdrawal as successful without payment account details.' };
    }

    const user = await User.findById(withdrawal.user);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    if (user.accountBalance < withdrawal.amount) {
      return { success: false, message: 'User has insufficient balance for this withdrawal.' };
    }

    // Subtract the withdrawal amount from user account balance
    user.accountBalance -= withdrawal.amount;
    await user.save();

    withdrawal.status = 'successful';
    await withdrawal.save();

    return {
      success: true,
      message: 'Withdrawal marked as successful and user balance updated.',
      withdrawalId: withdrawal._id,
    };
  } catch (error) {
    console.error('Error marking withdrawal as paid:', error);
    return { success: false, message: 'Internal server error.' };
  }
};

// Get withdrawals by userId
export const getWithdrawalsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const withdrawals = await Withdrawal.find({ user: userId })
      .sort({ createdAt: -1 }) // optional: newest first

    res.status(200).json({ withdrawals });
  } catch (error) {
    console.error('Error fetching withdrawals by userId:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


// Get all withdrawals (admin or system view)
export const getAllWithdrawals = async (req, res) => {
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

// Get withdrawal by ID
export const getWithdrawalById = async (req, res) => {
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
export const updateWithdrawal = async (req, res) => {
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
export const deleteWithdrawal = async (req) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      console.log('Withdrawal not found:', withdrawalId);
      return { success: false, message: 'Withdrawal not found.' };
    }

    // Delete brokerFeeProof from Cloudinary if it exists
    if (withdrawal.brokerFeeProof) {
      try {
        await deleteFromCloudinary(withdrawal.brokerFeeProof);
      } catch (cloudinaryError) {
        console.error('Error deleting brokerFeeProof from Cloudinary:', cloudinaryError);
        // Continue execution, as image deletion failure shouldn’t block withdrawal deletion
      }
    }

    // Delete the withdrawal document from DB
    await Withdrawal.findByIdAndDelete(withdrawalId);

    console.log('Withdrawal deleted successfully:', withdrawalId);
    return { success: true, message: 'Withdrawal deleted successfully.' };
  } catch (error) {
    console.error('Error deleting withdrawal:', error);
    return { success: false, message: 'Internal server error.' };
  }
};



// src/controllers/withdrawalsController.js

// Cancel withdrawal
export const cancelWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params; // withdrawalId from path params
    const { userId } = req.body; // userId from request body

    // Validate required fields
    if (!withdrawalId || !userId) {
      return res.status(400).json({ error: 'Missing required fields: withdrawalId or userId.' });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
      return res.status(400).json({ error: 'Invalid withdrawalId format.' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format.' });
    }

    // Find the withdrawal by ID
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found.' });
    }

    // Verify user ownership
    if (withdrawal.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized: User does not own this withdrawal.' });
    }

    // If the withdrawal is already processed or canceled, return an error
    if (withdrawal.status === 'cancel') {
      return res.status(400).json({ error: 'Withdrawal is already canceled.' });
    }

    if (withdrawal.status === 'approved' || withdrawal.status === 'processing' || withdrawal.status === 'successful') {
      return res.status(400).json({ error: `Cannot cancel a withdrawal in status: ${withdrawal.status}.` });
    }

    // Change the withdrawal status to 'cancel'
    withdrawal.status = 'cancel';
    await withdrawal.save();

    return res.status(200).json({
      success: true,
      message: 'Withdrawal has been successfully canceled.',
      withdrawalId: withdrawal._id,
    });
  } catch (error) {
    console.error('Error canceling withdrawal:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
