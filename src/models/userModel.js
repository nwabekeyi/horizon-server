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
        message: "Invalid email address",
      },
    },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String },
    role: { type: String, enum: ['user'], default: 'user' },
    status: { type: String, enum: ['verified', 'unverified', 'suspended'], default: 'unverified' },
    profilePicture: { type: String },
    kyc: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      documentType: { type: String, enum: ['passport', 'driver_license', 'national_id'] },
      documentFront: { type: String },
      documentBack: { type: String },
      addressProof: { type: String },
      verifiedAt: { type: Date },
    },
    wallets: [
      {
        currency: { type: String },
        address: { type: String },
        balance: { type: Number, default: 0 },
      }
    ],
    paymentDetails: [
      {
        currency: { type: String, enum: ['crypto', 'fiat'], required: true }, // Added enum for fiat or crypto
        accountDetails: {
          bankName: { 
            type: String, 
            trim: true, 
            required: function() {
              return this.currency === 'fiat'; // Only required if currency is fiat
            }
          }, 
          accountNumber: { type: String },
          accountName: { type: String },
          address: { type: String, required: function() {
              return this.currency === 'crypto'; // Only required if currency is crypto
            } 
          }, // For crypto or other payment methods (ETH, BTC, USDT)
        },
      }
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
        id: { type: Number, required: true, unique: true },
        companyName: { type: String, required: true },
        amountInvested: { type: Number, required: true },
        currencyType: { type: String, enum: ['crypto', 'fiat'], required: true }, // Updated to support both crypto and fiat
        investmentDate: { type: Date, required: true },
        roi: { type: Number, default: 0 },
      }
    ],
  },
  { timestamps: true }
);

// Ensure that the `investments` field defaults to an empty array
userSchema.path('investments').default([]);

// Method to calculate ROI based on investment duration and amount
userSchema.methods.calculateROI = function(investmentId) {
  const investment = this.investments.find(inv => inv.id === investmentId);
  if (!investment) return 0;

  const durationInMonths = Math.floor((new Date() - new Date(investment.investmentDate)) / (1000 * 60 * 60 * 24 * 30)); // Approximate duration in months

  let roiRate = 0;
  if (investment.currencyType === 'crypto') {
    roiRate = 0.05; // Example: 5% ROI per month for crypto
  } else if (investment.currencyType === 'fiat') {
    roiRate = 0.02; // Example: 2% ROI per month for fiat (including wire transfers)
  }

  const roi = investment.amountInvested * roiRate * durationInMonths;
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
        message: "Invalid email address",
      },
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
    status: { type: String, enum: ['verified', 'unverified', 'suspended'], default: 'unverified' },
    profilePicture: { type: String },
    permissions: {
      canManageUsers: { type: Boolean, default: true },
      canManageKYC: { type: Boolean, default: true },
      canViewTransactions: { type: Boolean, default: true },
      canManageWallets: { type: Boolean, default: true },
      canSendNotifications: { type: Boolean, default: false },
    },
    lastLogin: { type: Date },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { User, Admin };
