import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { freeCurrencyApiKey } from '../configs/envConfig';
import createMulter from '../configs/multerConfig';
import Transaction from '../models/transactionModel';
import {User} from  '../models/userModel'

/**
 * Create a new transaction
 */
export const createTransaction = async (req, res) => {
  const proofUpload = createMulter().single('proof');

  proofUpload(req, res, async (err) => {
    if (err) {
      console.error('Proof upload error:', err);
      return res.status(400).json({ success: false, message: 'Proof upload failed', error: err.message });
    }

    try {
      const { companyName, userId, amount, currencyType, fiatCurrency, cryptoCurrency, transactionDetails } = req.body;

      if (!companyName) return res.status(400).json({ success: false, message: 'Company name is required' });
      if (!userId) return res.status(400).json({ success: false, message: 'User ID is required' });
      if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
      if (!currencyType || !['fiat', 'crypto'].includes(currencyType)) {
        return res.status(400).json({ success: false, message: 'Invalid currency type' });
      }

      if (currencyType === 'fiat') {
        if (!fiatCurrency || !['USD', 'CAD', 'EUR', 'GBP'].includes(fiatCurrency)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid or missing fiat currency (must be USD, CAD, EUR, or GBP)',
          });
        }
        if (cryptoCurrency) {
          return res.status(400).json({ success: false, message: 'Crypto currency should not be included for fiat' });
        }
      }

      if (currencyType === 'crypto') {
        if (!cryptoCurrency || !['usdt', 'btc', 'eth'].includes(cryptoCurrency)) {
          return res.status(400).json({ success: false, message: 'Invalid or missing crypto currency type' });
        }
        if (fiatCurrency) {
          return res.status(400).json({ success: false, message: 'Fiat currency should not be included for crypto' });
        }
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
        fiatCurrency: currencyType === 'fiat' ? fiatCurrency : undefined,
        cryptoCurrency: currencyType === 'crypto' ? cryptoCurrency : undefined,
        transactionDetails: transactionDetails || '',
        proofUrl,
      });

      const transaction = await newTransaction.save();
      res.status(201).json({ success: true, transaction });
    } catch (err) {
      console.error('Error creating transaction:', err);
      res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
  });
};

/**
 * Update a transaction with optional proof update
 */
export const updateTransaction = async (req, res) => {
  const proofUpload = createMulter().single('proof');

  proofUpload(req, res, async (err) => {
    if (err) {
      console.error('Proof upload error:', err);
      return res.status(400).json({ success: false, message: 'Proof upload failed', error: err.message });
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
      console.error('Error updating transaction:', err);
      res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
  });
};

/**
 * Process a payment and update transaction status
 */
export const processPayment = async (req, res) => {
  const proofUpload = createMulter().single('proof');

  proofUpload(req, res, async (err) => {
    if (err) {
      console.error('Proof upload error:', err);
      return res.status(400).json({ success: false, message: 'Proof upload failed', error: err.message });
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
        updatedAt: Date.now(),
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
      console.error('Error processing payment:', err);
      res.status(500).json({ success: false, message: `Server蔚Error: ${err.message}` });
    }
  });
};

/**
 * Delete a transaction by ID
 */
export const deleteTransaction = async (req) => {
  try {
    const { transactionId } = req.params;

    // Find the transaction
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      console.log('Transaction not found:', transactionId);
      return { success: false, message: 'Transaction not found' };
    }

    const { amount, status, userId, proofUrl } = transaction;

    // Delete the transaction
    await Transaction.findOneAndDelete({ transactionId });

    // If transaction was completed, update the user's balance
    if (status === 'completed') {
      const user = await User.findById(userId);
      if (user) {
        // Remove the investment from the user's investments array
        user.investments = user.investments.filter(
          (inv) => inv.transactionId.toString() !== transaction._id.toString()
        );
        // Recalculate totalInvestment and totalROI
        user.totalInvestment = user.investments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0);
        user.totalROI = user.investments.reduce((sum, inv) => sum + (inv.roi || 0), 0);
        // Update accountBalance
        user.accountBalance = (user.accountBalance || 0) - amount;
        await user.save();
      }
    }

    // Delete proof image from Cloudinary if it exists
    if (proofUrl) {
      try {
        await deleteFromCloudinary(proofUrl); // Placeholder: Implement this function
      } catch (cloudinaryError) {
        console.error('Failed to delete proof image from Cloudinary:', cloudinaryError.message);
        // Continue execution, as image deletion failure shouldn’t block transaction deletion
      }
    }

    console.log('Transaction deleted successfully:', transactionId);
    return { success: true, message: 'Transaction deleted successfully' };
  } catch (error) {
    console.error('Error deleting transaction:', error.message);
    return { success: false, message: `Server Error: ${error.message}` };
  }
};



/**
 * Get all transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, transactions });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get all transactions for a specific user by userId
 */
export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
    if (!transactions.length) {
      return res.status(404).json({ success: false, message: 'No transactions found for this user' });
    }

    res.status(200).json({ success: true, transactions });
  } catch (err) {
    console.error('Error fetching user transactions:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Approve a transaction
 */
export const approveTransaction = [
  async (req, res, next) => {
    const { transactionId } = req.params;

    try {
      console.log('Approve transaction called for:', transactionId);
      console.log('Session data:', req.session);

      // Find transaction
      const transaction = await Transaction.findOne({ transactionId });
      if (!transaction) {
        console.log('Transaction not found:', transactionId);
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      if (transaction.status !== 'pending') {
        console.log('Transaction is not pending:', transaction.status);
        return res.status(400).json({ success: false, message: 'Transaction is not pending' });
      }

      // Calculate USD equivalent of the transaction amount
      let usdAmount;
      if (transaction.currencyType === 'fiat') {
        const supportedFiatCurrencies = ['USD', 'CAD', 'EUR', 'GBP'];
        if (!supportedFiatCurrencies.includes(transaction.fiatCurrency)) {
          console.log('Unsupported fiat currency:', transaction.fiatCurrency);
          return res.status(400).json({
            success: false,
            message: `Unsupported fiat currency: ${transaction.fiatCurrency}. Supported currencies: USD, CAD, EUR, GBP`,
          });
        }

        if (transaction.fiatCurrency === 'USD') {
          usdAmount = transaction.amount;
        } else {
          const response = await axios.get(
            `https://api.freecurrencyapi.com/v1/latest?base_currency=${transaction.fiatCurrency}¤cies=USD`,
            {
              headers: {
                apikey: freeCurrencyApiKey,
              },
            }
          );

          if (!response.data?.data?.USD) {
            console.log('Failed to fetch exchange rate from FreeCurrencyAPI');
            return res.status(500).json({
              success: false,
              message: 'Failed to fetch exchange rate from FreeCurrencyAPI',
            });
          }

          const rate = response.data.data.USD;
          usdAmount = transaction.amount * rate;
          usdAmount = Number(usdAmount.toFixed(2));
        }
      } else if (transaction.currencyType === 'crypto') {
        const cryptoIdMap = {
          btc: 'bitcoin',
          eth: 'ethereum',
          usdt: 'tether',
        };
        const cryptoId = cryptoIdMap[transaction.cryptoCurrency];
        if (!cryptoId) {
          console.log('Unsupported cryptocurrency:', transaction.cryptoCurrency);
          return res.status(400).json({ success: false, message: 'Unsupported cryptocurrency' });
        }

        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`
        );
        if (!response.data[cryptoId]?.usd) {
          console.log('Failed to fetch crypto price from CoinGecko');
          return res.status(500).json({
            success: false,
            message: 'Failed to fetch cryptocurrency price from CoinGecko',
          });
        }
        const cryptoPrice = response.data[cryptoId].usd;
        usdAmount = transaction.amount * cryptoPrice;
        usdAmount = Number(usdAmount.toFixed(2));
      } else {
        console.log('Invalid currency type:', transaction.currencyType);
        return res.status(400).json({ success: false, message: 'Invalid currency type' });
      }

      // Update transaction status to completed
      transaction.status = 'completed';
      transaction.updatedAt = Date.now();
      await transaction.save();

      // Update user's investments and account balance
      const user = await User.findById(transaction.userId);
      if (!user) {
        console.log('User not found:', transaction.userId);
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

      console.log('Transaction approved successfully:', transactionId);
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
export const declineTransaction = [
  async (req, res, next) => {
    const { transactionId } = req.params;

    try {
      console.log('Decline transaction called for:', transactionId);
      console.log('Session data:', req.session);


      // Find transaction
      const transaction = await Transaction.findOne({ transactionId });
      if (!transaction) {
        console.log('Transaction not found:', transactionId);
        return res.status(404).json({ success: false, message: 'Transaction not found' });
      }
      if (transaction.status !== 'pending') {
        console.log('Transaction is not pending:', transaction.status);
        return res.status(400).json({ success: false, message: 'Transaction is not pending' });
      }

      // Update transaction status to failed
      transaction.status = 'failed';
      transaction.updatedAt = Date.now();
      await transaction.save();

      console.log('Transaction declined successfully:', transactionId);
      res.status(200).json({ success: true, message: 'Transaction declined', transaction });
    } catch (err) {
      console.error('Error declining transaction:', err.message);
      res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
    }
  },
];


/**
 * Cancel a transaction
 */
export const cancelTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;  // transactionId from URL params
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required in body' });
    }

    const transaction = await Transaction.findOne({ transactionId, userId });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Set the transaction status to 'cancelled'
    transaction.status = 'cancelled';
    await transaction.save();

    res.status(200).json({ success: true, message: 'Transaction successfully cancelled', transaction });
  } catch (err) {
    console.error('Error canceling transaction:', err);
    res.status(500).json({ success: false, message: `Server Error: ${err.message}` });
  }
};

