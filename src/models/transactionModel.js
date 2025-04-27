import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    amount: { type: Number, required: true },
    currencyType: {
      type: String,
      enum: ['fiat', 'crypto'],
      required: true,
    },
    fiatCurrency: {
      type: String,
      enum: ['USD', 'CAD', 'EUR', 'GBP'],
      required: function () {
        return this.currencyType === 'fiat';
      },
    },
    cryptoCurrency: {
      type: String,
      enum: ['usdt', 'btc', 'eth'],
      required: function () {
        return this.currencyType === 'crypto';
      },
    },
    transactionDetails: {
      type: String,
      default: '',
    },
    proofUrl: {
      type: String,
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
