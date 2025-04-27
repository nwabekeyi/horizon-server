import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    industry: { type: String },
    location: { type: String },
    logoUrl: { type: String },
    establishedYear: { type: Number },

    totalFiatInvestment: { type: Number, default: 0 },
    totalCryptoInvestment: { type: Number, default: 0 },

    subscribers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        fiatAmount: { type: Number, default: 0 },
        cryptoAmount: { type: Number, default: 0 }
      }
    ]
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);

export default Company;
