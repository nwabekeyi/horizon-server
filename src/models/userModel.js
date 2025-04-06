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
    
    status: { type: String, enum: ['verified', 'unverified', 'suspended'], default: 'unverified' }, // 👈 Added here

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

    transactions: [String],

    twoFA: {
      enabled: { type: Boolean, default: false },
      secret: { type: String },
    },

    referralCode: { type: String },
    referredBy: { type: String },
    isBanned: { type: Boolean, default: false },
    dateJoined: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

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

    status: { type: String, enum: ['verified', 'unverified', 'suspended'], default: 'unverified' }, // 👈 Added here

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
