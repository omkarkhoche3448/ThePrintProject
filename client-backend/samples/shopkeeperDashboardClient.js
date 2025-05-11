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
    this.jobs = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.status = 'all'; // 'all', 'pending', 'completed', etc.
    
    // Event handlers - to be set by consumer
    this.onNewJob = null;
    this.onJobUpdate = null;
    this.onConnectionStatus = null;
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
            this.jobs.unshift(message.data); // Add to beginning of array
            if (this.onNewJob) {
              this.onNewJob(message.data);
            }
            break;
            
          case 'updatedPrintJob':
            // An existing print job has been updated
            console.log('Print job updated:', message.data);
            
            // Find and update the job in our local array
            const updatedIndex = this.jobs.findIndex(job => job.jobId === message.data.jobId);
            if (updatedIndex !== -1) {
              this.jobs[updatedIndex] = {
                ...this.jobs[updatedIndex],
                ...message.data
              };
            }
            
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
        this.jobs = data.jobs;
        this.totalPages = data.totalPages;
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
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
        return data.job;
      } else {
        throw new Error(data.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
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

dashboard.onConnectionStatus = (status) => {
  console.log('Connection status:', status);
  // Update UI to show connection status
};

// Initialize dashboard
dashboard.initialize().then(() => {
  console.log('Dashboard initialized with jobs:', dashboard.jobs);
}).catch(error => {
  console.error('Failed to initialize dashboard:', error);
});
*/

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShopkeeperDashboard;
}