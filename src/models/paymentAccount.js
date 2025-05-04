// models/PaymentAccount.ts
import mongoose, { Schema, Document, model } from 'mongoose';

const PaymentAccountSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    currency: {
      type: String,
      enum: ['usd', 'usdt'],
      required: true,
    },
    // USD (Fiat) Fields
    bankName: { type: String },
    accountNumber: { type: String },
    accountName: { type: String },
    bankSwiftCode: { type: String },

    // USDT (Crypto) Fields
    walletAddress: { type: String },
    network: { type: String },
  },
  { timestamps: true }
);

// ✅ Add this compound unique index:
PaymentAccountSchema.index({ userId: 1, currency: 1 }, { unique: true });

// Validation for required fields
PaymentAccountSchema.pre('save', function (next) {
  if (this.currency === 'usd') {
    if (!this.bankName || !this.accountNumber || !this.accountName) {
      return next(new Error('Bank name, account number, and account name are required for USD.'));
    }
  } else if (this.currency === 'usdt') {
    if (!this.walletAddress || !this.network) {
      return next(new Error('Wallet address and network are required for USDT.'));
    }
  }
  next();
});

const PaymentAccountModel = model('PaymentAccount', PaymentAccountSchema);

export default PaymentAccountModel;
