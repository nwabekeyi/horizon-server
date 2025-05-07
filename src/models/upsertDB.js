import mongoose from 'mongoose';
import { dbUrl } from '../configs/envConfig.js'; // Adjust path
import { User } from './userModel.js'; // Adjust path

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

// Migration script to add recoveryEmail, clean up paymentDetails, and set empty twoFA.token
const migrateUserRecoveryEmail = async () => {
  await connectDB();

  console.log('Starting migration to add recoveryEmail, clean paymentDetails, and init twoFA.token...');

  try {
    const users = await User.find({});

    let updatedCount = 0;

    for (const user of users) {
      let modified = false;

      // Add recoveryEmail if missing
      if (user.recoveryEmail === undefined) {
        user.recoveryEmail = null;
        modified = true;
      }

      // Clean up paymentDetails
      if (user.paymentDetails?.length) {
        const validPaymentDetails = user.paymentDetails.filter((pd) => pd.type && pd.currency);
        if (validPaymentDetails.length !== user.paymentDetails.length) {
          user.paymentDetails = validPaymentDetails;
          modified = true;
        }
      }

      // Ensure twoFA object and token
      if (!user.twoFA) {
        user.twoFA = { enabled: false, secret: undefined, token: '' };
        modified = true;
      } else if (user.twoFA.token === undefined) {
        user.twoFA.token = '';
        modified = true;
      }

      if (modified) {
        await user.save();
        updatedCount++;
      }
    }

    console.log(`✅ Migration complete: ${updatedCount} user documents updated.`);
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
