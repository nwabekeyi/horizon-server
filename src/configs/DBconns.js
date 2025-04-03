const mongoose = require("mongoose");
const {dbUrl} = require('../configs/envConfig');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbUrl);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process on failure
  }
};

module.exports = connectDB;
