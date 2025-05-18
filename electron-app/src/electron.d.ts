// Type definitions for Electron API
export interface ElectronAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: Function) => void;
  invoke: <T>(channel: string, data?: any) => Promise<T>;
}

// Types for the printer management API
export interface PrinterOperationResponse {
  success: boolean;
  printers?: Printer[];
  message?: string;
  error?: string;
  automationEnabled?: boolean;
}

export interface Printer {
  id: string;
  name: string;
  online: boolean;
  jobCount: number;
}

export interface ElectronPrinterAPI {
  getPrinters: () => Promise<PrinterOperationResponse>;
  setPrinterStatus: (data: { printerId: string, isOnline: boolean }) => Promise<PrinterOperationResponse>;
  setAutomationEnabled: (data: { enabled: boolean }) => Promise<PrinterOperationResponse>;
  printJob: (data: { jobId: string }) => Promise<PrinterOperationResponse>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electron: ElectronPrinterAPI;
  }
}
