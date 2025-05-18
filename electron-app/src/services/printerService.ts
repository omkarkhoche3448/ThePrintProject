// Printer Service for managing printer operations
import { toast } from "@/hooks/use-toast";

export interface Printer {
  id: string;
  name: string;
  online: boolean;
  jobCount: number;
}

export interface PrinterOperationResponse {
  success: boolean;
  printers?: Printer[];
  message?: string;
  error?: string;
  automationEnabled?: boolean;
}

/**
 * Service class for interacting with the printer management system
 */
class PrinterService {
  /**
   * Get all available printers with their status
   * @returns Promise with printers info
   */
  public async getPrinters(): Promise<PrinterOperationResponse> {
    try {
      // Call to the electron main process
      // @ts-ignore - window.electron is injected by the preload script
      const response = await window.electron.getPrinters();
      return response;
    } catch (error: any) {
      console.error('Error getting printers:', error);
      return {
        success: false,
        message: error.message || 'Failed to get printers',
        error: error.message
      };
    }
  }

  /**
   * Set printer status (online/offline)
   * @param printerId The ID of the printer to update
   * @param isOnline Whether the printer should be online
   * @returns Promise with operation result
   */
  public async setPrinterStatus(printerId: string, isOnline: boolean): Promise<PrinterOperationResponse> {
    try {
      // Call to the electron main process
      // @ts-ignore - window.electron is injected by the preload script
      const response = await window.electron.setPrinterStatus({ printerId, isOnline });
      
      if (response.success) {
        toast({
          title: `Printer ${isOnline ? 'Online' : 'Offline'}`,
          description: `Printer ${printerId} is now ${isOnline ? 'online' : 'offline'}`
        });
      } else {
        toast({
          title: 'Printer Status Error',
          description: response.message || `Failed to set printer ${printerId} status`,
          variant: 'destructive'
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Error setting printer status:', error);
      return {
        success: false,
        message: error.message || 'Failed to set printer status',
        error: error.message
      };
    }
  }

  /**
   * Enable or disable print automation
   * @param enabled Whether automation should be enabled
   * @returns Promise with operation result
   */
  public async setAutomationEnabled(enabled: boolean): Promise<PrinterOperationResponse> {
    try {
      // Call to the electron main process
      // @ts-ignore - window.electron is injected by the preload script
      const response = await window.electron.setAutomationEnabled({ enabled });
      
      if (response.success) {
        toast({
          title: `Automation ${enabled ? 'Enabled' : 'Disabled'}`,
          description: response.message || `Print automation is now ${enabled ? 'enabled' : 'disabled'}`
        });
      } else {
        toast({
          title: 'Automation Error',
          description: response.message || `Failed to ${enabled ? 'enable' : 'disable'} automation`,
          variant: 'destructive'
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Error setting automation status:', error);
      return {
        success: false,
        message: error.message || 'Failed to set automation status',
        error: error.message
      };
    }
  }

  /**
   * Print a specific job
   * @param jobId The ID of the job to print
   * @returns Promise with operation result
   */
  public async printJob(jobId: string): Promise<PrinterOperationResponse> {
    try {
      // Call to the electron main process
      // @ts-ignore - window.electron is injected by the preload script
      const response = await window.electron.printJob({ jobId });
      
      if (response.success) {
        toast({
          title: 'Print Started',
          description: response.message || `Job ${jobId} started printing`
        });
      } else {
        toast({
          title: 'Print Error',
          description: response.message || `Failed to print job ${jobId}`,
          variant: 'destructive'
        });
      }
      
      return response;
    } catch (error: any) {
      console.error('Error printing job:', error);
      return {
        success: false,
        message: error.message || 'Failed to print job',
        error: error.message
      };
    }
  }
}

// Export a singleton instance
const printerService = new PrinterService();
export default printerService;
