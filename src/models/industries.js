import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema(
  {
    industry: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Industry = mongoose.model('Industry', industrySchema);

export default Industry;
