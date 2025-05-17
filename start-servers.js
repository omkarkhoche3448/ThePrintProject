const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting all required servers...');

// Define server paths
const serverXeroxPath = path.join(__dirname, 'server-xerox-backend');
const clientBackendPath = path.join(__dirname, 'client-backend');

// Ensure the log directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Function to start a server
function startServer(name, directory, command, args, port) {
  console.log(`Starting ${name} on port ${port}...`);
  
  // Create log streams
  const outLog = fs.createWriteStream(path.join(logDir, `${name}-out.log`));
  const errLog = fs.createWriteStream(path.join(logDir, `${name}-err.log`));
  
  // Spawn the process with environment variables
  const serverProcess = spawn(command, args, {
    cwd: directory,
    env: { 
      ...process.env, 
      PORT: port,
      MONGODB_URI: 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/?retryWrites=true&w=majority&appName=CustomerServiceChat'
    }
  });
  
  // Pipe output to logs
  serverProcess.stdout.pipe(outLog);
  serverProcess.stderr.pipe(errLog);
  
  // Log process info
  console.log(`${name} started with PID: ${serverProcess.pid}`);
  
  // Add event listeners
  serverProcess.on('error', (err) => {
    console.error(`Error starting ${name}:`, err);
  });
  
  serverProcess.on('exit', (code, signal) => {
    console.log(`${name} exited with code ${code} and signal ${signal}`);
  });
  
  return serverProcess;
}

// Start the server-xerox-backend
const xeroxServer = startServer(
  'xerox-print-server',
  serverXeroxPath,
  'node',
  ['server.js'],
  3001
);

// Start the client-backend
const clientServer = startServer(
  'client-backend',
  clientBackendPath,
  'node',
  ['index.js'],
  3000
);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping all servers...');
  xeroxServer.kill();
  clientServer.kill();
  process.exit();
});

console.log('All servers started.');
console.log('Press Ctrl+C to stop all servers.');