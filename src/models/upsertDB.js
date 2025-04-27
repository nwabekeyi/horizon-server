import mongoose from 'mongoose';
import { dbUrl } from '../configs/envConfig'; // Adjust path to envConfig
import { User } from './userModel'; // Adjust path to your userModel.js

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

// Migration script to add recoveryEmail and clean up paymentDetails
const migrateUserRecoveryEmail = async () => {
  await connectDB();

  console.log('Starting migration to add recoveryEmail field and clean up paymentDetails...');

  try {
    // Find all users
    const users = await User.find({});

    let updatedCount = 0;

    for (const user of users) {
      let modified = false;

      // Add recoveryEmail if missing
      if (!user.recoveryEmail && user.recoveryEmail !== null) {
        user.recoveryEmail = null;
        modified = true;
      }

      // Clean up paymentDetails: Remove entries missing type or currency
      if (user.paymentDetails && user.paymentDetails.length > 0) {
        const validPaymentDetails = user.paymentDetails.filter((pd) => {
          return pd.type && pd.currency; // Keep only entries with type and currency
        });

        if (validPaymentDetails.length !== user.paymentDetails.length) {
          user.paymentDetails = validPaymentDetails;
          modified = true;
        }
      }

      if (modified) {
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Migration complete: ${updatedCount} user documents updated.`);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }

  await disconnectDB();
};

// Run the migration
migrateUserRecoveryEmail().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
