// index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');

// Load environment variables
dotenv.config();

// Load models
require('./models/shopkeeper');
require('./models/printJob');
require('./models/notification');
require('./models/transaction');

// Import database connection
const connectDB = require('./utils/db');

// Import routes
const orderRoutes = require('./routes/orders');
const shopkeeperDashboardRoutes = require('./routes/shopkeeperDashboard');
const jobProcessRoutes = require('./routes/jobProcess');
const { router: authRoutes } = require('./routes/auth');
const filePreviewRoutes = require('./routes/filePreview'); // Add this line

// Import WebSocket events utility
const wsEvents = require('./utils/wsEvents');
// Import print job service
const printJobService = require('./services/printJobService');



// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket Server
const wss = new WebSocket.Server({ server });

// Store all connected clients with their roles and ids
const clients = new Map();

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');
  
  // Parse URL params
  const params = new URLSearchParams(req.url.substring(req.url.indexOf('?')));
  const clientId = params.get('id') || 'anonymous';
  const clientType = params.get('type') || 'user'; // 'user' or 'shopkeeper'
  
  // Store client information
  clients.set(ws, { id: clientId, type: clientType });
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to WebSocket server'
  }));
  
  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleClientMessage(ws, data);
    } catch (error) {
      console.error('WebSocket message handling error:', error);
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
  
  // Send initial ping to validate connection
  ws.send(JSON.stringify({
    type: 'ping',
    data: { timestamp: new Date().toISOString() }
  }));
});

// Set up periodic pings to keep connections alive
setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'ping',
        data: { timestamp: new Date().toISOString() }
      }));
    }
  });
}, 30000); // every 30 seconds

// Initialize WebSocket events module
wsEvents.initialize(wss, clients);

// Function to handle client messages
function handleClientMessage(ws, message) {
  const clientInfo = clients.get(ws);
  
  switch (message.event) {
    case 'pong':
      // Client responded to ping - connection is alive
      break;
      
    case 'subscribe':
      // Client wants to subscribe to specific events
      if (clientInfo) {
        clientInfo.subscriptions = clientInfo.subscriptions || [];
        clientInfo.subscriptions.push(message.data);
        clients.set(ws, clientInfo);
      }
      break;
      
    case 'unsubscribe':
      // Client wants to unsubscribe from specific events
      if (clientInfo && clientInfo.subscriptions) {
        clientInfo.subscriptions = clientInfo.subscriptions.filter(
          sub => !(sub.channel === message.data.channel && 
                  JSON.stringify(sub.filters) === JSON.stringify(message.data.filters))
        );
        clients.set(ws, clientInfo);
      }
      break;
      
    default:
      console.log('Unknown WebSocket message type:', message.event);
  }
}

// CORS configuration
app.use(cors(
  {
    origin:"*",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variables to store GridFS bucket and storage
let gfs;
let upload;

// Initialize MongoDB, GridFS, and set up routes
async function initializeApp() {
  try {
    // Connect to MongoDB first
    const conn = await connectDB();
    
    // Now that we have a connection, initialize GridFS bucket
    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'pdfs'
    });
    
    // Set up print job change stream for real-time updates
    await printJobService.setupPrintJobChangeStream();
    
    // Import route files
    const shopkeeperRoutes = require('./routes/shopkeepers');
    
    // Add middleware to check DB connection
    const checkDbConnection = (req, res, next) => {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: 'Database connection not ready'
        });
      }
      next();
    };      // Use routes
    app.use('/api/shopkeepers', checkDbConnection, shopkeeperRoutes);
    app.use('/api/auth', checkDbConnection, authRoutes);
    app.use('/orders', checkDbConnection, orderRoutes);
    app.use('/shopkeeper-dashboard', checkDbConnection, shopkeeperDashboardRoutes);
    app.use('/job-process', checkDbConnection, jobProcessRoutes);
    app.use('/api/file-preview', filePreviewRoutes); // Add this line
    
    // Basic route for testing
    app.get('/', (req, res) => {
      res.send('Printing Automation API is running');
    });    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
}

// Start the application
initializeApp();

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});