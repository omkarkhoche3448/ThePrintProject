const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Example: Send a message to the main process
  send: (channel, data) => {
    // Only allow certain channels to be sent
    const validChannels = ["to-main", "print-job-request", "print-status-update"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Example: Receive a message from the main process
  receive: (channel, func) => {
    const validChannels = ["from-main", "print-job-received", "print-job-update"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  // Example: Invoke a method in the main process and get a result
  invoke: async (channel, data) => {
    const validChannels = ["get-app-version", "connect-websocket", "disconnect-websocket"];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
  }
});

// Expose the printer management APIs
contextBridge.exposeInMainWorld("electron", {
  // Get all printers
  getPrinters: async () => {
    return await ipcRenderer.invoke("get-printers");
  },
  // Set printer status (online/offline)
  setPrinterStatus: async (data) => {
    return await ipcRenderer.invoke("set-printer-status", data);
  },
  // Set automation status (enabled/disabled)
  setAutomationEnabled: async (data) => {
    return await ipcRenderer.invoke("set-automation-enabled", data);
  },
  // Print a specific job
  printJob: async (data) => {
    return await ipcRenderer.invoke("print-job", data);
  }
});
