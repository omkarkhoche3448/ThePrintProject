const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Example: Send a message to the main process
  send: (channel, data) => {
    // Only allow certain channels to be sent
    const validChannels = ["to-main"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Example: Receive a message from the main process
  receive: (channel, func) => {
    const validChannels = ["from-main"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  // Example: Invoke a method in the main process and get a result
  invoke: async (channel, data) => {
    const validChannels = ["get-app-version"];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
  }
});
