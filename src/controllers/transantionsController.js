const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/transactionModel');
const createMulter = require('../configs/multerConfig'); // Adjust path as needed

/**
 * Create a transaction with proof upload
 */
const createTransaction = async (req, res) => {
  const proofUpload = createMulter().single('proof'); // Use createMulter as in the example

  proofUpload(req, res, async (err) => {
    if (err) {
      console.error("Proof upload error:", err);
      return res.status(400).json({ success: false, message: "Proof upload failed", error: err.message });
    }

    try {
      const { 
        companyName, 
        userId, 
        status, 
        amount, 
        currencyType, 
        cryptoCurrency, 
        transactionDetails 
      } = req.body;

      // Validate required fields
      if (!companyName) return res.status(400).json({ success: false, message: 'Company name is required' });
      if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });
      if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
      if (!currencyType || !['fiat', 'crypto'].includes(currencyType)) {
        return res.status(400).json({ success: false, message: 'Invalid currency type' });
      }

      // Crypto-specific validations
      if (currencyType === 'crypto') {
        if (!cryptoCurrency) return res.status(400).json({ success: false, message: 'Crypto currency type is required' });
        if (!['usdt', 'btc', 'eth'].includes(cryptoCurrency)) {
          return res.status(400).json({ success: false, message: 'Invalid crypto currency type' });
        }
      }
      if (currencyType === 'fiat' && cryptoCurrency) {
        return res.status(400).json({ success: false, message: 'Crypto currency should not be included for fiat' });
      }

      // Check for proof of payment
      if (!req.file || !req.file.path) return res.status(400).json({ success: false, message: 'Proof of payment is required' });

      const proofUrl = req.file.path; // Cloudinary URL from multer-storage-cloudinary
      const transactionId = uuidv4();

      const newTransaction = new Transaction({
        companyName,
        transactionId,
        userId,
        status: status || 'pending',
        amount,
        currencyType,
        cryptoCurrency: currencyType === 'crypto' ? cryptoCurrency : undefined,
        transactionDetails: transactionDetails ? JSON.parse(transactionDetails) : {},
        proofUrl
      });

      const transaction = await newTransaction.save();
      res.status(201).json({ success: true, transaction });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
  });
};

/**
 * Update a transaction with optional proof update
 */
const updateTransaction = async (req, res) => {
  const proofUpload = createMulter().single('proof'); // Use createMulter as in the example

  proofUpload(req, res, async (err) => {
    if (err) {
      console.error("Proof upload error:", err);
      return res.status(400).json({ success: false, message: "Proof upload failed", error: err.message });
    }

    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate status if provided
      if (updates.status && !['pending', 'completed', 'failed'].includes(updates.status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      // Handle proof update if new file is provided
      if (req.file && req.file.path) {
        updates.proofUrl = req.file.path; // New Cloudinary URL
      }

      // Ensure updatedAt is always updated
      updates.updatedAt = Date.now();

      // Parse transactionDetails if it's a string
      if (updates.transactionDetails && typeof updates.transactionDetails === 'string') {
        updates.transactionDetails = JSON.parse(updates.transactionDetails);
      }

      const transaction = await Transaction.findOneAndUpdate(
        { transactionId: id },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      res.status(200).json({ success: true, transaction });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
  });
};

/**
 * Process a payment and update transaction status
 */
const processPayment = async (req, res) => {
  const proofUpload = createMulter().single('proof'); // Use createMulter as in the example

  proofUpload(req, res, async (err) => {
    if (err) {
      console.error("Proof upload error:", err);
      return res.status(400).json({ success: false, message: "Proof upload failed", error: err.message });
    }

    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;

      if (!['completed', 'failed'].includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid payment status' });
      }

      // Find the transaction
      const transaction = await Transaction.findOne({ transactionId: id });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      // Prevent updating completed/failed transactions
      if (transaction.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Can only update pending transactions' });
      }

      // Prepare updates
      const updates = {
        status: paymentStatus,
        updatedAt: Date.now()
      };

      // Update proof if new file is provided
      if (req.file && req.file.path) {
        updates.proofUrl = req.file.path; // New Cloudinary URL
      }

      // Update transaction
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { transactionId: id },
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.status(200).json({ success: true, transaction: updatedTransaction });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
  });
};

/**
 * Delete a transaction by ID
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
 */
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get all transactions for a specific user by userId
 */
const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    if (!transactions.length) {
      return res.status(404).json({ success: false, message: 'No transactions found for this user' });
    }

    res.status(200).json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  createTransaction,
  updateTransaction,
  processPayment,
  deleteTransaction,
  getTransactions,
  getUserTransactions
};