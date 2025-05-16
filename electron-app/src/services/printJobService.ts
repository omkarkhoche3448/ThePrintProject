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
  pdfCount?: number;
  cost?: string;
  files?: Array<{
    filename: string;
    originalName: string;
    fileId: string;
    printConfig: PrintConfig;
    _id: string;
  }>;
}

export interface PrintConfig {
  copies: number;
  color_mode: 'color' | 'monochrome';
  paper_size: string;
  orientation: 'portrait' | 'landscape';
  duplex: boolean;
  page_ranges: string;
  pages_per_sheet: number;
  border: string;
  printer?: string;
  priority?: number;
}

export interface PrinterInfo {
  printer: string;    // Changed from 'name' to 'printer'
  status: string;
  description?: string;
  alerts?: string;
  connection?: string;
  isDefault?: boolean;
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
  }
  /**
   * Execute a job (start processing) with printer assignment and priority calculation
   * @param jobId The ID of the job to execute
   * @returns Promise with job response
   */
  public async executeJob(jobId: string): Promise<PrintJobResponse> {
    try {
      // First get the job details to access printConfig
      const jobDetailsResponse = await api.get(`/job-process/${jobId}/details`);
      
      if (!jobDetailsResponse.data?.success) {
        return {
          success: false,
          message: 'Failed to get job details',
          error: 'Could not retrieve job configuration'
        };
      }
      
      const job = jobDetailsResponse.data.job;
      
      // Get available printers
      const printers = await this.getSystemPrinters();
      if (!printers.success) {
        console.warn('Could not get system printers:', printers.error);
      }
      
      // Update each file in the job with assigned printer and priority
      const updates = {
        files: job.files.map((file: any) => {
          // Assign printer
          const assignedPrinter = this.assignPrinter(
            printers.success ? printers.printers : []
          );
          
          // Calculate priority
          const priority = this.calculatePriority(file.printConfig);
          
          return {
            fileId: file.fileId,
            _id: file._id,
            printConfig: {
              ...file.printConfig,
              printer: assignedPrinter,
              priority: priority
            }
          };
        })
      };
      
      // Send updates to the server
      const response = await api.post(`/job-process/${jobId}/start-processing`, updates);
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
   * Get available system printers
   */
  private async getSystemPrinters(): Promise<{success: boolean, printers?: PrinterInfo[], error?: string}> {
    try {
      if (window.electronAPI) {
        return await window.electronAPI.getPrinters();
      }
      return {
        success: false,
        error: 'Electron API not available'
      };
    } catch (error: any) {
      console.error('Error getting printers:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Assign an appropriate printer to the job
   * @param printers List of available printers
   * @returns Name of the assigned printer
   */
  private assignPrinter(printers: PrinterInfo[]): string {
    if (!printers || printers.length === 0) {
      return 'Virtual_PDF_Printer_2';
    }
    
    // Add debug log to see what printers are available
    console.log('Available printers:', printers);
    
    // Find an idle printer
    const idlePrinter = printers.find(p => 
      p.status === 'IDLE' || p.status === 'idle'
    );
    
    if (idlePrinter) {
      // Use printer property instead of name
      console.log('Found idle printer:', idlePrinter.printer || "Boom2");
      return idlePrinter.printer || "Boom2";
    }
    
    // Find default printer
    const defaultPrinter = printers.find(p => p.isDefault);
    if (defaultPrinter) {
      console.log('Using default printer:', defaultPrinter.printer || "Boom3");
      return defaultPrinter.printer || "Boom3";
    }
    
    // Fallback to first available printer
    if (printers.length > 0) {
      console.log('Using first available printer:', printers[0].printer || "Boom4");
      return printers[0].printer || "Boom4";
    }
    
    // Last resort fallback
    return 'Virtual_PDF_Printer_2';
  }
  
  /**
   * Calculate priority based on print configuration
   * Priority is 0-100 with lower numbers being higher priority
   * @param printConfig The print configuration
   * @returns Priority value
   */
  private calculatePriority(printConfig: PrintConfig): number {
    const copies = printConfig.copies || 1;
    const pageCount = this.calculateTotalPages(printConfig.page_ranges);
    
    // Calculate total sheets to print
    const totalPages = pageCount * copies;
    
    // Assign priority based on total pages (inverse relationship)
    if (totalPages <= 5) {
      // Small jobs (1-5 pages): high priority (80-100)
      return Math.max(100 - (totalPages * 4), 80);
    } else if (totalPages <= 20) {
      // Medium jobs (6-20 pages): medium priority (40-79)
      return Math.max(85 - (totalPages * 2.5), 40);
    } else if (totalPages <= 50) {
      // Large jobs (21-50 pages): lower priority (20-39)
      return Math.max(45 - (totalPages / 2), 20);
    } else {
      // Very large jobs (>50 pages): lowest priority (0-19)
      return Math.max(25 - (totalPages / 10), 0);
    }
  }
  
  /**
   * Calculate total pages from a page range string
   * @param pageRanges Page ranges like "1-7" or "2-5, 8, 9-14"
   * @returns Total number of pages
   */
  private calculateTotalPages(pageRanges: string): number {
    if (!pageRanges || pageRanges.trim() === '') {
      return 0;
    }
    
    let totalPages = 0;
    // Split by comma
    const ranges = pageRanges.split(',').map(r => r.trim());
    
    for (const range of ranges) {
      if (range.includes('-')) {
        // Handle range like "1-7"
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          totalPages += (end - start + 1);
        }
      } else {
        // Handle single page like "8"
        const page = parseInt(range.trim());
        if (!isNaN(page)) {
          totalPages++;
        }
      }
    }
    
    return totalPages || 1; // Default to 1 if calculation fails
  }
}

// Export a singleton instance
const printJobService = new PrintJobService();
export default printJobService;
