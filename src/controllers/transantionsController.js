const { v4: uuidv4 } = require('uuid'); // Import uuid for unique transactionId generation
const Transaction = require('../models/transactionModel');

/**
 * Create a transaction
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} Created transaction
 */
const createTransaction = async (req, res) => {
  try {
    const { companyName, userId, status, amount, currencyType, cryptoCurrency, transactionDetails } = req.body;

    // Validate required fields
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    if (!status) {
      return res.status(400).json({ success: false, message: 'Transaction status is required' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }
    if (!currencyType || !['fiat', 'crypto'].includes(currencyType)) {
      return res.status(400).json({ success: false, message: 'Invalid currency type. It must be either "fiat" or "crypto"' });
    }

    // If currencyType is 'crypto', validate cryptoCurrency
    if (currencyType === 'crypto' && !cryptoCurrency) {
      return res.status(400).json({ success: false, message: 'Crypto currency type (e.g., BTC, ETH) is required for crypto transactions' });
    }
    if (currencyType === 'crypto' && !['usdt', 'btc', 'eth'].includes(cryptoCurrency)) {
      return res.status(400).json({ success: false, message: 'Invalid crypto currency type. It must be one of: usdt, btc, eth' });
    }

    // If currencyType is 'fiat', ensure cryptoCurrency is not included
    if (currencyType === 'fiat' && cryptoCurrency) {
      return res.status(400).json({ success: false, message: 'Crypto currency type should not be included for fiat transactions' });
    }

    // Generate a unique transactionId
    const transactionId = uuidv4();

    const newTransaction = new Transaction({
      companyName,
      transactionId,
      userId,
      status,
      amount,
      currencyType,
      cryptoCurrency,
      transactionDetails,
    });

    const transaction = await newTransaction.save();
    res.status(201).json({ success: true, transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


/**
 * Update a transaction by ID
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} Updated transaction
 */
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ensure that the 'status' field is valid
    if (updates.status && !['pending', 'completed', 'failed'].includes(updates.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const transaction = await Transaction.findOneAndUpdate(
        { transactionId: id },
        updates,
        { new: true }
      );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Delete a transaction by ID
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} Success message
 */
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ transactionId: id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get all transactions
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} List of all transactions
 */
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }); // Sort by createdAt, most recent first
    res.status(200).json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get all transactions for a specific user by userId
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} List of transactions for the user
 */
const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from route params

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }); // Get transactions for the user and sort by createdAt
    if (!transactions.length) {
      return res.status(404).json({ success: false, message: 'No transactions found for this user' });
    }

    res.status(200).json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { createTransaction, updateTransaction, deleteTransaction, getTransactions, getUserTransactions };
