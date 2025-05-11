// Preload script runs in Electron before the renderer process
const { contextBridge, ipcRenderer } = require('electron');

// Error wrapper for IPC calls
const safeIpcInvoke = async (channel, ...args) => {
  try {
    return await ipcRenderer.invoke(channel, ...args);
  } catch (error) {
    console.error(`IPC invoke error (${channel}):`, error);
    throw error;
  }
};

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld(
  'electron',
  {
    getAppVersion: () => safeIpcInvoke('get-app-version'),
    receive: (channel, func) => {
      if (channel === 'update-message') {
        // Wrap callback to ensure error handling
        ipcRenderer.on(channel, (event, ...args) => {
          try {
            func(...args);
          } catch (error) {
            console.error(`Error in IPC receiver (${channel}):`, error);
          }
        });
      }
    }
  }
);