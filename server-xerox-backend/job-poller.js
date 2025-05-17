const { MongoClient } = require('mongodb');
const { spawn } = require('child_process');
const path = require('path');

// Configuration
const DB_URI = 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat';
const DB_NAME = 'test';
const COLLECTION_NAME = 'printjobs';
const POLL_INTERVAL = 5000; // 5 seconds

// Set to track jobs we've already processed to avoid duplicates
const processedJobs = new Set();

/**
 * Finds jobs in "processing" status and processes them
 */
async function pollForJobs() {
  console.log('\n[JobPoller] Checking for jobs in processing status...');
  
  let client;
  try {
    client = await MongoClient.connect(DB_URI);
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Find jobs with "processing" status
    const jobs = await collection.find({ 
      status: 'processing',
      jobId: { $nin: Array.from(processedJobs) } // Skip jobs we've already processed
    }).toArray();
    
    if (jobs.length > 0) {
      console.log(`[JobPoller] Found ${jobs.length} jobs to process`);
      
      // Process each job using the debug-gridfs-print.js script
      for (const job of jobs) {
        console.log(`[JobPoller] Processing job: ${job.jobId}`);
        
        // Add to processed jobs set
        processedJobs.add(job.jobId);
        
        // Call debug script using child_process.spawn
        const debugScript = path.join(__dirname, 'debug-gridfs-print.js');
        const child = spawn('node', [debugScript, job.jobId]);
        
        // Log output from the debug script
        child.stdout.on('data', (data) => {
          console.log(`[debug-gridfs-print] ${data}`);
        });
        
        child.stderr.on('data', (data) => {
          console.error(`[debug-gridfs-print] ERR: ${data}`);
        });
        
        child.on('close', (code) => {
          console.log(`[JobPoller] Child process exited with code ${code}`);
        });
      }
    } else {
      console.log('[JobPoller] No new jobs to process');
    }
  } catch (error) {
    console.error('[JobPoller] Error polling for jobs:', error);
  } finally {
    if (client) await client.close();
  }
}

// Start polling
console.log('[JobPoller] Starting job poller...');
console.log(`[JobPoller] Polling interval: ${POLL_INTERVAL}ms`);

// First poll immediately, then set interval
pollForJobs();
setInterval(pollForJobs, POLL_INTERVAL);

// Handle termination
process.on('SIGINT', () => {
  console.log('[JobPoller] Shutting down job poller');
  process.exit(0);
});