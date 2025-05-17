// Sample client-side implementation for shopkeeper dashboard
// This file demonstrates how to connect to the WebSocket service

/**
 * ShopkeeperDashboard class
 * Handles real-time updates and communication with the API
 */
class ShopkeeperDashboard {
  constructor(apiBaseUrl, shopkeeperId) {
    this.apiBaseUrl = apiBaseUrl;
    this.shopkeeperId = shopkeeperId;
    this.socket = null;
    this.jobs = {
      all: [],
      pending: [],
      processing: [],
      completed: [],
      cancelled: [],
      failed: []
    };
    this.currentPage = 1;
    this.totalPages = 1;
    this.status = 'all'; // 'all', 'pending', 'completed', etc.
    
    // Event handlers - to be set by consumer
    this.onNewJob = null;
    this.onJobUpdate = null;
    this.onConnectionStatus = null;
    
    // Status-specific event handlers
    this.onJobPending = null;
    this.onJobProcessing = null;
    this.onJobCompleted = null;
    this.onJobCancelled = null;
    this.onJobFailed = null;
  }
  
  // Initialize WebSocket connection and fetch initial data
  async initialize() {
    try {
      // Fetch initial job data
      await this.fetchJobs();
      
      // Connect to WebSocket for real-time updates
      this.connectWebSocket();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      return false;
    }
  }
  
  // Connect to WebSocket server
  connectWebSocket() {
    // Get WebSocket URL from the API base URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = new URL(this.apiBaseUrl);
    wsUrl.protocol = protocol;
    
    // Create WebSocket connection with shopkeeper ID
    this.socket = new WebSocket(`${wsUrl.origin}?shopkeeperId=${this.shopkeeperId}`);
    
    // Connection opened
    this.socket.addEventListener('open', (event) => {
      console.log('WebSocket connection established');
      if (this.onConnectionStatus) {
        this.onConnectionStatus('connected');
      }
    });
    
    // Listen for messages
    this.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle different message types
        switch (message.type) {
          case 'newPrintJob':
            // A new print job has been created
            console.log('New print job received:', message.data);
            
            // Add to main jobs array
            this.jobs.all.unshift(message.data);
            
            // Add to status-specific array (usually pending)
            const jobStatus = message.data.status || 'pending';
            if (this.jobs[jobStatus]) {
              this.jobs[jobStatus].unshift(message.data);
            }
            
            if (this.onNewJob) {
              this.onNewJob(message.data);
            }
            break;
            
          case 'updatedPrintJob':
            // An existing print job has been updated
            // console.log('Print job updated:', message.data);
            
            this._updateJobInArrays(message.data);
            
            if (this.onJobUpdate) {
              this.onJobUpdate(message.data);
            }
            break;
            
          // Handle status-specific events
          case 'printJob_pending':
          case 'printJob_processing':
          case 'printJob_completed':
          case 'printJob_cancelled':
          case 'printJob_failed':
            const statusFromEvent = message.type.split('_')[1]; // Extract status from event name
            console.log(`Print job status ${statusFromEvent} update:`, message.data);
            
            // Update job in arrays
            this._updateJobInArrays(message.data);
            
            // Call status-specific handlers if they exist
            const handlerName = `onJob${statusFromEvent.charAt(0).toUpperCase() + statusFromEvent.slice(1)}`;
            if (this[handlerName]) {
              this[handlerName](message.data);
            }
            
            // Also call the general update handler
            if (this.onJobUpdate) {
              this.onJobUpdate(message.data);
            }
            break;
            
          case 'ping':
            // Server ping to keep connection alive
            this.socket.send(JSON.stringify({ type: 'pong' }));
            break;
            
          case 'connection':
            // Connection confirmation
            console.log('Connection confirmed:', message.message);
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Connection closed
    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed');
      if (this.onConnectionStatus) {
        this.onConnectionStatus('disconnected');
      }
      
      // Try to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        this.connectWebSocket();
      }, 5000);
    });
    
    // Connection error
    this.socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      if (this.onConnectionStatus) {
        this.onConnectionStatus('error');
      }
    });
  }
  
  // Helper method to update job in all arrays
  _updateJobInArrays(updatedJob) {
    // Update in main array
    const mainIndex = this.jobs.all.findIndex(job => job.jobId === updatedJob.jobId);
    if (mainIndex !== -1) {
      // Save previous status for later
      const previousStatus = this.jobs.all[mainIndex].status;
      
      // Update in main array
      this.jobs.all[mainIndex] = {
        ...this.jobs.all[mainIndex],
        ...updatedJob
      };
      
      // If status has changed, move between status arrays
      if (previousStatus !== updatedJob.status) {
        // Remove from previous status array
        if (previousStatus && this.jobs[previousStatus]) {
          this.jobs[previousStatus] = this.jobs[previousStatus].filter(
            job => job.jobId !== updatedJob.jobId
          );
        }
        
        // Add to new status array
        if (updatedJob.status && this.jobs[updatedJob.status]) {
          this.jobs[updatedJob.status].unshift(updatedJob);
        }
      } else {
        // Update in current status array
        const statusArray = this.jobs[updatedJob.status];
        if (statusArray) {
          const statusIndex = statusArray.findIndex(job => job.jobId === updatedJob.jobId);
          if (statusIndex !== -1) {
            statusArray[statusIndex] = {
              ...statusArray[statusIndex],
              ...updatedJob
            };
          }
        }
      }
    }
  }
  
  // Fetch jobs with pagination and filtering
  async fetchJobs(page = 1, status = null) {
    try {
      this.currentPage = page;
      
      // Build URL with query parameters
      const url = new URL(`${this.apiBaseUrl}/shopkeeper-dashboard/${this.shopkeeperId}/print-jobs`);
      url.searchParams.append('page', page);
      
      if (status && status !== 'all') {
        url.searchParams.append('status', status);
        this.status = status;
      } else {
        this.status = 'all';
      }
      
      // Fetch data from API
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        // Update the main jobs array
        this.jobs.all = data.jobs;
        this.totalPages = data.totalPages;
        
        // Organize jobs by status
        this._organizeJobsByStatus(data.jobs);
        
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }
  
  // Helper method to organize jobs by their status
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
  
  // Update job status
  async updateJobStatus(jobId, newStatus) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/shopkeeper-dashboard/print-jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local arrays
        this._updateJobInArrays(data.job);
        return data.job;
      } else {
        throw new Error(data.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  }
  
  // Execute job (start processing)
  async executeJob(jobId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/job-process/${jobId}/execute`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local arrays
        this._updateJobInArrays(data.job);
        return data.job;
      } else {
        throw new Error(data.message || 'Failed to execute job');
      }
    } catch (error) {
      console.error('Error executing job:', error);
      throw error;
    }
  }
  
  // Fetch jobs by specific status
  async fetchJobsByStatus(status) {
    try {
      if (!['pending', 'processing', 'completed', 'cancelled', 'failed'].includes(status)) {
        throw new Error('Invalid status');
      }
      
      const response = await fetch(`${this.apiBaseUrl}/job-process/${this.shopkeeperId}/by-status/${status}`);
      const data = await response.json();
      
      if (data.success) {
        // Update the status-specific array
        this.jobs[status] = data.jobs;
        return data.jobs;
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error(`Error fetching ${status} jobs:`, error);
      throw error;
    }
  }
  
  // Get job statistics
  async getJobStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/shopkeeper-dashboard/${this.shopkeeperId}/job-stats`);
      const data = await response.json();
      
      if (data.success) {
        return data.stats;
      } else {
        throw new Error(data.message || 'Failed to fetch job statistics');
      }
    } catch (error) {
      console.error('Error fetching job statistics:', error);
      throw error;
    }
  }
  
  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Example usage:
/*
const dashboard = new ShopkeeperDashboard('http://localhost:3000', '60a1b2c3d4e5f6g7h8i9j0k1');

// Set event handlers
dashboard.onNewJob = (job) => {
  console.log('New job received!', job);
  // Update UI to show new job
};

dashboard.onJobUpdate = (job) => {
  console.log('Job updated!', job);
  // Update UI to reflect job changes
};

// Set status-specific handlers
dashboard.onJobProcessing = (job) => {
  console.log('Job now processing:', job);
  // Move job from pending to processing in UI
};

dashboard.onConnectionStatus = (status) => {
  console.log('Connection status:', status);
  // Update UI to show connection status
};

// Initialize dashboard
dashboard.initialize().then(() => {
  console.log('Dashboard initialized with jobs:', dashboard.jobs);
  
  // Get pending jobs
  console.log('Pending jobs:', dashboard.jobs.pending);
  
  // Get processing jobs
  console.log('Processing jobs:', dashboard.jobs.processing);
  
  // Execute a job
  if (dashboard.jobs.pending.length > 0) {
    dashboard.executeJob(dashboard.jobs.pending[0].jobId)
      .then(updatedJob => {
        console.log('Job now executing:', updatedJob);
      });
  }
}).catch(error => {
  console.error('Failed to initialize dashboard:', error);
});
*/

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShopkeeperDashboard;
}