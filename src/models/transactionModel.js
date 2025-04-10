const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      required: true
    },
    amount: { type: Number, required: true },
    currencyType: {
      type: String,
      enum: ['fiat', 'crypto'],
      required: true
    },
    cryptoCurrency: {
      type: String,
      enum: ['usdt', 'btc', 'eth'],
      required: function() { return this.currencyType === 'crypto'; },
    },
    transactionDetails: {
      type: Map,
      of: String,
      default: {},
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
