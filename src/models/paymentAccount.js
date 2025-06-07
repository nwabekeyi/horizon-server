import mongoose, { Schema, model } from 'mongoose';

/**
 * Schema for PaymentAccount, supporting fiat (USD) and crypto (USDT, BTC, ETH) accounts.
 * @typedef {Object} PaymentAccount
 * @property {mongoose.Types.ObjectId} userId - Optional reference to User.
 * @property {string} currency - Currency type ('usd', 'usdt', 'btc', 'eth').
 * @property {string} [bankName] - Bank name for USD accounts.
 * @property {string} [accountNumber] - Account number for USD accounts.
 * @property {string} [accountName] - Account holder name for USD accounts.
 * @property {string} [bankSwiftCode] - SWIFT code for USD accounts (optional).
 * @property {string} [walletAddress] - Wallet address for crypto accounts.
 * @property {string} [network] - Network for crypto accounts ('erc20', 'trc20', 'bep20', 'btc').
 * @property {Date} createdAt - Timestamp of creation.
 * @property {Date} updatedAt - Timestamp of last update.
 */
const PaymentAccountSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Optional to allow accounts without a specific user
      ref: 'User',
    },
    currency: {
      type: String,
      enum: ['usd', 'usdt', 'btc', 'eth'],
      required: true,
    },
    // Fiat (USD) Fields
    bankName: { type: String },
    accountNumber: { type: String },
    accountName: { type: String },
    bankSwiftCode: { type: String },
    // Crypto (USDT, BTC, ETH) Fields
    walletAddress: { type: String },
    network: {
      type: String,
      enum: ['erc20', 'trc20', 'bep20', 'btc', null], // Restrict network values, allow null for fiat
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate accounts for the same user and currency (when userId exists)
PaymentAccountSchema.index(
  { userId: 1, currency: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

// Validation and cleanup before saving
PaymentAccountSchema.pre('save', function (next) {
  // Clean up irrelevant fields based on currency
  if (this.currency === 'usd') {
    this.walletAddress = null;
    this.network = null;
  } else {
    this.bankName = null;
    this.accountNumber = null;
    this.accountName = null;
    this.bankSwiftCode = null;
  }

  // Validate required fields
  if (this.currency === 'usd') {
    if (!this.bankName || !this.accountNumber || !this.accountName) {
      return next(new Error('Bank name, account number, and account name are required for USD.'));
    }
  } else if (this.currency === 'usdt') {
    if (!this.walletAddress || !this.network) {
      return next(new Error('Wallet address and network are required for USDT.'));
    }
    if (!['erc20', 'trc20', 'bep20'].includes(this.network)) {
      return next(new Error('Network must be one of: erc20, trc20, bep20 for USDT.'));
    }
  } else if (this.currency === 'btc') {
    if (!this.walletAddress || !this.network) {
      return next(new Error('Wallet address and network are required for BTC.'));
    }
    if (this.network !== 'btc') {
      return next(new Error('Network must be btc for BTC.'));
    }
  } else if (this.currency === 'eth') {
    if (!this.walletAddress || !this.network) {
      return next(new Error('Wallet address and network are required for ETH.'));
    }
    if (this.network !== 'erc20') {
      return next(new Error('Network must be erc20 for ETH.'));
    }
  }

  next();
});

const PaymentAccountModel = model('PaymentAccount', PaymentAccountSchema);

export default PaymentAccountModel;