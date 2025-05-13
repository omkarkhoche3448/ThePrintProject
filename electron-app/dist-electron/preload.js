import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  // Example: Send a message to the main process
  send: (channel, data) => {
    const validChannels = ["to-main"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Example: Receive a message from the main process
  receive: (channel, func) => {
    const validChannels = ["from-main"];
    if (validChannels.includes(channel)) {
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
