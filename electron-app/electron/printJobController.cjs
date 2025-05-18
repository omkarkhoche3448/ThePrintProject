// Print job controller for Windows printing
const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const axios = require('axios');
const FormData = require('form-data');
const { GridFSBucket, MongoClient, ObjectId } = require('mongodb');
const WindowsPrinterManager = require('./windowsPrinterManager.cjs');

// Configuration
const DB_URI = 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat';
const DB_NAME = 'test';
const COLLECTION_NAME = 'printjobs';
const FILES_COLLECTION = 'pdfs.files';
const CHUNKS_COLLECTION = 'pdfs.chunks';
const POLL_INTERVAL = 5000; // 5 seconds

// Main class for handling print jobs
class PrintJobController {
  constructor() {
    this.printerManager = new WindowsPrinterManager();
    this.processingJobs = new Set(); // Track jobs we're currently processing
    this.isConnectedToDb = false;
    this.intervalId = null;
    this.automationEnabled = true; // Default to enabled
    this.tempDir = path.join(os.tmpdir(), 'print-jobs');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Initialize the print job controller
   */
  async init() {
    console.log('[PrintJobController] Initializing...');
    
    // Discover printers
    await this.printerManager.discoverPrinters();
    
    // Check database connection
    try {
      await this.checkDbConnection();
      console.log('[PrintJobController] Database connection successful');
    } catch (error) {
      console.error('[PrintJobController] Database connection failed:', error);
    }
    
    // Start polling for jobs
    this.startPolling();
    
    // Set up IPC handlers for renderer communication
    this.setupIpcHandlers();
    
    console.log('[PrintJobController] Initialization complete');
  }

  /**
   * Set up IPC handlers for communication with renderer process
   */
  setupIpcHandlers() {
    // Get all printers
    ipcMain.handle('get-printers', async () => {
      try {
        return {
          success: true,
          printers: this.printerManager.getPrinterList()
        };
      } catch (error) {
        console.error('[PrintJobController] Error getting printers:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    // Set printer status (online/offline)
    ipcMain.handle('set-printer-status', async (event, { printerId, isOnline }) => {
      try {
        const result = this.printerManager.setPrinterStatus(printerId, isOnline);
        return {
          success: result,
          message: result 
            ? `Printer ${printerId} set to ${isOnline ? 'online' : 'offline'}`
            : `Failed to set printer ${printerId} status`
        };
      } catch (error) {
        console.error('[PrintJobController] Error setting printer status:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    // Set automation status
    ipcMain.handle('set-automation-enabled', async (event, { enabled }) => {
      try {
        this.automationEnabled = enabled;
        return {
          success: true,
          automationEnabled: this.automationEnabled,
          message: `Print automation ${enabled ? 'enabled' : 'disabled'}`
        };
      } catch (error) {
        console.error('[PrintJobController] Error setting automation status:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    // Print a specific job manually
    ipcMain.handle('print-job', async (event, { jobId }) => {
      try {
        const result = await this.startProcessingJob(jobId);
        return {
          success: result.success,
          message: result.message
        };
      } catch (error) {
        console.error('[PrintJobController] Error printing job:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
  }
  
  /**
   * Check MongoDB connection
   */
  async checkDbConnection() {
    try {
      const client = await MongoClient.connect(DB_URI);
      await client.db(DB_NAME).command({ ping: 1 });
      await client.close();
      this.isConnectedToDb = true;
      return true;
    } catch (error) {
      console.error('[PrintJobController] Database connection error:', error);
      this.isConnectedToDb = false;
      throw error;
    }
  }
  
  /**
   * Start polling for new jobs
   */
  startPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Poll immediately once
    this.pollForJobs();
    
    // Set up interval
    this.intervalId = setInterval(() => this.pollForJobs(), POLL_INTERVAL);
    console.log(`[PrintJobController] Started polling for jobs every ${POLL_INTERVAL / 1000} seconds`);
  }
  
  /**
   * Stop polling for jobs
   */
  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[PrintJobController] Stopped polling for jobs');
    }
  }
  
  /**
   * Poll for jobs in "processing" status
   */
  async pollForJobs() {
    if (!this.isConnectedToDb) {
      try {
        await this.checkDbConnection();
      } catch (error) {
        console.log('[PrintJobController] Database connection still unavailable');
        return;
      }
    }
    
    if (!this.automationEnabled) {
      // Only poll for jobs that are already in processing state
      // but not for new pending jobs
      console.log('[PrintJobController] Automation disabled, skipping pending jobs poll');
      return;
    }
    
    try {
      const client = await MongoClient.connect(DB_URI);
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);
        // 1. First, check for jobs in processing status that we should handle
      const processingCursor = collection.find({ 
        status: 'processing',
        'files.fileId': { $exists: true },
        jobId: { $nin: Array.from(this.processingJobs) }
      });
      
      const processingJobs = await processingCursor.toArray();
      
      if (processingJobs.length > 0) {
        console.log(`[PrintJobController] Found ${processingJobs.length} processing jobs to handle`);
        
        // Store jobs to process after closing the connection
        const jobsToProcess = [...processingJobs];
        
        // Mark jobs as being processed
        for (const job of jobsToProcess) {
          this.processingJobs.add(job.jobId);
        }
        
        // We'll process these jobs after closing the connection
        await client.close();
        
        // Process each job with its own connection
        for (const job of jobsToProcess) {
          this.processJob(job)
            .then(() => {
              console.log(`[PrintJobController] Job ${job.jobId} processed successfully`);
            })
            .catch(err => {
              console.error(`[PrintJobController] Error processing job ${job.jobId}:`, err);
            })
            .finally(() => {
              this.processingJobs.delete(job.jobId);
            });
        }
        
        return; // Exit early since we closed the connection
      }
        // 2. Next, if automation is enabled, check for pending jobs to move to processing
      if (this.automationEnabled) {
        // Get available printers
        const availablePrinters = this.printerManager.availablePrinters;
        
        if (availablePrinters.length === 0) {
          console.log('[PrintJobController] No printers available for automation');
        } else {
          // Find pending jobs that we can process
          const pendingCursor = collection.find({ 
            status: 'pending',
            'files.fileId': { $exists: true }
          }).limit(availablePrinters.length); // Only get as many jobs as we have printers
          
          const pendingJobs = await pendingCursor.toArray();
          
          if (pendingJobs.length > 0) {
            console.log(`[PrintJobController] Found ${pendingJobs.length} pending jobs for automation`);
            
            // Close the connection before processing jobs
            await client.close();
            
            // Process each pending job with its own connection
            for (const job of pendingJobs) {
              // Start processing this job
              await this.startProcessingJob(job.jobId);
            }
            
            return; // Exit early since we closed the connection
          }
        }
      }
      
      // Close the client connection if we get here
      await client.close();
    } catch (error) {
      console.error('[PrintJobController] Error polling for jobs:', error);
    }
  }
  
  /**
   * Start processing a job (change status from pending to processing)
   * @param {string} jobId The job ID to start processing
   * @returns {Promise<Object>} Result indicating success or failure
   */
  async startProcessingJob(jobId) {
    try {
      console.log(`[PrintJobController] Starting to process job: ${jobId}`);
      
      // Update the job status in the database
      const client = await MongoClient.connect(DB_URI);
      const db = client.db(DB_NAME);
      const collection = db.collection(COLLECTION_NAME);
      
      // Find the job and make sure it's in pending state
      const job = await collection.findOne({ 
        $or: [
          { jobId: jobId }, 
          { orderId: jobId }  // Allow finding by either jobId or orderId
        ],
        status: 'pending' 
      });
      
      if (!job) {
        console.log(`[PrintJobController] Job ${jobId} not found or not in pending state`);
        await client.close();
        return { 
          success: false, 
          message: 'Print job not found or not in pending state' 
        };
      }
      
      // Update job status to processing
      const result = await collection.updateOne(
        { _id: job._id },
        { 
          $set: { 
            status: 'processing',
            'timeline.processing': new Date()
          }
        }
      );
      
      if (result.modifiedCount === 0) {
        console.log(`[PrintJobController] Failed to update job ${jobId} status`);
        await client.close();
        return { 
          success: false, 
          message: 'Failed to update job status' 
        };
      }
      
      console.log(`[PrintJobController] Job ${jobId} status updated to processing`);
        // Start processing the job in the background
      this.processingJobs.add(job.jobId);
      
      // Close the client before starting async processing
      await client.close();
      
      // Start processing with a new connection that will be managed by processJob
      this.processJob(job)
        .then(() => {
          console.log(`[PrintJobController] Job ${job.jobId} processed successfully`);
        })
        .catch(err => {
          console.error(`[PrintJobController] Error processing job ${job.jobId}:`, err);
        })
        .finally(() => {
          this.processingJobs.delete(job.jobId);
        });
      
      return { 
        success: true, 
        message: `Job ${jobId} processing started` 
      };
    } catch (error) {
      console.error(`[PrintJobController] Error starting job ${jobId}:`, error);
      return { 
        success: false, 
        message: `Error: ${error.message}` 
      };
    }
  }
  /**
   * Process a print job - download files and send to printer
   * @param {Object} job The job object from MongoDB
   * @returns {Promise<void>}
   */
  async processJob(job) {
    console.log(`[PrintJobController] Processing job: ${job.jobId}`);
    
    let client = null;
    try {
      // Create a new client connection for this job processing
      client = await MongoClient.connect(DB_URI);
      const jobDb = client.db(DB_NAME);
      
      // Process each file in the job
      for (const fileInfo of job.files) {
        if (!fileInfo.fileId) {
          console.log(`[PrintJobController] File ID missing for job ${job.jobId}`);
          continue;
        }
        
        await this.processFile(fileInfo, job, jobDb);
      }
      
      // Update job status to completed
      const collection = jobDb.collection(COLLECTION_NAME);
      await collection.updateOne(
        { jobId: job.jobId },
        { 
          $set: { 
            status: 'completed',
            'timeline.completed': new Date()
          }
        }
      );
      
      console.log(`[PrintJobController] Job ${job.jobId} completed successfully`);
    } catch (error) {
      console.error(`[PrintJobController] Error processing job ${job.jobId}:`, error);
      
      // Update job status to failed
      if (client) {
        const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
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
    } finally {
      // Make sure we close the client when done
      if (client) {
        await client.close();
      }
    }
  }
    /**
   * Process a single file from a print job
   * @param {Object} fileInfo File information from the job
   * @param {Object} job The complete job object
   * @param {Object} db MongoDB database connection
   * @returns {Promise<void>}
   */
  async processFile(fileInfo, job, db) {
    console.log(`[PrintJobController] Processing file: ${fileInfo.filename}`);
    
    // Generate temporary file paths
    const pdfPath = path.join(this.tempDir, `${job.jobId}-${fileInfo.filename || 'document.pdf'}`);
    const configPath = path.join(this.tempDir, `${job.jobId}-config.json`);
    
    try {
      // Get the file ID
      let fileId;
      if (typeof fileInfo.fileId === 'string') {
        fileId = new ObjectId(fileInfo.fileId);
      } else {
        fileId = fileInfo.fileId;
      }
      
      // Check if file exists in GridFS
      const fileExists = await db.collection(FILES_COLLECTION).findOne({ _id: fileId });
      
      if (!fileExists) {
        throw new Error(`File ${fileId} not found in GridFS`);
      }
      
      console.log(`[PrintJobController] Found file in GridFS: ${fileExists.filename}`);
      
      // Create GridFS bucket
      const bucket = new GridFSBucket(db, {
        bucketName: 'pdfs' // Must match the collection name prefix
      });
      
      // Download file from GridFS
      await this.downloadFile(fileId, pdfPath, bucket);
      console.log(`[PrintJobController] File downloaded to ${pdfPath}`);
      
      // Create modified config with username and Order ID
      const modifiedConfig = {
        ...fileInfo.printConfig,
        username: job.username || 'Anonymous User', 
        'Order ID': job.orderId 
      };
      
      // Write config to file
      fs.writeFileSync(configPath, JSON.stringify(modifiedConfig, null, 2));
      console.log(`[PrintJobController] Config written to ${configPath}`);
      
      // Send to printer
      const result = await this.printerManager.printFile(pdfPath, modifiedConfig);
      console.log(`[PrintJobController] Print job sent to printer: ${result.printerName}`);
      
    } catch (error) {
      console.error(`[PrintJobController] Error processing file:`, error);
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
        console.error('[PrintJobController] Error during cleanup:', cleanupErr);
      }
    }
  }
  
  /**
   * Download a file from GridFS
   * @param {ObjectId} fileId The file ID in GridFS
   * @param {string} destPath Destination path to save the file
   * @param {GridFSBucket} bucket GridFS bucket
   * @returns {Promise<void>}
   */
  async downloadFile(fileId, destPath, bucket) {
    return new Promise((resolve, reject) => {
      const downloadStream = bucket.openDownloadStream(fileId);
      const writeStream = fs.createWriteStream(destPath);
      
      downloadStream.pipe(writeStream);
      
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      downloadStream.on('error', reject);
    });
  }
}

module.exports = PrintJobController;
