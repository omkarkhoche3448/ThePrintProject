// Service for managing print jobs
import api from './api';

export interface PrintJob {
  jobId: string;
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  userId: string;
  username?: string;
  shopkeeperId: string;
  createdAt: string;
  updatedAt: string;
  filesCount: number;
  fileCount?: number;
  pdfCount?: number;
  cost?: string;
  amount?: number;
  pricing?: {
    totalAmount?: number;
    itemCount?: number;
    totalPages?: number;
    priorityFee?: number;
    isShopkeeperPriority?: boolean;
    baseCost?: number;
    discount?: number;
    taxAmount?: number;
  };
  payment?: {
    status?: string;
    method?: string;
  };
  timeline?: {
    created?: string;
    deliveryMethod?: string;
  };
}

export interface PrintJobResponse {
  success: boolean;
  jobs?: PrintJob[];
  job?: PrintJob;
  message?: string;
  error?: string;
  totalPages?: number;
}

class PrintJobService {
  /**
   * Fetch print jobs with pagination and optional status filter
   * @param page Page number (1-based)
   * @param status Optional status filter
   * @returns Promise with print jobs response
   */
  public async fetchJobs(page: number = 1, status: string | null = null): Promise<PrintJobResponse> {
    try {
      const shopkeeper = localStorage.getItem('user_data');
      if (!shopkeeper) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const shopkeeperData = JSON.parse(shopkeeper);
      const shopkeeperId = shopkeeperData.id;
      
      // Build URL with query parameters
      let url = `/shopkeeper-dashboard/${shopkeeperId}/print-jobs?page=${page}`;
      
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch print jobs',
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Fetch jobs by specific status
   * @param status The status to filter by
   * @returns Promise with print jobs response
   */
  public async fetchJobsByStatus(status: string): Promise<PrintJobResponse> {
    try {
      if (!['pending', 'processing', 'completed', 'cancelled', 'failed'].includes(status)) {
        return { success: false, message: 'Invalid status' };
      }
      
      const shopkeeper = localStorage.getItem('user_data');
      if (!shopkeeper) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const shopkeeperData = JSON.parse(shopkeeper);
      const shopkeeperId = shopkeeperData.id;
      
      const response = await api.get(`/job-process/${shopkeeperId}/by-status/${status}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || `Failed to fetch ${status} jobs`,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Update job status
   * @param jobId The ID of the job to update
   * @param newStatus The new status to set
   * @returns Promise with updated job response
   */
  public async updateJobStatus(jobId: string, newStatus: string): Promise<PrintJobResponse> {
    try {
      const response = await api.put(`/shopkeeper-dashboard/print-jobs/${jobId}/status`, {
        status: newStatus
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update job status',
        error: error.response?.data?.error || error.message
      };
    }
  }  /**
   * Execute a job (start processing)
   * @param jobId The ID of the job to execute
   * @param printerId Optional printer ID to use for this job
   * @returns Promise with job response
   */
  public async executeJob(jobId: string, printerId?: string): Promise<PrintJobResponse> {
    try {
      // Using the POST endpoint which is more button-friendly for UI actions
      const url = printerId 
        ? `/job-process/${jobId}/start-processing?printerId=${printerId}`
        : `/job-process/${jobId}/start-processing`;
        
      const response = await api.post(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to execute job',
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Get job statistics
   * @returns Promise with job statistics
   */
  public async getJobStats(): Promise<any> {
    try {
      const shopkeeper = localStorage.getItem('user_data');
      if (!shopkeeper) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const shopkeeperData = JSON.parse(shopkeeper);
      const shopkeeperId = shopkeeperData.id;
      
      const response = await api.get(`/shopkeeper-dashboard/${shopkeeperId}/job-stats`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch job statistics',
        error: error.response?.data?.error || error.message
      };
    }
  }
}

// Export a singleton instance
const printJobService = new PrintJobService();
export default printJobService;
