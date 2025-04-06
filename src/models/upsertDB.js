const mongoose = require('mongoose');
const { User, Admin } = require('./userModel'); // Adjust path if needed
const { dbUrl } = require('../configs/envConfig');

const MONGO_URI = dbUrl;

const updateStatuses = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update Users
    const userResult = await User.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { profilePicture: { $exists: false } }
        ],
      },
      {
        $set: {
          status: 'unverified',
          profilePicture: '',
        },
      }
    );
    console.log(`👤 User documents updated: ${userResult.modifiedCount}`);

    // Update Admins
    const adminResult = await Admin.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { profilePicture: { $exists: false } }
        ],
      },
      {
        $set: {
          status: 'unverified',
          profilePicture: '',
        },
      }
    );
    console.log(`🛡️ Admin documents updated: ${adminResult.modifiedCount}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Error updating documents:', err);
    process.exit(1);
  }
};

updateStatuses();
