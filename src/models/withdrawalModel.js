import mongoose from 'mongoose';

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
    status: {
      type: String,
      enum: ['pending', 'approved', 'failed', 'processing', 'successful', 'canceled'],
      default: 'pending',
    },
    paymentAccountDetails: {
      type: {
        type: String,
        enum: ['fiat', 'crypto'],
        required: false, // Changed to optional
      },
      currency: {
        type: String,
        enum: ['usd', 'cad', 'eur', 'gbp', 'btc', 'eth', 'usdt'],
        required: false, // Changed to optional
      },
      accountDetails: {
        bankName: {
          type: String,
          required: function () {
            return this.type === 'fiat';
          },
        },
        accountNumber: {
          type: String,
          required: function () {
            return this.type === 'fiat';
          },
        },
        accountName: {
          type: String,
          required: function () {
            return this.type === 'fiat';
          },
        },
        address: {
          type: String,
          required: function () {
            return this.type === 'crypto';
          },
        },
        network: {
          type: String,
          enum: ['erc20', 'trc20', 'bep20', 'polygon', 'solana'],
          required: false,
        },
      },
    },
    withdrawalPin: { type: String, trim: true },
    brokerFeeProof: { type: String, required: true },
    brokerFee: { type: Number, required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;