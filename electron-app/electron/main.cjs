const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const WebSocket = require("ws");
const PrintJobController = require("./printJobController.cjs");
const { startPrinterApiServer } = require("./printerApiRoutes.cjs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const isDevelopment = process.env.ELECTRON === "true";
let mainWindow = null;
let websocket = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
let printJobController = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the application
  if (isDevelopment) {
    // In development mode, load from the dev server
    mainWindow.loadURL("http://localhost:8080");
    // Only open dev tools if explicitly needed for debugging
    // Comment this line out to prevent extra window
    // mainWindow.webContents.openDevTools();
  } else {
    // In production mode, load the built app
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

// Connect to WebSocket server
const connectWebSocket = (token, shopkeeperId) => {
  // Close existing connection if any
  if (websocket) {
    websocket.close();
  }

  const wsUrl = `ws://localhost:3000?token=${token}&type=shopkeeper&id=${shopkeeperId}`;
  websocket = new WebSocket(wsUrl);

  // WebSocket event handlers
  websocket.on('open', () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    if (mainWindow) {
      mainWindow.webContents.send('print-job-update', { 
        type: 'connection', 
        connected: true 
      });
    }
  });

  websocket.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('WebSocket message received:', message.type);
      
      if (mainWindow) {
        // Forward message to renderer process
        if (message.type === 'newPrintJob' || message.type === 'updatedPrintJob') {
          mainWindow.webContents.send('print-job-received', message);
        } else if (message.type === 'ping') {
          // Respond to ping
          websocket.send(JSON.stringify({
            event: 'pong',
            data: { timestamp: new Date().toISOString() }
          }));
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  websocket.on('close', () => {
    console.log('WebSocket connection closed');
    if (mainWindow) {
      mainWindow.webContents.send('print-job-update', { 
        type: 'connection', 
        connected: false 
      });
    }
    
    // Attempt to reconnect if not closed manually
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
      setTimeout(() => connectWebSocket(token, shopkeeperId), 5000);
    }
  });

  websocket.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('print-job-update', { 
        type: 'error', 
        error: error.message 
      });
    }
  });

  return websocket;
};

// Handle IPC messages from renderer process
ipcMain.handle('connect-websocket', (event, { token, shopkeeperId }) => {
  try {
    connectWebSocket(token, shopkeeperId);
    return { success: true };
  } catch (error) {
    console.error('Error connecting to WebSocket:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('disconnect-websocket', () => {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
  return { success: true };
});

ipcMain.on('print-job-request', (event, data) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(data));
  } else {
    console.error('WebSocket not connected');
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();
  
  // Initialize the print job controller
  printJobController = new PrintJobController();
  printJobController.init();
  
  // Start the printer API server
  startPrinterApiServer();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
