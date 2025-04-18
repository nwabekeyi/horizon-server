const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['USD', 'CAD', 'EUR', 'GBP', 'BTC', 'ETH', 'USDT'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'failed'],
      default: 'pending',
    },
    paymentDetailId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
module.exports = Withdrawal;
