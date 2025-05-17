temo/ThePrintProject/electron-app/electron/printJobProcessor.ts
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { GridFSBucket, MongoClient, ObjectId } from 'mongodb';

// Configuration
const PRINT_SERVER_URL = 'http://localhost:3001/api/print';
const DB_URI = 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat';
const DB_NAME = 'test';
const COLLECTION_NAME = 'printjobs';
const FILES_COLLECTION = 'pdfs.files';
const CHUNKS_COLLECTION = 'pdfs.chunks';
const POLL_INTERVAL = 5000; // 5 seconds

let processingJobs = new Set<string>(); // Track jobs we're currently processing
let isConnectedToDb = false;
let isConnectedToPrintServer = false;
let intervalId: NodeJS.Timeout | null = null;

/**
 * Check if string is a valid MongoDB ObjectId
 */
function isValidObjectId(id: string): boolean {
  try {
    new ObjectId(id);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Initialize the print job processor
 */
export function initPrintJobProcessor() {
  console.log('[PrintProcessor] Initializing print job processor...');
  
  // Create temp directory for PDF files if it doesn't exist
  const tempDir = path.join(app.getPath('temp'), 'print-jobs');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Check connections
  Promise.all([checkDbConnection(), checkPrintServerConnection()])
    .then(() => {
      console.log('[PrintProcessor] Initial connection checks completed');
      
      // Run one immediate poll to catch existing jobs
      pollForNewJobs();
      
      // Start polling interval
      if (intervalId) {
        clearInterval(intervalId);
      }
      intervalId = setInterval(pollForNewJobs, POLL_INTERVAL);
      console.log(`[PrintProcessor] Print job processor initialized, polling every ${POLL_INTERVAL/1000} seconds`);
    })
    .catch(error => {
      console.error('[PrintProcessor] Error during initialization:', error);
      console.log('[PrintProcessor] Will retry connections during polling interval');
      
      // Start polling anyway to retry connections
      if (intervalId) {
        clearInterval(intervalId);
      }
      intervalId = setInterval(pollForNewJobs, POLL_INTERVAL);
    });
}

/**
 * Check database connection
 */
async function checkDbConnection(): Promise<boolean> {
  try {
    console.log('[PrintProcessor] Checking MongoDB connection...');
    const client = await MongoClient.connect(DB_URI);
    
    // Verify essential collections exist
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('[PrintProcessor] Found collections:', collectionNames.join(', '));
    
    if (!collectionNames.includes('printjobs')) {
      console.error('[PrintProcessor] ❌ Required collection "printjobs" not found!');
      isConnectedToDb = false;
    } else if (!collectionNames.includes('pdfs.files') || !collectionNames.includes('pdfs.chunks')) {
      console.error('[PrintProcessor] ❌ Required GridFS collections "pdfs.files" or "pdfs.chunks" not found!');
      isConnectedToDb = false;
    } else {
      isConnectedToDb = true;
      console.log('[PrintProcessor] ✅ Successfully connected to MongoDB with required collections');
    }
    
    await client.close();
    return isConnectedToDb;
  } catch (error) {
    isConnectedToDb = false;
    console.error('[PrintProcessor] ❌ Failed to connect to MongoDB:', error);
    return false;
  }
}

/**
 * Check print server connection
 */
async function checkPrintServerConnection(): Promise<boolean> {
  try {
    console.log('[PrintProcessor] Checking print server connection...');
    // Just check the root URL
    const response = await axios.get('http://localhost:3001/');
    isConnectedToPrintServer = true;
    console.log('[PrintProcessor] ✅ Print server is running:', response.data);
    return true;
  } catch (error) {
    isConnectedToPrintServer = false;
    console.error('[PrintProcessor] ❌ Print server is not running or not accessible:', error.message);
    console.log('[PrintProcessor] 💡 Make sure to start the print server: cd server-xerox-backend && node server.js');
    return false;
  }
}

/**
 * Poll the database for new jobs in "processing" status
 */
async function pollForNewJobs() {
  // Check connections if needed
  if (!isConnectedToDb) {
    try {
      await checkDbConnection();
    } catch (error) {
      console.log('[PrintProcessor] Database connection still unavailable');
    }
  }
  
  if (!isConnectedToPrintServer) {
    try {
      await checkPrintServerConnection();
    } catch (error) {
      console.log('[PrintProcessor] Print server still unavailable');
    }
  }
  
  // Skip if still not connected
  if (!isConnectedToDb || !isConnectedToPrintServer) {
    console.log('[PrintProcessor] Skipping job poll - connection issues');
    return;
  }
  
  try {
    const client = await MongoClient.connect(DB_URI);
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Find jobs that are in "processing" status and not already being processed
    const cursor = collection.find({ 
      status: 'processing',
      'files.fileId': { $exists: true },
      jobId: { $nin: Array.from(processingJobs) }
    });
    
    const jobs = await cursor.toArray();
    
    if (jobs.length > 0) {
      console.log(`[PrintProcessor] Found ${jobs.length} new processing jobs`);
      
      // Process each job
      for (const job of jobs) {
        processingJobs.add(job.jobId);
        
        // Process job in background
        processJob(job, db)
          .then(() => {
            console.log(`[PrintProcessor] Job ${job.jobId} processing completed`);
          })
          .catch(err => {
            console.error(`[PrintProcessor] Error processing job ${job.jobId}:`, err);
          })
          .finally(() => {
            processingJobs.delete(job.jobId);
          });
      }
    } else {
      console.log('[PrintProcessor] No new jobs to process');
    }
    
    await client.close();
  } catch (error) {
    console.error('[PrintProcessor] Error polling for new jobs:', error);
  }
}

/**
 * Process a single print job
 */
async function processJob(job: any, db: any) {
  console.log(`[PrintProcessor] Processing job: ${job.jobId}`);
  
  try {
    // Process each file in the job
    for (const fileInfo of job.files) {
      await processFile(fileInfo, job, db);
    }
    
    // Update job status to completed
    const collection = db.collection(COLLECTION_NAME);
    await collection.updateOne(
      { jobId: job.jobId },
      { 
        $set: { 
          status: 'completed',
          'timeline.completed': new Date()
        }
      }
    );
    
    console.log(`[PrintProcessor] ✅ Job ${job.jobId} completed successfully`);
  } catch (error) {
    console.error(`[PrintProcessor] ❌ Error processing job ${job.jobId}:`, error);
    
    // Update job status to failed
    const collection = db.collection(COLLECTION_NAME);
    await collection.updateOne(
      { jobId: job.jobId },
      { 
        $set: { 
          status: 'failed',
          'timeline.failed': new Date(),
          error: error.message || 'Unknown error'
        }
      }
    );
  }
}

/**
 * Process a single file within a job
 */
async function processFile(fileInfo: any, job: any, db: any) {
  console.log(`[PrintProcessor] Processing file: ${fileInfo.filename}`);
  
  const tempDir = path.join(app.getPath('temp'), 'print-jobs');
  const pdfPath = path.join(tempDir, `${fileInfo.filename}`);
  const configPath = path.join(tempDir, `${fileInfo._id.toString()}-config.json`);
  
  try {
    // Handle fileId which might be a string, ObjectId, or have $oid format
    let fileId;
    if (typeof fileInfo.fileId === 'string') {
      // Check if it's a valid ObjectId string
      if (isValidObjectId(fileInfo.fileId)) {
        fileId = new ObjectId(fileInfo.fileId);
        console.log(`[PrintProcessor] Converting string fileId to ObjectId: ${fileInfo.fileId}`);
      } else {
        console.error(`[PrintProcessor] ❌ Invalid fileId format: ${fileInfo.fileId}`);
        throw new Error(`Invalid fileId format: ${fileInfo.fileId}`);
      }
    } else if (fileInfo.fileId instanceof ObjectId) {
      fileId = fileInfo.fileId;
    } else if (fileInfo.fileId && typeof fileInfo.fileId === 'object' && fileInfo.fileId.$oid) {
      // Handle $oid format from MongoDB JSON export
      fileId = new ObjectId(fileInfo.fileId.$oid);
      console.log(`[PrintProcessor] Converting $oid format to ObjectId: ${fileInfo.fileId.$oid}`);
    } else {
      console.error(`[PrintProcessor] ❌ Unrecognized fileId format:`, fileInfo.fileId);
      throw new Error('Unrecognized fileId format');
    }
    
    console.log(`[PrintProcessor] File ID: ${fileId}`);
    
    // Verify file exists in GridFS
    const fileExists = await db.collection(FILES_COLLECTION).findOne({ _id: fileId });
    if (!fileExists) {
      console.error(`[PrintProcessor] ❌ File not found in pdfs.files collection`);
      throw new Error(`File ${fileId} not found in GridFS`);
    }
    
    console.log(`[PrintProcessor] Found file in GridFS: ${fileExists.filename}, size: ${fileExists.length} bytes`);
    
    // Check chunks
    const chunksCount = await db.collection(CHUNKS_COLLECTION).countDocuments({ files_id: fileId });
    console.log(`[PrintProcessor] Chunks count: ${chunksCount}`);
    
    // Download the PDF file from GridFS
    console.log('[PrintProcessor] Downloading file from GridFS...');
    const bucket = new GridFSBucket(db, {
      bucketName: 'pdfs' // Must match the collection name prefix (pdfs.files, pdfs.chunks)
    });
    
    await downloadFile(fileId, pdfPath, bucket);
    console.log('[PrintProcessor] ✅ File download successful, size:', fs.statSync(pdfPath).size, 'bytes');
    
    // Create modified config with username and Order ID
    console.log('[PrintProcessor] Creating modified print config...');
    const modifiedConfig = {
      ...fileInfo.printConfig,
      username: job.username || 'Anonymous User', // Add username
      'Order ID': job.orderId // Add Order ID
    };
    
    console.log('[PrintProcessor] Print config:', JSON.stringify(modifiedConfig, null, 2));
    
    // Write config to file
    fs.writeFileSync(configPath, JSON.stringify(modifiedConfig, null, 2));
    console.log('[PrintProcessor] ✅ Config file created');
    
    // Send to print API
    console.log('[PrintProcessor] Sending to print API...');
    const result = await sendToPrintAPI(pdfPath, configPath);
    console.log('[PrintProcessor] ✅ Print API response:', result);
    
    console.log(`[PrintProcessor] File ${fileInfo.filename} sent to printer successfully`);
  } catch (error) {
    console.error(`[PrintProcessor] ❌ Error processing file:`, error);
    throw error;
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    } catch (cleanupErr) {
      console.error('[PrintProcessor] Error during cleanup:', cleanupErr);
    }
  }
}

/**
 * Download a file from GridFS
 */
async function downloadFile(fileId: ObjectId, destPath: string, bucket: GridFSBucket): Promise<void> {
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(fileId);
    const writeStream = fs.createWriteStream(destPath);
    
    downloadStream.on('error', (err) => {
      console.error('[PrintProcessor] ❌ GridFS download stream error:', err);
      reject(err);
    });
    
    writeStream.on('error', (err) => {
      console.error('[PrintProcessor] ❌ File write stream error:', err);
      reject(err);
    });
    
    writeStream.on('finish', () => {
      resolve();
    });
    
    downloadStream.pipe(writeStream);
  });
}

/**
 * Send PDF and config to print API
 */
async function sendToPrintAPI(pdfPath: string, configPath: string): Promise<any> {
  const formData = new FormData();
  
  // Add PDF file
  formData.append('pdf', fs.createReadStream(pdfPath));
  
  // Add config file
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  formData.append('config', JSON.stringify(config));
  
  try {
    console.log(`[PrintProcessor] Sending to ${PRINT_SERVER_URL}...`);
    const response = await axios.post(PRINT_SERVER_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`[PrintProcessor] ❌ Error sending print job:`, error.message);
    if (error.response) {
      console.error('[PrintProcessor] Response error data:', error.response.data);
    }
    throw error;
  }
}