const mongoose = require('mongoose');
const { User, Admin } = require('./userModel'); // Adjust path to where userModel.js is located
const { dbUrl } = require('../configs/envConfig'); // Adjust path to your envConfig file

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

// Recursive function to generate default values for all fields, including nested ones
const getDefaultValues = (schema) => {
  const defaults = {};

  Object.keys(schema.paths).forEach((path) => {
    const pathObj = schema.paths[path];

    // Skip _id and __v fields
    if (path === '_id' || path === '__v') return;

    // Handle simple fields with default values
    if (pathObj.defaultValue !== undefined) {
      // If defaultValue is a function, call it; otherwise, use it as-is
      defaults[path] = typeof pathObj.defaultValue === 'function' ? pathObj.defaultValue() : pathObj.defaultValue;
    }

    // Handle nested objects (subdocuments)
    if (pathObj.instance === 'Embedded') {
      defaults[path] = defaults[path] || {};
      Object.assign(defaults[path], getDefaultValues(pathObj.schema));
    }

    // Handle arrays
    if (pathObj.instance === 'Array') {
      if (pathObj.options.default !== undefined) {
        defaults[path] = typeof pathObj.options.default === 'function' ? pathObj.options.default() : pathObj.options.default;
      } else if (pathObj.schema) {
        // If the array contains subdocuments, provide an empty array with default subdocument structure
        defaults[path] = [getDefaultValues(pathObj.schema)];
      } else {
        defaults[path] = [];
      }
    }
  });

  return defaults;
};

// Function to update documents with missing fields
const updateDocuments = async (Model) => {
  try {
    const defaultValues = getDefaultValues(Model.schema);
    const fieldsToCheck = Object.keys(defaultValues).map((field) => ({ [field]: { $exists: false } }));

    if (fieldsToCheck.length === 0) {
      console.log(`No missing fields to update for ${Model.modelName}`);
      return;
    }

    const result = await Model.updateMany(
      { $or: fieldsToCheck },
      { $set: defaultValues },
      { multi: true }
    );

    console.log(`${Model.modelName} documents updated: ${result.modifiedCount}`);
  } catch (error) {
    console.error(`❌ Error updating ${Model.modelName} documents:`, error);
  }
};

// Main migration function
const migrateMissingFields = async () => {
  await connectDB();

  console.log('Starting migration to add missing fields...');
  
  await updateDocuments(User);
  await updateDocuments(Admin);

  await disconnectDB();
};

// Run the migration
migrateMissingFields().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});