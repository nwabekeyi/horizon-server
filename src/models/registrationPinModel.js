import mongoose from 'mongoose';

const registrationPinSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true, // Index for faster lookup by email
  },
  pin: {
    type: String,
    required: true,
    length: 4, // Enforce 4 digits
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 10 * 60 * 1000, // 10 minutes from creation
    index: { expires: '10m' }, // TTL index to auto-remove after expiration
  },
}, {
  timestamps: true,
});

const RegistrationPin = mongoose.model('RegistrationPin', registrationPinSchema);

export default RegistrationPin;
