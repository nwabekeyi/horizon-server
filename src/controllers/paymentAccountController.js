// controllers/paymentAccountController.js
import PaymentAccountModel from '../models/paymentAccount';

// Get all payment accounts
export const getAllPaymentAccounts = async (req, res) => {
  try {
    const accounts = await PaymentAccountModel.find().populate('userId', 'name email');
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment accounts.', error: error.message });
  }
};

// Get a single payment account by ID
export const getPaymentAccountById = async (req, res) => {
  try {
    const account = await PaymentAccountModel.findById(req.params.id).populate('userId', 'name email');
    if (!account) {
      return res.status(404).json({ message: 'Payment account not found.' });
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payment account.', error: error.message });
  }
};

// Create a new payment account
export const createPaymentAccount = async (req, res) => {
  try {
    const { userId, currency } = req.body;

    // Check if the user already has an account with the same currency
    const existingAccount = await PaymentAccountModel.findOne({ userId, currency });
    if (existingAccount) {
      return res.status(400).json({ message: `Payment account for ${currency.toUpperCase()} already exists for this user.` });
    }

    const newAccount = new PaymentAccountModel(req.body);
    const savedAccount = await newAccount.save();
    res.status(201).json(savedAccount);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment account.', error: error.message });
  }
};

// Update a payment account
export const updatePaymentAccount = async (req, res) => {
  try {
    const { userId, currency } = req.body;

    // Optional: Check if updating to a duplicate account
    const existingAccount = await PaymentAccountModel.findOne({ userId, currency, _id: { $ne: req.params.id } });
    if (existingAccount) {
      return res.status(400).json({ message: `Payment account for ${currency.toUpperCase()} already exists for this user.` });
    }

    const updatedAccount = await PaymentAccountModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAccount) {
      return res.status(404).json({ message: 'Payment account not found.' });
    }
    res.status(200).json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment account.', error: error.message });
  }
};

// Delete a payment account
export const deletePaymentAccount = async (req, res) => {
  try {
    const deletedAccount = await PaymentAccountModel.findByIdAndDelete(req.params.id);
    if (!deletedAccount) {
      return res.status(404).json({ message: 'Payment account not found.' });
    }
    res.status(200).json({ message: 'Payment account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete payment account.', error: error.message });
  }
};
