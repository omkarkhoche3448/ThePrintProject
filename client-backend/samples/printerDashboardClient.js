/**
 * PrinterDashboardClient
 * Client-side class for interacting with the printer system
 * Handles printer status and job management
 */

class PrinterDashboardClient {
  /**
   * Initialize the PrinterDashboardClient
   * @param {Object} options - Configuration options
   * @param {string} options.apiBaseUrl - Base URL for the API
   * @param {string} options.userId - User ID for authentication
   * @param {string} options.shopkeeperId - Shopkeeper ID
   */
  constructor(options = {}) {
    this.apiBaseUrl = options.apiBaseUrl || 'http://localhost:3000/api';
    this.userId = options.userId || null;
    this.shopkeeperId = options.shopkeeperId || null;
    this.socket = null;
    
    // Initialize printer and job state
    this.printers = [];
    this.onlinePrinters = [];
    this.jobs = {
      pending: [],
      processing: [],
      completed: [],
      cancelled: [],
      failed: []
    };
    
    // Event handlers
    this.onPrinterStatusChange = null;
    this.onJobStatusChange = null;
    this.onNewJob = null;
  }
  
  /**
   * Connect to the WebSocket server for real-time updates
   * @returns {Promise<void>}
   */
  async connectWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL with authentication parameters
        const wsUrl = `${this.apiBaseUrl.replace('http', 'ws')}/ws?type=shopkeeper&id=${this.shopkeeperId}`;
        
        // Create WebSocket connection
        this.socket = new WebSocket(wsUrl);
        
        // Connection opened
        this.socket.addEventListener('open', (event) => {
          console.log('Connected to WebSocket server');
          resolve();
        });
        
        // Listen for messages
        this.socket.addEventListener('message', (event) => {
          try {
            const message = JSON.parse(event.data);
            this._handleSocketMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });
        
        // Connection closed
        this.socket.addEventListener('close', (event) => {
          console.log('WebSocket connection closed');
          
          // Try to reconnect after delay
          setTimeout(() => this.connectWebSocket(), 5000);
        });
        
        // Error handling
        this.socket.addEventListener('error', (event) => {
          console.error('WebSocket error:', event);
          reject(event);
        });
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Handle incoming socket messages
   * @param {Object} message - The received message
   * @private
   */
  _handleSocketMessage(message) {
    switch (message.type) {
      case 'newPrintJob':
        // A new print job has been assigned
        console.log('New print job received:', message.data);
        this._updateJobArrays(message.data);
        
        if (this.onNewJob) {
          this.onNewJob(message.data);
        }
        break;
        
      case 'updatedPrintJob':
        // An existing print job has been updated
        console.log('Print job updated:', message.data);
        this._updateJobArrays(message.data);
        
        if (this.onJobStatusChange) {
          this.onJobStatusChange(message.data);
        }
        break;
        
      case 'printerStatusChange':
        // Printer status has changed
        console.log('Printer status changed:', message.data);
        this._updatePrinterStatus(message.data);
        
        if (this.onPrinterStatusChange) {
          this.onPrinterStatusChange(message.data);
        }
        break;
        
      default:
        // Handle other message types if needed
        console.log('Received message:', message);
    }
  }
  
  /**
   * Update job arrays when job status changes
   * @param {Object} job - The job that was updated
   * @private
   */
  _updateJobArrays(job) {
    // Remove job from all status arrays
    Object.keys(this.jobs).forEach(status => {
      this.jobs[status] = this.jobs[status].filter(j => j.jobId !== job.jobId);
    });
    
    // Add job to the appropriate status array
    if (this.jobs[job.status]) {
      this.jobs[job.status].push(job);
    }
  }
  
  /**
   * Update printer status
   * @param {Object} printerData - The printer data
   * @private
   */
  _updatePrinterStatus(printerData) {
    // Update printer in the array
    const printerIndex = this.printers.findIndex(p => p.name === printerData.name);
    
    if (printerIndex >= 0) {
      this.printers[printerIndex] = { ...this.printers[printerIndex], ...printerData };
    } else {
      this.printers.push(printerData);
    }
    
    // Update online printers list
    this.onlinePrinters = this.printers.filter(p => p.online === true);
  }
  
  /**
   * Check if any printers are online
   * @returns {boolean} - True if at least one printer is online
   */
  hasPrintersOnline() {
    return this.onlinePrinters.length > 0;
  }
  
  /**
   * Fetch available printers
   * @returns {Promise<Array>} - List of available printers
   */
  async fetchPrinters() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/printers`);
      const data = await response.json();
      
      if (data.success) {
        this.printers = data.printers;
        this.onlinePrinters = this.printers.filter(p => p.online === true);
      }
      
      return this.printers;
    } catch (error) {
      console.error('Error fetching printers:', error);
      throw error;
    }
  }
  
  /**
   * Fetch print jobs with pagination and filtering
   * @param {number} page - Page number
   * @param {string} status - Job status filter (pending, processing, completed, etc.)
   * @returns {Promise<Object>} - Job data with pagination
   */
  async fetchJobs(page = 1, status = null) {
    try {
      // Build URL with query parameters
      const url = new URL(`${this.apiBaseUrl}/job-process/${this.shopkeeperId}/jobs`);
      url.searchParams.append('page', page);
      
      if (status) {
        url.searchParams.append('status', status);
      }
      
      // Fetch data from API
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        // If status filter is provided, update only that status array
        if (status && status !== 'all' && this.jobs[status]) {
          this.jobs[status] = data.jobs;
        } else {
          // Otherwise, distribute jobs to their respective status arrays
          this._organizeJobsByStatus(data.jobs);
        }
        
        return {
          jobs: data.jobs,
          pagination: data.pagination
        };
      }
      
      throw new Error(data.message || 'Failed to fetch jobs');
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }
  
  /**
   * Fetch completed jobs (past orders)
   * @param {number} page - Page number
   * @param {number} limit - Number of jobs per page
   * @returns {Promise<Object>} - Completed job data with pagination
   */
  async fetchCompletedJobs(page = 1, limit = 10) {
    try {
      // Build URL with query parameters specifically for completed jobs
      const url = new URL(`${this.apiBaseUrl}/job-process/${this.shopkeeperId}/by-status/completed`);
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      
      // Fetch data from API
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        this.jobs.completed = data.printJobs;
        
        return {
          jobs: data.printJobs,
          pagination: {
            totalJobs: data.totalJobs || data.printJobs.length,
            totalPages: data.totalPages || Math.ceil((data.totalJobs || data.printJobs.length) / limit),
            currentPage: page
          }
        };
      }
      
      throw new Error(data.message || 'Failed to fetch completed jobs');
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
      throw error;
    }
  }
  
  /**
   * Organize jobs by their status
   * @param {Array} jobs - List of jobs
   * @private
   */
  _organizeJobsByStatus(jobs) {
    // Reset status arrays
    this.jobs.pending = [];
    this.jobs.processing = [];
    this.jobs.completed = [];
    this.jobs.cancelled = [];
    this.jobs.failed = [];
    
    // Sort jobs into their respective status arrays
    jobs.forEach(job => {
      if (this.jobs[job.status]) {
        this.jobs[job.status].push(job);
      }
    });
  }
  
  /**
   * Send a print job to the printer
   * @param {string} jobId - ID of the job to print
   * @returns {Promise<Object>} - Response from the server
   */
  async sendJobToPrinter(jobId) {
    try {
      // Check if any printers are online before proceeding
      if (!this.hasPrintersOnline()) {
        throw new Error('No printers are currently online. Please check printer connections and try again.');
      }
      
      const response = await fetch(`${this.apiBaseUrl}/job-process/${jobId}/execute`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to send job to printer');
      }
      
      return data;
    } catch (error) {
      console.error('Error sending job to printer:', error);
      throw error;
    }
  }
  
  /**
   * Update job status
   * @param {string} jobId - ID of the job to update
   * @param {string} status - New status (processing, completed, cancelled, failed)
   * @returns {Promise<Object>} - Response from the server
   */
  async updateJobStatus(jobId, status) {
    try {
      // For processing status, we need to check if printers are online
      if (status === 'processing' && !this.hasPrintersOnline()) {
        throw new Error('No printers are currently online. Cannot process job.');
      }
      
      const response = await fetch(`${this.apiBaseUrl}/shopkeeper-dashboard/print-jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || `Failed to update job status to ${status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error updating job status to ${status}:`, error);
      throw error;
    }
  }
  
  /**
   * Get job details
   * @param {string} jobId - ID of the job
   * @returns {Promise<Object>} - Job details
   */
  async getJobDetails(jobId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/shopkeeper-dashboard/print-jobs/${jobId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to get job details');
      }
      
      return data.job;
    } catch (error) {
      console.error('Error getting job details:', error);
      throw error;
    }
  }
}

module.exports = PrinterDashboardClient;
