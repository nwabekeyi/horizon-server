const mongoose = require('mongoose');
const Transaction = require('./transactionModel'); // Adjust path to transactionModel.js
const { dbUrl } = require('../configs/envConfig'); // Adjust path to envConfig

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

// Migrate transactionDetails from Map to String
const migrateTransactionDetails = async () => {
  await connectDB();

  console.log('Starting migration to convert transactionDetails from Map to String...');

  try {
    const transactions = await Transaction.find({});
    let updatedCount = 0;

    for (const doc of transactions) {
      if (doc.transactionDetails instanceof Map) {
        const jsonString = JSON.stringify(Object.fromEntries(doc.transactionDetails));
        await Transaction.updateOne(
          { _id: doc._id },
          { $set: { transactionDetails: jsonString } }
        );
        updatedCount++;
      }
    }

    console.log(`Migration complete: ${updatedCount} Transaction documents updated`);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }

  await disconnectDB();
};

// Run the migration
migrateTransactionDetails().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});