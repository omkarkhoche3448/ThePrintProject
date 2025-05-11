// CommonJS entry point for Electron
const { spawn } = require('child_process');
const path = require('path');
const { app } = require('electron');

// Use the Node.js flags to support ES modules
const electronProcess = spawn(process.execPath, [
  '--experimental-specifier-resolution=node', 
  '--experimental-modules', 
  '--es-module-specifier-resolution=node',
  path.join(__dirname, 'electron', 'main.js')
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Remove ELECTRON_RUN_AS_NODE since we're directly running Electron
    NODE_ENV: process.env.NODE_ENV || 'production'
  }
});

electronProcess.on('close', (code) => {
  process.exit(code);
});