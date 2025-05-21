// scripts/migrate-order-ids.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/printproject';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Get the PrintJob model
const PrintJob = mongoose.model('PrintJob', require('../models/printJob').printJobSchema);

async function migrateOrderIds() {
  console.log('Starting order ID migration...');
  
  try {
    // Find all print jobs that don't have the new format
    // The new format is a 6-character hexadecimal string
    // Old format starts with "ORDER-"
    const oldFormatJobs = await PrintJob.find({
      orderId: { $regex: /^ORDER-/ }
    });
    
    console.log(`Found ${oldFormatJobs.length} jobs with old order ID format`);
    
    // Update each job with a new format order ID
    let updatedCount = 0;
    
    for (const job of oldFormatJobs) {
      // Generate a new, shorter order ID (6-character hex)
      const newOrderId = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      
      // Update the job
      await PrintJob.updateOne(
        { _id: job._id },
        { $set: { orderId: newOrderId } }
      );
      
      updatedCount++;
      
      if (updatedCount % 100 === 0) {
        console.log(`Migrated ${updatedCount} of ${oldFormatJobs.length} jobs...`);
      }
    }
    
    console.log(`Successfully migrated ${updatedCount} order IDs to the new format`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migrateOrderIds();
