const { print } = require("unix-print");
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Print Queue implementation
class PrintQueue {
  constructor() {
    this.queue = []; // Array to store jobs
    this.jobs = {}; // Object to track job status by ID
    this.isProcessing = false; // Flag to track if we're processing jobs
    this.windowStartTime = null; // Track when the current window started
    this.windowJobs = []; // Jobs collected in the current window
    this.windowInterval = 3000; // 3 second window
    this.maxRankDrop = 5; // Maximum allowed rank drop
  }

  /**
   * Add a job to the print queue
   * @param {string} pdfPath - Path to the PDF file
   * @param {object} config - Print configuration
   * @param {number} priority - Priority level (0-100, higher = more priority)
   * @returns {string} Job ID
   */
  addJob(pdfPath, config, priority = 50) {
    const jobId = uuidv4();
    const job = {
      id: jobId,
      pdfPath,
      config,
      priority,
      status: 'queued',
      addedAt: new Date(),
      originalRank: null, // Track original position in queue
      currentRank: null, // Track current position in queue
      filename: path.basename(pdfPath) // Store filename for better logging
    };

    // Add job to tracking object
    this.jobs[jobId] = job;

    // Start a new window if none exists
    if (!this.windowStartTime) {
      this.windowStartTime = Date.now();
      console.log('\n=== Starting new 3-second window ===');
    }

    // Add job to current window
    this.windowJobs.push(job);
    
    // Sort window jobs by priority
    this.windowJobs.sort((a, b) => b.priority - a.priority);
    
    // Update ranks
    this.windowJobs.forEach((job, index) => {
      if (job.originalRank === null) {
        job.originalRank = index;
      }
      job.currentRank = index;
    });

    // Check for starvation
    this.preventStarvation();

    console.log(`\nAdded job: ${job.filename} (Priority: ${priority})`);
    this.printQueueStatus();

    // Start processing if not already
    if (!this.isProcessing) {
      this.processWindow();
    }
    
    return jobId;
  }

  /**
   * Prevent job starvation by limiting rank drops
   */
  preventStarvation() {
    this.windowJobs.forEach((job, currentIndex) => {
      const rankDrop = currentIndex - job.originalRank;
      if (rankDrop > this.maxRankDrop) {
        // Move job up to prevent starvation
        const newIndex = job.originalRank + this.maxRankDrop;
        this.windowJobs.splice(currentIndex, 1);
        this.windowJobs.splice(newIndex, 0, job);
        console.log(`\nPrevented starvation for ${job.filename}:`);
        console.log(`- Moved from rank ${currentIndex} to ${newIndex}`);
        console.log(`- Priority: ${job.priority}`);
        console.log(`- Original rank: ${job.originalRank}`);
        console.log(`- Current rank: ${newIndex}`);
      }
    });
  }

  /**
   * Print the current queue status
   */
  printQueueStatus() {
    console.log('\nCurrent Queue Status:');
    console.log('====================');
    this.windowJobs.forEach((job, index) => {
      const rankChange = job.currentRank - job.originalRank;
      const rankChangeStr = rankChange > 0 ? `(+${rankChange})` : rankChange < 0 ? `(${rankChange})` : '';
      console.log(`Rank ${index}: ${job.filename}`);
      console.log(`  Priority: ${job.priority}`);
      console.log(`  Original Rank: ${job.originalRank}`);
      console.log(`  Current Rank: ${job.currentRank} ${rankChangeStr}`);
    });
    console.log('====================\n');
  }

  /**
   * Process the current window of jobs
   */
  async processWindow() {
    if (this.isProcessing || this.windowJobs.length === 0) {
      return;
    }

    // Wait for the window to complete
    const timeElapsed = Date.now() - this.windowStartTime;
    if (timeElapsed < this.windowInterval) {
      const remainingTime = this.windowInterval - timeElapsed;
      console.log(`\nWaiting ${remainingTime}ms for window to complete...`);
      setTimeout(() => this.processWindow(), remainingTime);
      return;
    }

    this.isProcessing = true;
    console.log('\n=== Processing window of jobs ===');
    this.printQueueStatus();

    try {
      // Process all jobs in the current window
      while (this.windowJobs.length > 0) {
        const job = this.windowJobs.shift();
        
        // Update status
        job.status = 'printing';
        job.startedAt = new Date();
        
        console.log(`\nProcessing job: ${job.filename}`);
        console.log(`- Priority: ${job.priority}`);
        console.log(`- Original Rank: ${job.originalRank}`);
        console.log(`- Current Rank: ${job.currentRank}`);
        
        // Save the config to a temporary file
        const configPath = path.join(path.dirname(job.pdfPath), `${job.id}-config.json`);
        fs.writeFileSync(configPath, JSON.stringify(job.config));
        
        try {
          // Print the document
          const result = await printWithConfig(job.pdfPath, configPath);
          
          // Update job status
          job.status = 'completed';
          job.completedAt = new Date();
          job.result = result;
          
          console.log(`\nJob completed: ${job.filename}`);
          console.log(`- Status: Success`);
          console.log(`- Priority: ${job.priority}`);
        } catch (error) {
          // Update job status with error
          job.status = 'failed';
          job.error = error.message;
          
          console.error(`\nJob failed: ${job.filename}`);
          console.error(`- Error: ${error.message}`);
        }
        
        // Clean up temporary config file
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath);
        }
      }
      
      // Clear the window
      this.windowStartTime = null;
      this.windowJobs = [];
      console.log('\n=== Window processing completed ===\n');
      
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get the status of a specific job
   * @param {string} jobId - The job ID
   * @returns {object|null} Job status or null if not found
   */
  getJobStatus(jobId) {
    return this.jobs[jobId] || null;
  }

  /**
   * Remove a job from the queue
   * @param {string} jobId - The job ID
   * @returns {boolean} Success or failure
   */
  removeJob(jobId) {
    const job = this.jobs[jobId];
    
    if (!job || job.status === 'printing' || job.status === 'completed') {
      return false;
    }
    
    // Remove from queue
    this.queue = this.queue.filter(j => j.id !== jobId);
    
    // Update status
    job.status = 'cancelled';
    
    return true;
  }
}

// Create a singleton instance of the print queue
const printQueue = new PrintQueue();

/**
 * Extracts specific pages from a PDF file
 * @param {string} pdfPath - Path to the source PDF file
 * @param {string} pageRanges - Page ranges string like "1-4,6,8-10"
 * @returns {Promise<Buffer>} - PDF buffer containing only the specified pages
 */
async function extractPages(pdfPath, pageRanges) {
  // Read the PDF file
  const pdfBytes = fs.readFileSync(pdfPath);
  const srcDoc = await PDFDocument.load(pdfBytes);
  const totalPages = srcDoc.getPageCount();
  
  // Parse page ranges
  const cleanRanges = pageRanges.replace(/\s+/g, '');
  const ranges = cleanRanges.split(',');
  const pageIndices = [];
  
  // Process each range or individual page
  for (const range of ranges) {
    if (range.includes('-')) {
      // Handle range (e.g., "1-4")
      const [start, end] = range.split('-').map(num => parseInt(num, 10));
      
      // Validate range values
      if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid page range: ${range}. Valid pages are 1-${totalPages}`);
      }
      
      // PDF page indices are 0-based, but user input is 1-based
      for (let i = start; i <= end; i++) {
        pageIndices.push(i - 1);
      }
    } else {
      // Handle single page (e.g., "6")
      const pageNum = parseInt(range, 10);
      
      // Validate page number
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Invalid page number: ${range}. Valid pages are 1-${totalPages}`);
      }
      
      // PDF page indices are 0-based, but user input is 1-based
      pageIndices.push(pageNum - 1);
    }
  }
  
  // Create a new document with the selected pages
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
  
  // Add each copied page to the new document
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }
  
  // Serialize the new document
  const newPdfBytes = await newDoc.save();
  return Buffer.from(newPdfBytes);
}

/**
 * Prints a PDF file based on configuration in config.json
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} configPath - Path to the config.json file
 * @returns {Promise} - Promise resolving to the print result
 */
async function printWithConfig(pdfPath, configPath) {
  // Check if files exist
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }
  
  // Read and parse config
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Get printer name (using default printer if not specified)
  const printer = config.printer || "";
  
  // Build options array
  const options = [];
  
  // Handle number of copies
  if (config.copies !== undefined) {
    const copies = parseInt(config.copies, 10);
    if (isNaN(copies) || copies < 1) {
      throw new Error(`Invalid copies value: ${config.copies}. Must be a positive integer.`);
    }
    options.push(`-n ${copies}`);
  }
  
  // Handle duplex printing (one-sided vs back-to-back)
  if (config.duplex === true) {
    options.push("-o sides=two-sided-long-edge");
  } else {
    options.push("-o sides=one-sided");
  }
  
  // Handle pages per sheet (1, 2, 4, or 6)
  const pagesPerSheet = config.pages_per_sheet || 1;
  if ([1, 2, 4, 6].includes(pagesPerSheet)) {
    options.push(`-o number-up=${pagesPerSheet}`);
  } else {
    throw new Error(`Invalid pages per sheet: ${pagesPerSheet}. Must be 1, 2, 4, or 6.`);
  }
  
  // Handle orientation
  if (config.orientation === 'landscape') {
    options.push("-o landscape");
  } else {
    options.push("-o portrait");
  }
  
  // Handle paper size
  if (config.paper_size) {
    options.push(`-o media=${config.paper_size}`);
  } else {
    options.push("-o media=A4"); // Default to A4 if not specified
  }
  
  // Always ensure content fits on page with proper scaling
  options.push("-o fit-to-page");
  
  // Handle border
  if (config.border === 'none') {
    options.push("-o page-border=none");
  } else {
    options.push("-o page-border=single"); // Default border
  }
  
  // Handle color mode
  if (config.color_mode) {
    const colorMode = config.color_mode.toLowerCase();
    if (["monochrome", "bi-level", "color"].includes(colorMode)) {
      options.push(`-o print-color-mode=${colorMode}`);
    } else {
      throw new Error(`Invalid color mode: ${colorMode}. Must be "monochrome", "bi-level", or "color".`);
    }
  }
  
  // Handle page ranges by extracting specified pages
  let pdfToUse = pdfPath;
  let tempPdfPath = null;

  if (config.page_ranges) {
    // Validate format (should match: digits, hyphens, commas)
    if (!/^[0-9,-\s]+$/.test(config.page_ranges)) {
      throw new Error(`Invalid page range format: ${config.page_ranges}. Use format like "1-4,12,17-20"`);
    }
    
    try {
      // Extract the requested pages
      const extractedPdfBuffer = await extractPages(pdfPath, config.page_ranges);
      
      // Create a temporary file
      const fileExt = path.extname(pdfPath);
      const fileName = path.basename(pdfPath, fileExt);
      tempPdfPath = `${fileName}_extracted_pages${fileExt}`;
      
      // Write the extracted pages to the temporary file
      fs.writeFileSync(tempPdfPath, extractedPdfBuffer);
      
      // Use the temporary file for printing
      pdfToUse = tempPdfPath;
      
      console.log(`Created PDF with extracted pages: ${tempPdfPath}`);
    } catch (error) {
      throw new Error(`Failed to extract pages: ${error.message}`);
    }
  }
  
  // Log the options being used
  console.log(`Printing ${pdfToUse} with options:`, options);
  
  try {
    // Execute the print job
    const result = await print(pdfToUse, printer, options);
    
    // Clean up temporary file if created
    if (tempPdfPath && fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
      console.log(`Cleaned up temporary file: ${tempPdfPath}`);
    }
    
    return result;
  } catch (error) {
    // Clean up temporary file if created, even if printing fails
    if (tempPdfPath && fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
      console.log(`Cleaned up temporary file: ${tempPdfPath}`);
    }
    
    throw error;
  }
}

/**
 * Main function to execute from command line
 */
async function main() {
  if (process.argv.length < 4) {
    console.log("Usage: node printer.js <pdf_file_path> <config_json_path>");
    process.exit(1);
  }
  
  const pdfPath = process.argv[2];
  const configPath = process.argv[3];
  
  try {
    const result = await printWithConfig(pdfPath, configPath);
    console.log("Print job submitted successfully:", result);
  } catch (error) {
    console.error("Error printing document:", error.message);
    process.exit(1);
  }
}

// Execute if called directly from command line
if (require.main === module) {
  main();
} else {
  // Export for use as a module
  module.exports = { printWithConfig, printQueue };
} 