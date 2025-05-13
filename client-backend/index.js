// index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');

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

// Import services
const { initChangeStream } = require('./services/changeStreamService');
const { initWebSocketServer } = require('./services/websocketService');

// Initialize Express app
const app = express();
const server = http.createServer(app);

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
    
    // Initialize MongoDB Change Stream
    await initChangeStream();
    
    // Initialize WebSocket Server
    initWebSocketServer(server);
    
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
    
    // Basic route for testing
    app.get('/', (req, res) => {
      res.send('Printing Automation API is running');
    });    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server available at ws://localhost:${PORT}`);
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