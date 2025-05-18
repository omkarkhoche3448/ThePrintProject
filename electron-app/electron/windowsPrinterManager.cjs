// Windows Printer Management Service for ThePrintProject
const printer = require('pdf-to-printer');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Windows Printer Manager Service
 * Handles printer discovery, status management, and print job execution
 */
class WindowsPrinterManager {
  constructor() {
    this.printers = []; // Stores all discovered printers
    this.availablePrinters = []; // Stores printers that are online/available
    this.jobQueue = []; // Stores jobs waiting to be printed
    this.processingJobs = new Map(); // Maps jobIds to the printer they're being processed on
    this.printStatus = new Map(); // Maps printer names to their current status
    this.lastPrinterCheck = 0; // Timestamp of last printer check
    this.printerCheckInterval = 60000; // Check printer status every minute
    this.tempDir = path.join(os.tmpdir(), 'print-jobs');
    
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Discover available printers on the Windows system
   * @returns {Promise<string[]>} Array of printer names
   */
  async discoverPrinters() {
    try {
      console.log('[WindowsPrinterManager] Discovering printers...');
      const printerList = await printer.getPrinters();
      this.printers = printerList.map(p => p.name);
      console.log(`[WindowsPrinterManager] Found ${this.printers.length} printers: ${this.printers.join(', ')}`);
      
      // Set all printers to offline initially until we check their status
      this.printers.forEach(printerName => {
        if (!this.printStatus.has(printerName)) {
          this.printStatus.set(printerName, { 
            online: false, 
            lastCheck: Date.now(),
            jobCount: 0 
          });
        }
      });
      
      await this.checkPrinterStatus();
      return this.printers;
    } catch (error) {
      console.error('[WindowsPrinterManager] Error discovering printers:', error);
      return [];
    }
  }

  /**
   * Check printer status for all discovered printers
   * @returns {Promise<Map<string, {online: boolean, lastCheck: number, jobCount: number}>>} Map of printer status
   */
  async checkPrinterStatus() {
    // Don't check too frequently
    const now = Date.now();
    if (now - this.lastPrinterCheck < this.printerCheckInterval) {
      return this.printStatus;
    }
    
    this.lastPrinterCheck = now;
    console.log('[WindowsPrinterManager] Checking printer status...');
    
    try {
      // In real implementation, we would query system for printer status
      // This is a simplified version where we'll assume printers are online
      // unless explicitly set to offline
      
      // In Windows, we can use PowerShell to check printer status in real implementation
      // For now, we'll just assume printers are online if they're in the printers list
      this.availablePrinters = [];
      
      for (const printerName of this.printers) {
        // Get current status
        const status = this.printStatus.get(printerName) || { 
          online: false, 
          lastCheck: now,
          jobCount: 0 
        };
        
        // In a real implementation, we'd check the actual printer status
        // For now, we'll just keep the previous online status
        // and update the lastCheck timestamp
        status.lastCheck = now;
        
        // Update status
        this.printStatus.set(printerName, status);
        
        // Add to available printers if online
        if (status.online) {
          this.availablePrinters.push(printerName);
        }
      }
      
      console.log(`[WindowsPrinterManager] Available printers: ${this.availablePrinters.join(', ')}`);
      return this.printStatus;
    } catch (error) {
      console.error('[WindowsPrinterManager] Error checking printer status:', error);
      return this.printStatus;
    }
  }

  /**
   * Set printer status (online/offline)
   * @param {string} printerName Printer name
   * @param {boolean} isOnline Whether the printer is online
   * @returns {boolean} Success status
   */
  setPrinterStatus(printerName, isOnline) {
    if (!this.printers.includes(printerName)) {
      console.error(`[WindowsPrinterManager] Printer not found: ${printerName}`);
      return false;
    }
    
    const status = this.printStatus.get(printerName) || { 
      online: false, 
      lastCheck: Date.now(),
      jobCount: 0 
    };
    
    status.online = isOnline;
    status.lastCheck = Date.now();
    
    this.printStatus.set(printerName, status);
    
    // Update available printers list
    if (isOnline) {
      if (!this.availablePrinters.includes(printerName)) {
        this.availablePrinters.push(printerName);
      }
    } else {
      this.availablePrinters = this.availablePrinters.filter(p => p !== printerName);
    }
    
    console.log(`[WindowsPrinterManager] Printer ${printerName} set to ${isOnline ? 'online' : 'offline'}`);
    return true;
  }
  /**
   * Get all printers and their status
   * @returns {Array<{name: string, online: boolean, jobCount: number}>} List of printers with status
   */
  getPrinterList() {
    return this.printers.map(printerName => {
      const status = this.printStatus.get(printerName) || { 
        online: false, 
        lastCheck: Date.now(),
        jobCount: 0 
      };
      
      return {
        name: printerName,
        id: printerName, // Use printer name as ID
        online: status.online,
        jobCount: status.jobCount
      };
    });
  }
  
  /**
   * Check if any printer is online and available
   * @returns {boolean} True if at least one printer is online
   */
  hasOnlinePrinters() {
    // Force a check of printer status
    this.checkPrinterStatus();
    return this.availablePrinters.length > 0;
  }

  /**
   * Select the best printer for a job based on load balancing
   * @returns {string|null} Name of the selected printer or null if none available
   */
  selectPrinter() {
    // Refresh status first
    this.checkPrinterStatus();
    
    if (this.availablePrinters.length === 0) {
      console.log('[WindowsPrinterManager] No printers available for printing');
      return null;
    }
    
    // Simple load balancing - select printer with least jobs
    let selectedPrinter = this.availablePrinters[0];
    let lowestJobCount = Infinity;
    
    for (const printerName of this.availablePrinters) {
      const status = this.printStatus.get(printerName);
      if (status && status.jobCount < lowestJobCount) {
        lowestJobCount = status.jobCount;
        selectedPrinter = printerName;
      }
    }
    
    console.log(`[WindowsPrinterManager] Selected printer: ${selectedPrinter} (${lowestJobCount} jobs)`);
    return selectedPrinter;
  }

  /**
   * Print a PDF file with configuration
   * @param {string} pdfPath Path to the PDF file
   * @param {Object} config Print configuration
   * @param {string} [specificPrinter] Optional printer to use (must be available)
   * @returns {Promise<Object>} Print result with jobId and printerName
   */
  async printFile(pdfPath, config, specificPrinter = null) {
    try {
      console.log(`[WindowsPrinterManager] Printing file: ${pdfPath}`);
      
      // Validate PDF file exists
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF file not found: ${pdfPath}`);
      }
      
      // Get printer to use
      let printerName;
      
      if (specificPrinter) {
        // Check if specific printer is available
        const status = this.printStatus.get(specificPrinter);
        if (!status || !status.online) {
          throw new Error(`Specified printer ${specificPrinter} is not available`);
        }
        printerName = specificPrinter;
      } else {
        // Select best printer
        printerName = this.selectPrinter();
        if (!printerName) {
          throw new Error('No printers available for printing');
        }
      }
      
      // Convert print config to pdf-to-printer options
      const options = this.convertConfigToPrinterOptions(config, printerName);
      
      // Update printer job count
      const printerStatus = this.printStatus.get(printerName);
      printerStatus.jobCount++;
      this.printStatus.set(printerName, printerStatus);
      
      // Print the file
      console.log(`[WindowsPrinterManager] Sending to printer: ${printerName}`);
      console.log(`[WindowsPrinterManager] Options: ${JSON.stringify(options)}`);
      
      await printer.print(pdfPath, options);
      
      // Generate a job ID for tracking
      const jobId = `PRINT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      console.log(`[WindowsPrinterManager] Print job ${jobId} sent successfully to ${printerName}`);
      
      // Decrease job count after printing
      printerStatus.jobCount--;
      this.printStatus.set(printerName, printerStatus);
      
      return {
        success: true,
        jobId,
        printerName
      };
    } catch (error) {
      console.error('[WindowsPrinterManager] Error printing file:', error);
      throw error;
    }
  }

  /**
   * Convert ThePrintProject config to pdf-to-printer options
   * @param {Object} config ThePrintProject print configuration
   * @param {string} printerName Name of the printer to use
   * @returns {Object} Options for pdf-to-printer
   */
  convertConfigToPrinterOptions(config, printerName) {
    // Create base options
    const options = {
      printer: printerName,
    };
    
    // Map color mode
    if (config.color_mode === 'monochrome') {
      options.monochrome = true;
    }
    
    // Map paper size
    if (config.paper_size) {
      options.paperSize = config.paper_size;
    }
    
    // Map orientation
    if (config.orientation === 'landscape') {
      options.landscape = true;
    }
    
    // Map duplex printing
    if (config.duplex) {
      options.duplex = true;
    }
    
    // Map copies
    if (config.copies && config.copies > 1) {
      options.copies = config.copies;
    }
    
    // Map page ranges
    if (config.page_ranges && config.page_ranges !== 'all') {
      options.pages = config.page_ranges;
    }
    
    return options;
  }
}

module.exports = WindowsPrinterManager;
