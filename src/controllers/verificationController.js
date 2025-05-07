import { User } from '../models/userModel.js';
import createMulter from '../configs/multerConfig.js'; // adjust path if needed

// Multer for uploading up to 3 KYC files
const uploadKYC = createMulter('png').fields([
  { name: 'documentFront', maxCount: 1 },
  { name: 'documentBack', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
]);

// 1. User submits KYC documents (with file uploads)
export const submitKYC = async (req, res) => {
  uploadKYC(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    try {
      const { userId, documentType } = req.body; // Get userId from body instead of req.user.id

      // Validate userId
      if (!userId) {
        return res.status(400).json({ message: 'Missing userId.' });
      }

      // Validate documentType
      if (!documentType || !['passport', 'driver_license', 'national_id'].includes(documentType)) {
        return res.status(400).json({ message: 'Invalid or missing documentType.' });
      }

      // Extract file paths
      const documentFront = req.files?.documentFront?.[0]?.path;
      const documentBack = req.files?.documentBack?.[0]?.path;
      const addressProof = req.files?.addressProof?.[0]?.path;

      // Ensure all KYC documents are provided
      if (!documentFront || !documentBack || !addressProof) {
        return res.status(400).json({ message: 'All KYC files are required.' });
      }

      // Update user KYC data and status
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'kyc.documentType': documentType,
            'kyc.documentFront': documentFront,
            'kyc.documentBack': documentBack,
            'kyc.addressProof': addressProof,
            'kyc.status': 'pending', // Status updated to pending
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ message: 'KYC submitted successfully.', user: updatedUser });
    } catch (err) {
      console.error('Error submitting KYC:', err);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });
};

// 2. Admin updates KYC status (unchanged)
export const updateKYCStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either approved or rejected.' });
    }

    const updateFields = {
      'kyc.status': status,
    };

    if (status === 'approved') {
      updateFields['kyc.verifiedAt'] = new Date();
    }

    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: `KYC ${status} successfully.`, user });
  } catch (err) {
    console.error('Error updating KYC status:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


/**
 * Approve KYC for a user (sets kyc.status to verified)
 */
export const approveKYC = async (req) => {
  try {
    const { userId } = req.params;
    console.log(`Approve KYC called for user: ${userId}`);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found: ${userId}`);
      return { success: false, message: 'User not found' };
    }

    // Validate KYC documents
    if (!user.kyc.documentFront || !user.kyc.documentBack || !user.kyc.addressProof) {
      console.log(`Incomplete KYC documents for user: ${userId}`);
      return { success: false, message: 'Incomplete KYC documents for verification' };
    }

    // Update KYC status
    user.kyc.status = 'verified';
    user.kyc.updatedAt = Date.now();

    await user.save();
    console.log(`KYC approved successfully for user: ${userId}`);
    return { success: true, message: 'KYC approved successfully', userId };
  } catch (err) {
    console.error(`Error approving KYC: ${err.message}`);
    return { success: false, message: `Server Error: ${err.message}` };
  }
};

/**
 * Decline KYC for a user (sets kyc.status to rejected)
 */
export const declineKYC = async (req) => {
  try {
    const { userId } = req.params;
    console.log(`Decline KYC called for user: ${userId}`);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User not found: ${userId}`);
      return { success: false, message: 'User not found' };
    }

    // Update KYC status
    user.kyc.status = 'rejected';
    user.kyc.updatedAt = Date.now();

    await user.save();
    console.log(`KYC declined successfully for user: ${userId}`);
    return { success: true, message: 'KYC declined successfully', userId };
  } catch (err) {
    console.error(`Error declining KYC: ${err.message}`);
    return { success: false, message: `Server Error: ${err.message}` };
  }
};