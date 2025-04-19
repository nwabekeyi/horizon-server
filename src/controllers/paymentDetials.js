const { User } = require('../models/userModel');
const mongoose = require('mongoose');

const validFiatCurrencies = ['usd', 'cad', 'eur', 'gbp'];
const validCryptoCurrencies = ['btc', 'eth', 'usdt'];

// Helper function
const validatePaymentDetails = (type, currency, accountDetails) => {
  if (!['fiat', 'crypto'].includes(type)) {
    throw new Error('Type must be either "fiat" or "crypto"');
  }

  if (type === 'fiat' && !validFiatCurrencies.includes(currency)) {
    throw new Error('Invalid fiat currency');
  }

  if (type === 'crypto' && !validCryptoCurrencies.includes(currency)) {
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
  }
};

// Add new payment detail
const addPaymentDetail = async (req, res) => {
  try {
    const { type, currency, accountDetails } = req.body;
    const userId = req.user._id;

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
      return detail.accountDetails.address === accountDetails.address;
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
const deletePaymentDetail = async (req, res) => {
  try {
    const { paymentDetailId } = req.params;
    const userId = req.user._id;

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
const updatePaymentDetail = async (req, res) => {
  try {
    const { paymentDetailId } = req.params;
    const { type, currency, accountDetails } = req.body;
    const userId = req.user._id;

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
      return detail.accountDetails.address === accountDetails.address;
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

module.exports = {
  addPaymentDetail,
  deletePaymentDetail,
  updatePaymentDetail,
};
