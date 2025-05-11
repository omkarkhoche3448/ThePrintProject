// This file uses CommonJS syntax regardless of the package.json type setting
const { app, BrowserWindow, ipcMain, session, dialog, Menu } = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Configure logging
log.transports.file.level = 'info';
log.info('Application starting...');

// Configure auto updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Global error handling
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  dialog.showErrorBox('Error', `An unexpected error occurred: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't show dialog for these as they can be frequent and disruptive
});

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow;

// Define isDevelopment based on process.env.NODE_ENV
const isDevelopment = process.env.NODE_ENV === 'development';

function createWindow() {
  log.info('Creating browser window...');
  // Create the browser window with some sensible defaults
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    // Use custom title bar styling
    frame: true,
    title: 'Print Project Dashboard'
  });

  // Load the app - in development use local dev server, in production use built files
  if (isDevelopment) {
    log.info('Running in development mode');
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools automatically in development
    mainWindow.webContents.openDevTools();
    
    // Handle DevTools specific errors by suppressing them
    mainWindow.webContents.on('did-finish-load', () => {
      // Inject script to handle DevTools console errors
      mainWindow.webContents.executeJavaScript(`
        const originalConsoleError = console.error;
        console.error = (...args) => {
          const errorString = args.join(' ');
          if (
            errorString.includes("Autofill.enable") || 
            errorString.includes("Autofill.setAddresses") ||
            errorString.includes("is not valid JSON")
          ) {
            // Suppress known DevTools errors
            return;
          }
          originalConsoleError(...args);
        };
      `);
    });
  } else {
    log.info('Running in production mode');
    // In production, load the built HTML file
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  // Handle window closed event
  mainWindow.on('closed', () => {
    log.info('Window closed');
    // Dereference the window object
    mainWindow = null;
  });
}

// Auto updater events
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
  sendStatusToWindow('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info);
  sendStatusToWindow('Update available. Downloading...');
});

autoUpdater.on('update-not-available', (info) => {
  log.info('No updates available');
  sendStatusToWindow('You are running the latest version.');
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
  sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
});

autoUpdater.on('download-progress', (progressObj) => {
  log.info('Download progress:', progressObj);
  let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
  logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
  logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
  sendStatusToWindow(logMessage);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info);
  // Ask user to update the app
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Ready',
    message: 'A new version has been downloaded. Restart the application to apply the updates.',
    buttons: ['Restart', 'Later']
  }).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// Update the sendStatusToWindow function to handle potential serialization issues
function sendStatusToWindow(text) {
  if (mainWindow) {
    try {
      // Ensure text is a string
      const safeText = typeof text === 'string' ? text : 
        (text && typeof text.toString === 'function' ? text.toString() : 'Status updated');
      mainWindow.webContents.send('update-message', safeText);
    } catch (error) {
      log.error('Error sending message to window:', error);
      // Try sending a simplified message if the original failed
      try {
        mainWindow.webContents.send('update-message', 'Status updated');
      } catch (innerError) {
        log.error('Failed to send fallback message:', innerError);
      }
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  // Remove default menu
  Menu.setApplicationMenu(null);
  
  createWindow();
  
  // Check for updates after 3 seconds (give app time to fully load)
  if (!isDevelopment) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000);
  }
});

// Quit when all windows are closed, except on macOS where it's common
// for applications to remain open until the user explicitly quits
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    log.info('All windows closed, quitting application');
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    log.info('App activated, creating window');
    createWindow();
  }
});

// Security best practices: Set Content-Security-Policy
app.on('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"]
      }
    });
  });
});

// Handle IPC messages from renderer process - using handle/invoke pattern
ipcMain.handle('get-app-version', async () => {
  try {
    // Just return the version as a string - simpler is more reliable
    return app.getVersion();
  } catch (error) {
    log.error('Error getting app version:', error);
    return 'unknown';
  }
});

// Suppress specific DevTools errors in development
app.on('web-contents-created', (_, webContents) => {
  webContents.on('console-message', (_, level, message) => {
    if (
      message.includes("Autofill.enable") || 
      message.includes("Autofill.setAddresses") ||
      message.includes("is not valid JSON")
    ) {
      // Suppress known DevTools errors
      return;
    }
    
    // Log other console messages at appropriate levels
    if (level === 0) log.info(message);
    else if (level === 1) log.warn(message);
    else if (level === 2) log.error(message);
  });
});