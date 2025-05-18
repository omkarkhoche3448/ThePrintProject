# ThePrintProject Electron App

This is the desktop client application for ThePrintProject, which integrates with Windows printer systems.

## Project Structure

- `electron/` - Contains main process code for Electron
  - `main.cjs` - Main Electron process entry point
  - `preload.cjs` - Preload script for Electron
  - `printJobController.cjs` - Manages print jobs and distribution
  - `windowsPrinterManager.cjs` - Handles Windows printer discovery and status
- `src/` - Front-end React application
  - `components/` - React UI components
  - `pages/` - Main application pages
  - `services/` - API and service integration

## Module System

This project uses a mixed module system:

- **ES Modules**: The front-end code uses ES modules (.js/.tsx files)
- **CommonJS**: The Electron main process uses CommonJS (.cjs files)

The package.json has `"type": "module"`, which means:
- Files with .js extension are treated as ES modules by default
- Files with .cjs extension are treated as CommonJS modules

### Troubleshooting Module Issues

If you encounter the error "ReferenceError: require is not defined in ES module scope", it's because:

1. A file with `.js` extension is trying to use `require()` (CommonJS) but package.json has `"type": "module"` which makes all `.js` files ES modules by default
2. The solution is to:
   - Rename the file to use `.cjs` extension for CommonJS files
   - Update all import references to use the new extension
   - Make sure to use `require()` for CommonJS modules and `import` for ES modules

### MongoDB Connection Handling

To prevent MongoDB session expiration errors:

1. Each task that needs database access creates its own MongoDB connection
2. Connections are explicitly closed when no longer needed
3. Avoid passing database connection instances between async functions
4. Always wrap database operations in try/catch/finally blocks to ensure connections are properly closed

#### Common MongoDB Error: `MongoExpiredSessionError: Cannot use a session that has ended`

This error occurs when:
- A MongoDB session is used after it's been closed
- A database handle is passed to an asynchronous function and used after the original connection is closed
- Sessions timeout due to inactivity

Our solution:
- Each operation that needs database access creates its own connection
- Connections are closed in finally blocks to ensure cleanup
- Jobs are processed with dedicated connections rather than sharing connections

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev:electron

# Build for production
npm run build:electron
```

## Debugging

If you encounter "ReferenceError: require is not defined in ES module scope" errors, ensure that:

1. Any file using `require()` has a `.cjs` extension
2. All imports between `.cjs` files use `require()` and include the `.cjs` extension
3. All imports from ES module files use `import` statements

## Windows Printing

The Windows printing system uses the `pdf-to-printer` package to communicate with Windows printers. See the `windowsPrinterManager.cjs` file for implementation details.
