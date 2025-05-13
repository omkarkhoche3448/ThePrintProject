import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

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
    // In development mode, load from the dev server
    mainWindow.loadURL("http://localhost:8080");
    // Only open dev tools if explicitly needed for debugging
    // Comment this line out to prevent extra window
    // mainWindow.webContents.openDevTools();
  } else {
    // In production mode, load the built app
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();

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

// Handle IPC messages from renderer process
// Add any IPC handlers here as needed
// Example:
// ipcMain.handle("get-app-version", () => app.getVersion());
