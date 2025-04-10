const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  authenticate: (credentials) => ipcRenderer.invoke('authenticate', credentials),
  getOrders: () => ipcRenderer.invoke('get-orders'),
  getQueue: () => ipcRenderer.invoke('get-queue'),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  updateQueue: (queue) => ipcRenderer.invoke('update-queue', queue),
  updatePrinterStatus: (data) => ipcRenderer.invoke('update-printer-status', data),
  onPrinterAvailable: (callback) => {
    ipcRenderer.on('printer-available', (_, printerId) => callback(printerId));
    return () => {
      ipcRenderer.removeAllListeners('printer-available');
    };
  }
});