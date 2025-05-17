require('dotenv').config();
const { MongoClient } = require('mongodb');
const axios = require('axios');

// Configuration 
const DB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat';
const DB_NAME = 'test';
const PRINT_JOBS_COLLECTION = 'printjobs';
const PRINT_SERVER_URL = 'http://localhost:3001';

async function main() {
  console.log('===== PRINT PROCESSOR STATUS CHECK =====');
  
  // Check if print server is running
  console.log('\n1. Checking print server...');
  try {
    const response = await axios.get(PRINT_SERVER_URL);
    console.log('✅ Print server is running:', response.data);
  } catch (error) {
    console.error('❌ Print server is not running or not accessible');
    console.log('💡 Start the print server with: cd server-xerox-backend && node server.js');
  }
  
  // Check MongoDB connection and job status
  console.log('\n2. Checking MongoDB and jobs...');
  let client;
  try {
    client = await MongoClient.connect(DB_URI);
    console.log('✅ MongoDB connection successful');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(PRINT_JOBS_COLLECTION);
    
    // Check jobs by status
    const jobCounts = await collection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('\nCurrent job counts by status:');
    if (jobCounts.length === 0) {
      console.log('No print jobs found in database');
    } else {
      jobCounts.forEach(status => {
        console.log(`- ${status._id}: ${status.count} jobs`);
      });
    }
    
    // List the most recent processing jobs
    const processingJobs = await collection
      .find({ status: 'processing' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray();
    
    console.log(`\nFound ${processingJobs.length} jobs with 'processing' status`);
    processingJobs.forEach(job => {
      console.log(`- Job ID: ${job.jobId}`);
      console.log(`  Order ID: ${job.orderId}`);
      console.log(`  Files: ${job.files.length}`);
      console.log(`  Last updated: ${job.updatedAt}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
  } finally {
    if (client) await client.close();
  }
  
  console.log('\n===== STATUS CHECK COMPLETE =====');
}

main().catch(console.error);