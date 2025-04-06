const mongoose = require('mongoose');
const { User, Admin } = require('./userModel'); // Adjust path to your models
const {dbUrl} =require('../configs/envConfig')

const MONGO_URI = dbUrl; // Replace with your DB URI

const updateStatuses = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Update Users
    const userResult = await User.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'unverified' } }
    );
    console.log(`User documents updated: ${userResult.modifiedCount}`);

    // Update Admins
    const adminResult = await Admin.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'unverified' } }
    );
    console.log(`Admin documents updated: ${adminResult.modifiedCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error updating statuses:', err);
    process.exit(1);
  }
};

updateStatuses();


