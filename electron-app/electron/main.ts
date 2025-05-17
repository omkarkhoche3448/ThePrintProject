import { app, BrowserWindow } from "electron";
import * as path from "path";
import { initPrintJobProcessor } from './printJobProcessor';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Use different approach for ES modules
const isSquirrelStartup = process.argv.some(arg => arg.includes('--squirrel'));
if (isSquirrelStartup) {
  app.quit();
}

// Check if we're in development mode (ELECTRON=true is passed from the npm script)
const isDevelopment = process.env.ELECTRON === "true";
let mainWindow: BrowserWindow | null = null;

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the application
  if (isDevelopment) {
    mainWindow.loadURL("http://localhost:8080").catch(e => {
      console.error('Failed to load dev URL:', e);
    });
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built app
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Try at every possible event
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window did-finish-load');
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('Window dom-ready');
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  console.log('Electron app is ready');
  createWindow();
  
  console.log('Initializing print job processor...');
  initPrintJobProcessor();
  console.log('Print job processor initialized');

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
