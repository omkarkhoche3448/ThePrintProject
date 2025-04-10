// index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load models
require('./models/shopkeeper');
require('./models/printJob');

// Import database connection
const connectDB = require('./utils/db');

// Import orders routes
const orderRoutes = require('./routes/orders');

// Initialize Express app
const app = express();

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
    await connectDB();
    
    // Now that we have a connection, initialize GridFS bucket
    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'pdfs'
    });
    
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
    };
    
    // Use routes
    app.use('/api/shopkeepers', checkDbConnection, shopkeeperRoutes);
    app.use('/orders', checkDbConnection, orderRoutes);
    
    // Basic route for testing
    app.get('/', (req, res) => {
      res.send('Printing Automation API is running');
    });
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
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