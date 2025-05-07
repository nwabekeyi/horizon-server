import PaymentAccountModel from '../models/paymentAccount';

// Timeout utility
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms)),
  ]);
};

// Get all payment accounts
export const getAllPaymentAccounts = async (req, res) => {
  try {
    const accounts = await withTimeout(
      PaymentAccountModel.find().populate('userId', 'name email'),
      5000
    );
    res.status(200).json(accounts);
  } catch (error) {
    console.error('getAllPaymentAccounts error:', error);
    res.status(500).json({ message: 'Failed to fetch payment accounts.', error: error.message });
  }
};

// Get a single payment account by ID
export const getPaymentAccountById = async (req, res) => {
  try {
    const account = await withTimeout(
      PaymentAccountModel.findById(req.params.id).populate('userId', 'name email'),
      5000
    );
    if (!account) {
      return res.status(404).json({ message: 'Payment account not found.' });
    }
    res.status(200).json(account);
  } catch (error) {
    console.error('getPaymentAccountById error:', error);
    res.status(500).json({ message: 'Failed to fetch payment account.', error: error.message });
  }
};

// Create a new payment account
export const createPaymentAccount = async (req, res) => {
  try {
    const newAccount = new PaymentAccountModel(req.body);
    const savedAccount = await withTimeout(newAccount.save(), 5000);
    res.status(201).json(savedAccount);
  } catch (error) {
    console.error('createPaymentAccount error:', error);
    res.status(500).json({ message: 'Failed to create payment account.', error: error.message });
  }
};

// Update a payment account
export const updatePaymentAccount = async (req, res) => {
  try {
    const updatedAccount = await withTimeout(
      PaymentAccountModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }),
      5000
    );
    if (!updatedAccount) {
      return res.status(404).json({ message: 'Payment account not found.' });
    }
    res.status(200).json(updatedAccount);
  } catch (error) {
    console.error('updatePaymentAccount error:', error);
    res.status(500).json({ message: 'Failed to update payment account.', error: error.message });
  }
};

// Delete a payment account
export const deletePaymentAccount = async (req, res) => {
  try {
    const deletedAccount = await withTimeout(PaymentAccountModel.findByIdAndDelete(req.params.id), 5000);
    if (!deletedAccount) {
      return res.status(404).json({ message: 'Payment account not found.' });
    }
    res.status(200).json({ message: 'Payment account deleted successfully.' });
  } catch (error) {
    console.error('deletePaymentAccount error:', error);
    res.status(500).json({ message: 'Failed to delete payment account.', error: error.message });
  }
};

// Create a fiat account
export const createFiatAccount = async (req, res) => {
  console.log('createFiatAccount payload:', req.body);
  try {
    const { currency, bankName, accountNumber, accountName, bankSwiftCode } = req.body;

    if (!currency) {
      return res.status(400).json({ success: false, message: 'Currency is required.' });
    }
    if (currency !== 'usd') {
      return res.status(400).json({ success: false, message: 'Currency must be USD for fiat account.' });
    }
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required bank fields.',
        errors: [
          !bankName && { path: 'bankName', message: 'Bank name is required.' },
          !accountNumber && { path: 'accountNumber', message: 'Account number is required.' },
          !accountName && { path: 'accountName', message: 'Account name is required.' },
        ].filter(Boolean),
      });
    }

    const newAccount = new PaymentAccountModel({
      userId: null, // Explicitly set to null as per requirements
      currency,
      bankName,
      accountNumber,
      accountName,
      bankSwiftCode,
    });
    const savedAccount = await withTimeout(newAccount.save(), 5000);

    res.status(201).json({
      success: true,
      message: 'Fiat account created successfully.',
      data: savedAccount,
    });
  } catch (error) {
    console.error('createFiatAccount error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create fiat account.',
      error: error.message,
    });
  }
};

// Create a crypto account
export const createCryptoAccount = async (req, res) => {
  console.log('createCryptoAccount payload:', req.body);
  try {
    const { currency, walletAddress, network } = req.body;

    if (!currency) {
      return res.status(400).json({ success: false, message: 'Currency is required.' });
    }
    if (currency !== 'usdt') {
      return res.status(400).json({ success: false, message: 'Currency must be USDT for crypto account.' });
    }
    if (!walletAddress || !network) {
      return res.status(400).json({
        success: false,
        message: 'Missing required crypto fields.',
        errors: [
          !walletAddress && { path: 'walletAddress', message: 'Wallet address is required.' },
          !network && { path: 'network', message: 'Network is required.' },
        ].filter(Boolean),
      });
    }

    const newAccount = new PaymentAccountModel({
      userId: null, // Explicitly set to null as per requirements
      currency,
      walletAddress,
      network,
    });
    const savedAccount = await withTimeout(newAccount.save(), 5000);

    res.status(201).json({
      success: true,
      message: 'Crypto account created successfully.',
      data: savedAccount,
    });
  } catch (error) {
    console.error('createCryptoAccount error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create crypto account.',
      error: error.message,
    });
  }
};