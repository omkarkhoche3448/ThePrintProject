require('dotenv').config();
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const PRINT_SERVER_URL = 'http://localhost:3001/api/print';
const DB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat';
const DB_NAME = 'test';
const PRINTJOBS_COLLECTION = 'printjobs';
const FILES_COLLECTION = 'pdfs.files';
const CHUNKS_COLLECTION = 'pdfs.chunks';

// Get job ID from command line args
const jobId = process.argv[2];
if (!jobId) {
  console.error('Please provide a job ID as command line argument');
  process.exit(1);
}

/**
 * Check if string is a valid MongoDB ObjectId
 */
function isValidObjectId(id) {
  try {
    new ObjectId(id);
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log('===== GRIDFS PRINT DEBUG =====');
  
  // Connect to MongoDB
  console.log('\n1. Connecting to MongoDB...');
  let client;
  try {
    client = await MongoClient.connect(DB_URI);
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
  
  const db = client.db(DB_NAME);
  const collection = db.collection(PRINTJOBS_COLLECTION);
  
  // Find the job
  console.log(`\n2. Finding job with ID: ${jobId}`);
  
  // Build query based on ID format
  let query;
  if (isValidObjectId(jobId)) {
    query = { $or: [{ jobId: jobId }, { _id: new ObjectId(jobId) }] };
    console.log('   Using ObjectId query');
  } else {
    query = { jobId: jobId };
    console.log('   Using jobId query');
  }
  
  const job = await collection.findOne(query);
  
  if (!job) {
    console.error('❌ Job not found');
    await client.close();
    process.exit(1);
  }
  
  console.log('✅ Job found:', job.jobId);
  console.log('   Status:', job.status);
  console.log('   Files count:', job.files.length);
  
  // Verify GridFS collections exist
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  console.log('\n3. Verifying GridFS collections:');
  console.log('   Collection "pdfs.files" exists:', collectionNames.includes('pdfs.files'));
  console.log('   Collection "pdfs.chunks" exists:', collectionNames.includes('pdfs.chunks'));
  
  // Process each file
  console.log('\n4. Processing files...');
  const tempDir = path.join(os.tmpdir(), 'print-debug');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  try {
    for (const fileInfo of job.files) {
      console.log(`\n   Processing file: ${fileInfo.filename}`);
      
      // Handle fileId which might be a string or ObjectId
      let fileId;
      if (typeof fileInfo.fileId === 'string') {
        // Check if it's a valid ObjectId string
        if (isValidObjectId(fileInfo.fileId)) {
          fileId = new ObjectId(fileInfo.fileId);
          console.log(`   Converting string fileId to ObjectId: ${fileInfo.fileId}`);
        } else {
          console.error(`   ❌ Invalid fileId format: ${fileInfo.fileId}`);
          throw new Error(`Invalid fileId format: ${fileInfo.fileId}`);
        }
      } else if (fileInfo.fileId instanceof ObjectId) {
        fileId = fileInfo.fileId;
      } else if (fileInfo.fileId && typeof fileInfo.fileId === 'object' && fileInfo.fileId.$oid) {
        // Handle $oid format from MongoDB JSON export
        fileId = new ObjectId(fileInfo.fileId.$oid);
        console.log(`   Converting $oid format to ObjectId: ${fileInfo.fileId.$oid}`);
      } else {
        console.error(`   ❌ Unrecognized fileId format:`, fileInfo.fileId);
        throw new Error('Unrecognized fileId format');
      }
      
      console.log(`   File ID: ${fileId}`);
      
      // Verify file exists in GridFS
      const fileExists = await db.collection(FILES_COLLECTION).findOne({ _id: fileId });
      if (!fileExists) {
        console.error(`   ❌ File not found in pdfs.files collection`);
        throw new Error(`File ${fileId} not found in GridFS`);
      }
      console.log(`   ✅ File found in pdfs.files collection`);
      console.log(`   Original filename: ${fileExists.filename}`);
      console.log(`   Length: ${fileExists.length} bytes`);
      
      // Check chunks
      const chunksCount = await db.collection(CHUNKS_COLLECTION).countDocuments({ files_id: fileId });
      console.log(`   Chunks count: ${chunksCount}`);
      
      // Download file
      const pdfPath = path.join(tempDir, `${fileInfo.filename}`);
      const configPath = path.join(tempDir, `${fileInfo._id.toString()}-config.json`);
      
      console.log('   Downloading file from GridFS...');
      try {
        // Use GridFSBucket with the correct bucket name
        const bucket = new GridFSBucket(db, {
          bucketName: 'pdfs'
        });
        
        await downloadFilePromise(fileId, pdfPath, bucket);
        console.log('   ✅ File download successful');
        console.log('   File saved to:', pdfPath);
        console.log('   File size:', fs.statSync(pdfPath).size, 'bytes');
      } catch (error) {
        console.error('   ❌ Error downloading file:', error);
        throw error;
      }
      
      // Create config file
      console.log('   Creating config file...');
      const modifiedConfig = {
        ...fileInfo.printConfig,
        username: job.username || 'Anonymous User', // Add username
        'Order ID': job.orderId // Add Order ID
      };
      
      fs.writeFileSync(configPath, JSON.stringify(modifiedConfig, null, 2));
      console.log('   ✅ Config file created:', configPath);
      console.log('   Config:', JSON.stringify(modifiedConfig, null, 2));
      
      // Send to print API
      console.log('   Sending to print API...');
      try {
        const result = await sendToPrintAPI(pdfPath, configPath);
        console.log('   ✅ Print API response:', result);
      } catch (error) {
        console.error('   ❌ Error sending to print API:', error.message);
        if (error.response) {
          console.error('   Response data:', error.response.data);
        }
        throw error;
      }
    }
    
    // Update job status to completed
    console.log('\n5. Updating job status to completed...');
    await collection.updateOne(
      { _id: job._id },
      {
        $set: {
          status: 'completed',
          'timeline.completed': new Date()
        }
      }
    );
    console.log('✅ Job status updated to completed');
    
  } catch (error) {
    console.error('\n❌ Error processing job:', error);
    
    // Update job status to failed
    console.log('\n5. Updating job status to failed...');
    await collection.updateOne(
      { _id: job._id },
      {
        $set: {
          status: 'failed',
          'timeline.failed': new Date(),
          error: error.message || 'Unknown error'
        }
      }
    );
    console.log('✅ Job status updated to failed');
  }
  
  // Clean up
  console.log('\n6. Cleaning up temporary files...');
  await client.close();
  console.log('✅ MongoDB connection closed');
  
  console.log('\n===== DEBUG COMPLETE =====');
}

function downloadFilePromise(fileId, destPath, bucket) {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(fileId);
    const writeStream = fs.createWriteStream(destPath);
    
    downloadStream.on('error', (err) => {
      console.error('   Download stream error:', err);
      reject(err);
    });
    
    writeStream.on('error', (err) => {
      console.error('   Write stream error:', err);
      reject(err);
    });
    
    writeStream.on('finish', () => {
      resolve();
    });
    
    downloadStream.pipe(writeStream);
  });
}

async function sendToPrintAPI(pdfPath, configPath) {
  const formData = new FormData();
  
  // Add PDF file
  formData.append('pdf', fs.createReadStream(pdfPath));
  
  // Add config file
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  formData.append('config', JSON.stringify(config));
  
  try {
    const response = await axios.post(PRINT_SERVER_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
}

main().catch(console.error);