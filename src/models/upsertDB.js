import mongoose from 'mongoose';
import { dbUrl } from '../configs/envConfig.js'; // Adjust path if needed
import Industry from '../models/industries.js'; // Adjust path if needed

const MONGO_URI = dbUrl;

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

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

const seedIndustries = async () => {
  await connectDB();

  const industries = [
    { industry: 'Finance' },
    { industry: 'Healthcare' },
    { industry: 'Technology' },
    { industry: 'Education' },
    { industry: 'Real Estate' },
  ];

  try {
    const existing = await Industry.find();
    if (existing.length) {
      console.log('⚠️ Industries already exist. Skipping seeding.');
    } else {
      await Industry.insertMany(industries);
      console.log('✅ Dummy industries added successfully');
    }
  } catch (error) {
    console.error('❌ Error inserting industries:', error);
  }

  await disconnectDB();
};

seedIndustries().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
