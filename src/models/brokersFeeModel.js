import mongoose from 'mongoose';

const brokerFeeSchema = new mongoose.Schema(
  {
    fee: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 5, // Default broker fee is 5%
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Static method to prevent multiple entries
brokerFeeSchema.statics.createSingle = async function (data = {}) {
  const count = await this.countDocuments();
  if (count >= 1) {
    throw new Error('Broker fee has already been set. Only one entry allowed.');
  }
  return this.create(data);
};

const BrokerFee = mongoose.model('BrokerFee', brokerFeeSchema);

export default BrokerFee;
