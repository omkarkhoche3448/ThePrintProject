const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// Import as a default export
const Store = require('electron-store').default;

// Initialize store for persistent data
const store = new Store();

// Rest of your code remains the same

// Rest of your code remains the same

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  
  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for authentication
ipcMain.handle('authenticate', async (event, credentials) => {
  // In a real app, you would check against a secure database
  // For this demo, we'll use a hardcoded value in the electron-store
  const users = store.get('users') || [{ username: 'admin', password: 'password' }];
  
  const user = users.find(
    u => u.username === credentials.username && u.password === credentials.password
  );
  
  return !!user;
});

// IPC handlers for orders and printers
ipcMain.handle('get-orders', async () => {
  return store.get('orders') || [];
});

ipcMain.handle('get-queue', async () => {
  return store.get('queue') || [];
});

ipcMain.handle('get-printers', async () => {
  return store.get('printers') || [];
});

ipcMain.handle('update-queue', async (event, queue) => {
  store.set('queue', queue);
  return true;
});

ipcMain.handle('update-printer-status', async (event, { printerId, status, jobId }) => {
  const printers = store.get('printers') || [];
  const updatedPrinters = printers.map(printer => 
    printer.id === printerId ? { ...printer, status, currentJob: jobId } : printer
  );
  store.set('printers', updatedPrinters);
  
  // Simulate printer finishing job after 30 seconds
  if (status === 'busy') {
    setTimeout(() => {
      const currentPrinters = store.get('printers') || [];
      const newPrinters = currentPrinters.map(printer => 
        printer.id === printerId ? { ...printer, status: 'available', currentJob: null } : printer
      );
      store.set('printers', newPrinters);
      mainWindow.webContents.send('printer-available', printerId);
    }, 30000);
  }
  
  return true;
});

// Initialize demo data if none exists
app.whenReady().then(() => {
  if (!store.has('users')) {
    store.set('users', [{ username: 'admin', password: 'password' }]);
  }
  
  if (!store.has('orders')) {
    store.set('orders', [
      { id: 1, fileName: 'report.pdf', pageCount: 24, colorMode: 'Color', timestamp: Date.now() },
      { id: 2, fileName: 'invoice.pdf', pageCount: 2, colorMode: 'BW', timestamp: Date.now() - 1000 * 60 * 30 },
    ]);
  }
  
  if (!store.has('queue')) {
    store.set('queue', []);
  }
  
  if (!store.has('printers')) {
    store.set('printers', [
      { id: 1, name: 'Printer 1', status: 'available', currentJob: null },
      { id: 2, name: 'Printer 2', status: 'available', currentJob: null },
      { id: 3, name: 'Printer 3', status: 'available', currentJob: null },
    ]);
  }
});