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
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Add devTools configuration
      devTools: isDevelopment
    },
    frame: true,
    title: 'Print Project Dashboard'
  });

  if (isDevelopment) {
    log.info('Running in development mode');
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load:', errorDescription);
      // Retry loading after a short delay
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.loadURL('http://localhost:5173').catch(err => {
            log.error('Retry failed:', err);
          });
        }
      }, 1000);
    });

    mainWindow.loadURL('http://localhost:5173')
      .then(() => {
        mainWindow.webContents.openDevTools();
      })
      .catch(error => {
        log.error('Failed to load dev server:', error);
      });
  } else {
    log.info('Running in production mode');
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  mainWindow.on('closed', () => {
    log.info('Window closed');
    mainWindow = null;
  });
}

// Auto updater events with improved error handling
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
  sendStatusToWindow(`Update error: ${err.message || 'Unknown error'}`);
});

autoUpdater.on('download-progress', (progressObj) => {
  let message = `Downloading: ${Math.round(progressObj.percent)}%`;
  log.info('Download progress:', message);
  sendStatusToWindow(message);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded');
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

// Improved status message handling
function sendStatusToWindow(text) {
  if (!mainWindow) return;

  try {
    // Ensure we're sending a string
    const safeMessage = String(text).substring(0, 1000);
    mainWindow.webContents.send('update-message', safeMessage);
  } catch (error) {
    log.error('Error sending status to window:', error);
  }
}

// This method will be called when Electron has finished initialization
app.on('ready', () => {
  Menu.setApplicationMenu(null);
  createWindow();
  
  if (!isDevelopment) {
    setTimeout(() => {
      try {
        autoUpdater.checkForUpdatesAndNotify();
      } catch (error) {
        log.error('Error checking for updates:', error);
      }
    }, 3000);
  }
});

// Handle app activation
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    log.info('All windows closed, quitting application');
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    log.info('App activated, creating window');
    createWindow();
  }
});

// Set Content-Security-Policy
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

// Handle IPC messages using invoke/handle pattern for better error handling
ipcMain.handle('get-app-version', () => {
  try {
    return app.getVersion();
  } catch (error) {
    log.error('Error getting app version:', error);
    return 'unknown';
  }
});