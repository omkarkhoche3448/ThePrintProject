# Windows Printer Integration for ThePrintProject

This extension adds Windows printer compatibility to ThePrintProject, allowing it to:

1. Discover and list all connected printers on a Windows machine
2. Track printer availability status
3. Distribute print jobs among multiple printers
4. Process print jobs with "Processing" status
5. Balance print load among available printers
6. Communicate via WebSockets for real-time updates

## Installation

To install the necessary dependencies, run these commands:

```powershell
# From the client-backend directory
cd client-backend
npm install

# From the electron-app directory 
cd ../electron-app
npm install
```

## System Requirements

- Windows 10 or later
- Node.js 14 or later
- NPM 6 or later

## Module Compatibility

The electron-app uses a mix of ES modules and CommonJS modules:

- ES Modules (.js files with `type: "module"` in package.json)
- CommonJS Modules (.cjs files)

To maintain compatibility:
- All Electron main process files use the `.cjs` extension for CommonJS modules
- All React/frontend files use the `.js` or `.tsx` extension for ES modules
- The `printJobController.cjs` and `windowsPrinterManager.cjs` files handle the Windows printing functionality

If you encounter module loading errors, verify that:
1. `.cjs` files are imported with require()
2. `.js` files are imported with import statements
3. References between files use the correct file extension

## Starting the Application

You can start all required services using the unified startup script:

```
start.bat
```

This will:
1. Start the client-backend service first
2. Wait for the backend to initialize
3. Start the electron-app with the Windows printer integration

## Architecture

The Windows printer integration consists of these key components:

1. **WindowsPrinterManager**: Core service for discovering printers, managing printer status, and sending print jobs to Windows printers.

2. **PrintJobController**: Handles processing of print jobs, including retrieving files from MongoDB GridFS, managing the print queue, and handling printer selection.

3. **Dashboard UI**: Interface for monitoring printers, controlling printer status, and managing print automation.

## How It Works

1. When the application starts, it automatically discovers all connected printers.

2. Users can set printers as online or offline from the dashboard.

3. When a print job enters the "processing" state:
   - If automation is enabled, the job is sent to the most available printer
   - If automation is disabled, jobs must be printed manually

4. The system balances print load by selecting printers with the fewest active jobs.

5. All printer operations are reflected in real-time in the UI.

## Customization

You can customize printer settings by modifying these files:

- `electron-app/electron/windowsPrinterManager.cjs`: Printer discovery and communication
- `electron-app/electron/printJobController.cjs`: Print job processing and distribution
- `electron-app/src/pages/Dashboard.tsx`: UI for printer management

## Troubleshooting

### Module Loading Issues

If you encounter errors related to ES modules vs CommonJS:

1. Check file extensions:
   - `.cjs` files use CommonJS syntax with `require()`
   - `.js` files use ES module syntax with `import/export`

2. Make sure all imports reference the correct file extension:
   - In `main.cjs`, reference other CommonJS files with their `.cjs` extension

For more details, see `electron-app/README-MODULES.md`.

### MongoDB Connection Issues

If you encounter `MongoExpiredSessionError: Cannot use a session that has ended`:

1. The error occurs when a MongoDB connection or session is used after it has been closed
2. Each operation has been updated to create its own MongoDB connection when needed
3. Connections are properly closed in finally blocks
4. Database connections are not passed between async callbacks

### Printer Issues

1. If printers are not being discovered:
   - Check Windows printer settings
   - Ensure printers are properly installed in Windows
   - Restart the application

2. If print jobs fail to process:
   - Check MongoDB connection settings in `printJobController.cjs`
   - Verify printer status in the Dashboard
   - Check application logs for specific errors
