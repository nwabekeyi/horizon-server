const mongoose = require('mongoose');

const accountDetailsSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    wireTransfer: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountName: { type: String, required: true },
    },
    cryptoAccounts: {
      eth: { type: String }, // Ethereum address
      btc: { type: String }, // Bitcoin address
      usdt: { type: String }, // USDT address
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AccountDetails = mongoose.model('AccountDetails', accountDetailsSchema);

module.exports = AccountDetails;
