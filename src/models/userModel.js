const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => /^\S+@\S+\.\S+$/.test(v),
        message: 'Invalid email address',
      },
    },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String },
    role: { type: String, enum: ['user'], default: 'user' },
    status: {
      type: String,
      enum: ['verified', 'unverified', 'suspended'],
      default: 'unverified',
    },
    profilePicture: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: { type: Date },
    kyc: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      documentType: {
        type: String,
        enum: ['passport', 'driver_license', 'national_id'],
      },
      documentFront: { type: String },
      documentBack: { type: String },
      addressProof: { type: String },
      verifiedAt: { type: Date },
    },
    wallets: [
      {
        currency: { type: String, enum: ['btc', 'eth', 'usdt'] },
        address: { type: String },
        balance: { type: Number, default: 0 },
      },
    ],
    paymentDetails: [
      {
        type: {
          type: String,
          enum: ['fiat', 'crypto'],
        },
        currency: {
          type: String,
          enum: ['usd', 'cad', 'eur', 'gbp', 'btc', 'eth', 'usdt'],
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
    ],
    transactions: [String],
    twoFA: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
    },
    referralCode: { type: String },
    referredBy: { type: String },
    isBanned: { type: Boolean, default: false },
    dateJoined: { type: Date, default: Date.now },
    investments: [
      {
        transactionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Transaction',
        },
        amountInvested: { type: Number, min: 0 },
        roi: { type: Number, default: 0, min: 0 },
      },
    ],
    totalROI: { type: Number, default: 0, min: 0 },
    totalInvestment: { type: Number, default: 0, min: 0 },
    accountBalance: { type: Number, default: 0, min: 0 },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    recoveryEmail: {
      type: String,
      lowercase: true,
      validate: {
        validator: (v) => !v || /^\S+@\S+\.\S+$/.test(v),
        message: 'Invalid recovery email address',
      },
    },
  },
  { timestamps: true }
);

userSchema.path('investments').default([]);

userSchema.methods.calculateROI = function (investmentId) {
  const investment = this.investments.find((inv) => inv.id === investmentId);
  if (!investment) return 0;

  const roiRate = 0.03;
  const roi = investment.amountInvested * roiRate;
  investment.roi = roi;

  this.save();
  return roi;
};

const adminSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => /^\S+@\S+\.\S+$/.test(v),
        message: 'Invalid email address',
      },
    },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    status: {
      type: String,
      enum: ['verified', 'unverified', 'suspended'],
      default: 'unverified',
    },
    profilePicture: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: { type: Date },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    permissions: {
      canManageUsers: { type: Boolean, default: true },
      canManageKYC: { type: Boolean, default: true },
      canViewTransactions: { type: Boolean, default: true },
      canManageWallets: { type: Boolean, default: true },
      canSendNotifications: { type: Boolean, default: false },
    },
    lastLogin: { type: Date },
    isSuspended: { type: Boolean, default: false },
    accountBalance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { User, Admin };