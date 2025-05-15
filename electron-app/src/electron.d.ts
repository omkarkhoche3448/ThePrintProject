// Type definitions for Electron API
export interface ElectronAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: Function) => void;
  invoke: <T>(channel: string, data?: any) => Promise<T>;
  getPrinters: () => Promise<{
    success: boolean;
    printers?: PrinterInfo[];
    error?: string;
  }>;
}

interface PrinterInfo {
  printer: string;
  status: string;
  description: string;
  alerts: string;
  connection: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
