const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Use environment variable instead of hardcoded credentials for security
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/printproject';

    const conn = await mongoose.connect(MONGODB_URI, {
      // MongoDB Node.js driver 4.0+ handles these options automatically
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;