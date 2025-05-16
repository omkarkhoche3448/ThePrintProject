// Type definitions for Electron API
export interface ElectronAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: Function) => void;
  invoke: <T>(channel: string, data?: any) => Promise<T>;
  /**
   * Get system printers
   * @returns Promise with printer information
   */
  getPrinters: () => Promise<{
    success: boolean;
    printers?: Array<{
      printer: string;   // Changed from 'name' to 'printer'
      status: string;
      description?: string;
      alerts?: string;
      connection?: string;
      isDefault?: boolean;
    }>;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
