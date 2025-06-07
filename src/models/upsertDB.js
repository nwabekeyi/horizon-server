import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { dbUrl } from '../configs/envConfig.js'; // Adjust if path is different
import { Admin } from './userModel.js'; // Adjust if path is different

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

const createInitialAdmin = async () => {
  await connectDB();

  try {
    const existingAdmin = await Admin.findOne({ email: 'auroraroydon@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists with this email. Skipping creation.');
    } else {
      const hashedPassword = await bcrypt.hash('247activetrading', 10);

      const admin = new Admin({
        firstName: 'Aurora',
        lastName: 'Roydon',
        email: 'auroraroydon@gmail.com',
        password: hashedPassword,
        role: 'admin',
        status: 'verified',
        permissions: {
          canManageUsers: true,
          canManageKYC: true,
          canViewTransactions: true,
          canManageWallets: true,
          canSendNotifications: true,
        },
      });

      await admin.save();
      console.log('✅ Admin created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }

  await disconnectDB();
};

createInitialAdmin().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
