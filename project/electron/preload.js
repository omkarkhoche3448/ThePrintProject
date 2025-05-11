// Preload script runs in Electron before the renderer process
const { contextBridge, ipcRenderer } = require('electron');

// Simple, reliable API for the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Get app version using a more reliable approach with invoke (Promise-based API)
  getAppVersion: () => {
    return ipcRenderer.invoke('get-app-version')
      .catch(error => {
        console.error('Failed to get app version:', error);
        return 'unknown'; // Always return a value, never throw
      });
  },
  
  // Listen for update messages
  onUpdateMessage: (callback) => {
    const listener = (_, message) => {
      try {
        // Ensure message is a string
        const safeMessage = typeof message === 'string' ? message : 
          (message && typeof message === 'object' ? JSON.stringify(message) : 'Update status changed');
        callback(safeMessage);
      } catch (error) {
        console.error('Error in update message handler:', error);
        callback('Update status changed');
      }
    };
    
    // Add the listener
    ipcRenderer.on('update-message', listener);
    
    // Return a function to remove the listener (for cleanup)
    return () => {
      ipcRenderer.removeListener('update-message', listener);
    };
  }
});