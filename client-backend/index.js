// index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const dotenv = require('dotenv');

// Load models
require('./models/shopkeeper');
// require('./models/user');
// require('./models/printJob');
// require('./models/transaction');
// require('./models/notification');

// Import database connection
const connectDB = require('./utils/db');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
let gfs;
connectDB().then((conn) => {
  gfs = new mongoose.mongo.GridFSBucket(conn.connection.db, {
    bucketName: 'pdfs'
  });
});

// Create storage engine for file uploads
const storage = new GridFsStorage({
  url: 'mongodb+srv://admin:admin@customerservicechat.4uk1s.mongodb.net/printingAutomation',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'pdfs',
      filename: `${Date.now()}_${file.originalname}`,
      metadata: {
        userId: req.body.userId,
        shopkeeperId: req.body.shopkeeperId
      }
    };
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed'));
  }
});

// Import route files
const shopkeeperRoutes = require('./routes/shopkeepers');
// const userRoutes = require('./routes/users');
// const printJobRoutes = require('./routes/printJobs');

// Use routes
app.use('/api/shopkeepers', shopkeeperRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/print-jobs', printJobRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Printing Automation API is running');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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