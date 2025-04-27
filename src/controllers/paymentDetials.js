import mongoose from 'mongoose';
import { User } from '../models/userModel';

const validFiatCurrencies = ['usd', 'cad', 'eur', 'gbp'];
const validCryptoCurrencies = ['btc', 'eth', 'usdt'];
const validNetworks = ['erc20', 'trc20', 'bep20'];

// Helper function
const validatePaymentDetails = (type, currency, accountDetails) => {
  if (!['fiat', 'crypto'].includes(type)) {
    throw new Error('Type must be either "fiat" or "crypto"');
  }

  if (type === 'fiat' && !validFiatCurrencies.includes(currency.toLowerCase())) {
    throw new Error('Invalid fiat currency');
  }

  if (type === 'crypto' && !validCryptoCurrencies.includes(currency.toLowerCase())) {
    throw new Error('Invalid crypto currency');
  }

  if (type === 'fiat') {
    if (!accountDetails.bankName || !accountDetails.accountNumber || !accountDetails.accountName) {
      throw new Error('Bank name, account number, and account name are required for fiat payments');
    }
  } else if (type === 'crypto') {
    if (!accountDetails.address) {
      throw new Error('Address is required for crypto payments');
    }
    if (!accountDetails.network || !validNetworks.includes(accountDetails.network.toLowerCase())) {
      throw new Error(`Network is required for crypto payments and must be one of: ${validNetworks.join(', ')}`);
    }
  }
};

// Add new payment detail
export const addPaymentDetail = async (req, res) => {
  try {
    const { userId, type, currency, accountDetails } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    validatePaymentDetails(type, currency, accountDetails);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isDuplicate = user.paymentDetails.some((detail) => {
      if (detail.type !== type || detail.currency !== currency) return false;
      if (type === 'fiat') {
        return (
          detail.accountDetails.bankName === accountDetails.bankName &&
          detail.accountDetails.accountNumber === accountDetails.accountNumber
        );
      }
      return (
        detail.accountDetails.address === accountDetails.address &&
        detail.accountDetails.network === accountDetails.network
      );
    });

    if (isDuplicate) {
      return res.status(400).json({ success: false, message: 'Payment detail already exists' });
    }

    user.paymentDetails.push({ type, currency, accountDetails });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Payment detail added successfully',
      paymentDetail: user.paymentDetails[user.paymentDetails.length - 1],
    });
  } catch (err) {
    res.status(400).json({ success: false, message: `Error: ${err.message}` });
  }
};

// Delete payment detail
export const deletePaymentDetail = async (req, res) => {
  try {
    const { paymentDetailId } = req.params;
    const { userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(paymentDetailId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment detail ID' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const index = user.paymentDetails.findIndex(
      (detail) => detail._id.toString() === paymentDetailId
    );
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Payment detail not found' });
    }

    user.paymentDetails.splice(index, 1);
    await user.save();

    res.status(200).json({ success: true, message: 'Payment detail deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
  }
};

// Update payment detail
export const updatePaymentDetail = async (req, res) => {
  try {
    const { paymentDetailId } = req.params;
    const { userId, type, currency, accountDetails } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(paymentDetailId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment detail ID' });
    }

    validatePaymentDetails(type, currency, accountDetails);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const paymentDetail = user.paymentDetails.id(paymentDetailId);
    if (!paymentDetail) {
      return res.status(404).json({ success: false, message: 'Payment detail not found' });
    }

    const isDuplicate = user.paymentDetails.some((detail) => {
      if (detail._id.toString() === paymentDetailId) return false;
      if (detail.type !== type || detail.currency !== currency) return false;
      if (type === 'fiat') {
        return (
          detail.accountDetails.bankName === accountDetails.bankName &&
          detail.accountDetails.accountNumber === accountDetails.accountNumber
        );
      }
      return (
        detail.accountDetails.address === accountDetails.address &&
        detail.accountDetails.network === accountDetails.network
      );
    });

    if (isDuplicate) {
      return res.status(400).json({ success: false, message: 'Duplicate payment detail exists' });
    }

    paymentDetail.type = type;
    paymentDetail.currency = currency;
    paymentDetail.accountDetails = accountDetails;

    await user.save();

    res.status(200).json({ success: true, message: 'Payment detail updated successfully', paymentDetail });
  } catch (err) {
    res.status(400).json({ success: false, message: `Error: ${err.message}` });
  }
};


