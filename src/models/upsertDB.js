const mongoose = require('mongoose');
const { dbUrl } = require('../configs/envConfig'); // Adjust path to envConfig
const { User } = require('./userModel'); // Adjust path to your userModel.js

const MONGO_URI = dbUrl;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

// Migration script to add currency field in paymentDetails
const migrateUserCurrency = async () => {
  await connectDB();

  console.log('Starting migration to add currency field in paymentDetails...');

  try {
    const result = await User.updateMany(
      { 'paymentDetails.currency': { $exists: false } }, // Only where currency doesn't exist
      { $set: { 'paymentDetails.currency': 'NGN' } } // Set default currency
    );

    console.log(`Migration complete: ${result.modifiedCount} User documents updated`);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }

  await disconnectDB();
};

// Run the migration
migrateUserCurrency().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
