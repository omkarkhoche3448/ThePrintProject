// Type definitions for Electron API
export interface ElectronAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: Function) => void;
  invoke: <T>(channel: string, data?: any) => Promise<T>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
