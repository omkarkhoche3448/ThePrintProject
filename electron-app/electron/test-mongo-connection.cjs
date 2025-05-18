/**
 * MongoDB Connection Test Script
 * Tests the MongoDB connection with proper session handling
 */

const { MongoClient, ObjectId } = require('mongodb');

// Configuration - same as in printJobController.cjs
const DB_URI = 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat';
const DB_NAME = 'test';
const COLLECTION_NAME = 'printjobs';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  let client = null;
  
  try {
    client = await MongoClient.connect(DB_URI);
    const db = client.db(DB_NAME);
    await db.command({ ping: 1 });
    console.log('Connection successful!');
    
    // Count print jobs
    const count = await db.collection(COLLECTION_NAME).countDocuments();
    console.log(`Found ${count} print jobs in database`);
    
    return true;
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  } finally {
    if (client) {
      await client.close();
      console.log('Connection closed properly');
    }
  }
}

async function testMultipleOperations() {
  console.log('\nTesting multiple operations with proper connection handling...');
  
  try {
    // First operation
    console.log('Operation 1: Connecting and finding jobs...');
    let client1 = await MongoClient.connect(DB_URI);
    const pendingJobs = await client1.db(DB_NAME)
      .collection(COLLECTION_NAME)
      .find({ status: 'pending' })
      .limit(5)
      .toArray();
    
    console.log(`Found ${pendingJobs.length} pending jobs`);
    await client1.close();
    console.log('Connection 1 closed properly');
    
    // Second operation with a new connection
    console.log('\nOperation 2: New connection for processing jobs...');
    for (const job of pendingJobs) {
      console.log(`Simulating processing for job: ${job.jobId || job._id}`);
      
      // Create a new connection for this job
      let client2 = await MongoClient.connect(DB_URI);
      try {
        // Simulate some processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Job processed successfully');
      } catch (error) {
        console.error('Job processing failed:', error);
      } finally {
        await client2.close();
        console.log('Connection 2 closed properly');
      }
    }
    
    console.log('\nAll operations completed successfully!');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Run the tests
async function runTests() {
  const connectionTest = await testConnection();
  if (connectionTest) {
    await testMultipleOperations();
  }
  console.log('\nTests completed.');
}

runTests();
