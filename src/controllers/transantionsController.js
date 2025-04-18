const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/transactionModel');
const { User } = require('../models/userModel'); // Adjust path as needed
const createMulter = require('../configs/multerConfig'); // Adjust path as needed
const {freeCurrencyApiKey} = require('../configs/envConfig')



const createTransaction = async (req, res) => {
  const proofUpload = createMulter().single('proof');

  proofUpload(req, res, async (err) => {
    if (err) {
      console.error("Proof upload error:", err);
      return res.status(400).json({ success: false, message: "Proof upload failed", error: err.message });
    }

    try {
      const {
        companyName,
        userId,
        amount,
        currencyType,
        cryptoCurrency,
        transactionDetails
      } = req.body;

      if (!companyName) return res.status(400).json({ success: false, message: 'Company name is required' });
      if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });
      if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
      if (!currencyType || !['fiat', 'crypto'].includes(currencyType)) {
        return res.status(400).json({ success: false, message: 'Invalid currency type' });
      }

      if (currencyType === 'crypto') {
        if (!cryptoCurrency) return res.status(400).json({ success: false, message: 'Crypto currency type is required' });
        if (!['usdt', 'btc', 'eth'].includes(cryptoCurrency)) {
          return res.status(400).json({ success: false, message: 'Invalid crypto currency type' });
        }
      }
      if (currencyType === 'fiat' && cryptoCurrency) {
        return res.status(400).json({ success: false, message: 'Crypto currency should not be included for fiat' });
      }

      if (!req.file || !req.file.path) return res.status(400).json({ success: false, message: 'Proof of payment is required' });

      const proofUrl = req.file.path;
      const transactionId = uuidv4();

      const newTransaction = new Transaction({
        companyName,
        transactionId,
        userId,
        amount,
        currencyType,
        cryptoCurrency: currencyType === 'crypto' ? cryptoCurrency : undefined,
        transactionDetails: '',
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
  const proofUpload = createMulter().single('proof');

  proofUpload(req, res, async (err) => {
    if (err) {
      console.error("Proof upload error:", err);
      return res.status(400).json({ success: false, message: "Proof upload failed", error: err.message });
    }

    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.status && !['pending', 'completed', 'failed'].includes(updates.status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      if (req.file && req.file.path) {
        updates.proofUrl = req.file.path;
      }

      updates.updatedAt = Date.now();

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
  const proofUpload = createMulter().single('proof');

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

      const transaction = await Transaction.findOne({ transactionId: id });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Can only update pending transactions' });
      }

      const updates = {
        status: paymentStatus,
        updatedAt: Date.now()
      };

      if (req.file && req.file.path) {
        updates.proofUrl = req.file.path;
      }

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

/**
 * Approve a transaction
 */
const axios = require('axios');

const approveTransaction = [
  async (req, res) => {
    const { transactionId } = req.params;

    try {
      // Find transaction
      const transaction = await Transaction.findOne({ transactionId });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      if (transaction.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Transaction is not pending' });
      }

      // Calculate USD equivalent of the transaction amount
      let usdAmount;
      if (transaction.currencyType === 'fiat') {
        const supportedFiatCurrencies = ['USD', 'EUR', 'GBP', 'CAD'];
        if (!supportedFiatCurrencies.includes(transaction.fiatCurrency)) {
          return res.status(400).json({
            success: false,
            message: `Unsupported fiat currency: ${transaction.fiatCurrency}. Supported currencies: USD, EUR, GBP, CAD`,
          });
        }

        if (transaction.fiatCurrency === 'USD') {
          usdAmount = transaction.amount;
        } else {
          // Use FreeCurrencyAPI to convert fiat currency to USD
          const response = await axios.get(
            `https://api.freecurrencyapi.com/v1/latest?base_currency=${transaction.fiatCurrency}&currencies=USD`,
            {
              headers: {
                apikey: freeCurrencyApiKey,
              },
            }
          );

          if (!response.data?.data?.USD) {
            return res.status(500).json({
              success: false,
              message: 'Failed to fetch exchange rate from FreeCurrencyAPI',
            });
          }

          const rate = response.data.data.USD;
          usdAmount = transaction.amount * rate;

          // Round to 2 decimal places for USD
          usdAmount = Number(usdAmount.toFixed(2));
        }
      } else if (transaction.currencyType === 'crypto') {
        // Fetch current USD price for the crypto currency
        const cryptoIdMap = {
          btc: 'bitcoin',
          eth: 'ethereum',
          usdt: 'tether',
        };
        const cryptoId = cryptoIdMap[transaction.cryptoCurrency];
        if (!cryptoId) {
          return res.status(400).json({ success: false, message: 'Unsupported cryptocurrency' });
        }

        // Use CoinGecko API to get current price
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`
        );
        const cryptoPrice = response.data[cryptoId].usd;
        usdAmount = transaction.amount * cryptoPrice;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid currency type' });
      }

      // Update transaction status to completed
      transaction.status = 'completed';
      await transaction.save();

      // Update user's investments and account balance
      const user = await User.findById(transaction.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Add to investments array
      user.investments.push({
        transactionId: transaction._id,
        amountInvested: usdAmount, // Store in USD
        roi: 0,
      });

      // Update totalInvestment (sum of all amountInvested in USD)
      user.totalInvestment = user.investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);

      // Update totalROI (sum of all roi, unchanged since new investment has roi: 0)
      user.totalROI = user.investments.reduce((sum, inv) => sum + (inv.roi || 0), 0);

      // Update accountBalance by adding the USD equivalent
      user.accountBalance = (user.accountBalance || 0) + usdAmount;

      await user.save();

      res.status(200).json({ success: true, message: 'Transaction approved', transaction });
    } catch (err) {
      console.error('Error approving transaction:', err.message);
      res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
  },
];

/**
 * Decline a transaction
 */
const declineTransaction = [
  async (req, res) => {
    const { transactionId } = req.params;

    try {
      // Find transaction
      const transaction = await Transaction.findOne({ transactionId });
      if (!transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      if (transaction.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Transaction is not pending' });
      }

      // Update transaction status to failed
      transaction.status = 'failed';
      await transaction.save();

      res.status(200).json({ success: true, message: 'Transaction declined', transaction });
    } catch (err) {
      console.error('Error declining transaction:', err.message);
      res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
  },
];

module.exports = {
  createTransaction,
  updateTransaction,
  processPayment,
  deleteTransaction,
  getTransactions,
  getUserTransactions,
  approveTransaction,
  declineTransaction
};