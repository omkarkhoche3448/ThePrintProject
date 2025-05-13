const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Set up temporary storage for files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, os.tmpdir()); // Use system temp directory
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// Create upload middleware with disk storage
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
}).any();

// Create route handler for order creation
router.post('/create', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    // First handle the file upload to disk
    upload(req, res, async function(err) {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      try {
        // Get order metadata
        const orderMetadata = JSON.parse(req.body.orderMetadata);
        const fileConfigs = [];
        
        // Get bucket directly from the MongoDB connection
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: 'pdfs'
        });
        
        // Process each file and upload to GridFS
        const files = req.files || [];
        const uploadPromises = files.map(async (file, i) => {
          // Get the file configuration
          const fileConfig = JSON.parse(req.body[`fileConfig${i}`]);
          
          return new Promise((resolve, reject) => {
            // Create a read stream from the temp file
            const readStream = fs.createReadStream(file.path);
            
            // Create a write stream to GridFS
            // Important: Store the fileId at creation time
            const uploadStream = bucket.openUploadStream(file.filename, {
              metadata: {
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                orderMetadata: req.body.orderMetadata
              }
            });
            
            // Store the file ID at creation time - this is the key fix
            const fileId = uploadStream.id;
            
            // Handle upload events
            uploadStream.on('error', (error) => {
              console.error('GridFS upload error:', error);
              reject(error);
            });
            
            uploadStream.on('finish', () => {
              // Add file ID and other details to fileConfigs
              fileConfigs.push({
                ...fileConfig,
                fileId: fileId, // Use the stored ID
                uploadDate: new Date()
              });
              
              // Delete temp file
              fs.unlink(file.path, (err) => {
                if (err) console.error('Failed to delete temp file:', err);
              });
              
              resolve({ _id: fileId });
            });
            
            // Pipe the file to GridFS
            readStream.pipe(uploadStream);
          });
        });
          // Wait for all files to be uploaded to GridFS
        await Promise.all(uploadPromises);
        
        // Create a single print job in database with multiple files
        const PrintJob = mongoose.model('PrintJob');
        
        // Process file configs to create file entries
        const fileEntries = fileConfigs.map(fileConfig => {
          // Map color mode to correct enum value
          let colorMode;
          if (fileConfig.options.colorMode === 'monochrome') {
            colorMode = 'monochrome';
          } else {
            colorMode = 'color';
          }
          
          return {
            filename: fileConfig.fileName,
            originalName: fileConfig.fileName,
            fileId: new mongoose.Types.ObjectId(fileConfig.fileId),
            uploadDate: fileConfig.uploadDate,
            printConfig: {
              copies: Math.min(100, Math.max(1, fileConfig.options.copies || 1)),
              color_mode: colorMode,
              paper_size: fileConfig.options.paperSize,
              orientation: fileConfig.options.orientation.toLowerCase(),
              duplex: fileConfig.options.doubleSided,
              page_ranges: fileConfig.selectedPages,
              pages_per_sheet: parseInt(fileConfig.options.pagesPerSheet || '1'),
              border: fileConfig.options.borderStyle.toLowerCase(),
              printer: 'Virtual_PDF_Printer_1', // Default printer name
              priority: orderMetadata.isPriorityOrder ? 50 : 90 // Higher priority (lower number) if marked as priority
            }
          };
        });

        // Create single print job with all files
        const printJob = {
          // Generate a custom orderId that can be displayed to users
          orderId: `ORDER-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          // Store the Clerk user ID as a string instead of trying to cast to ObjectId
          userId: orderMetadata.userId,
          // Include username from order metadata
          username: orderMetadata.username || 'Anonymous User', // Add fallback in case username is missing
          shopkeeperId: new mongoose.Types.ObjectId(orderMetadata.shopkeeperId),
          files: fileEntries,
          status: 'pending',
          payment: {
            status: 'pending',
            method: 'online'
          },
          timeline: {
            created: new Date()
          }
        };

        // Log the final object before saving to database
        console.log('Print job being saved to database:', JSON.stringify(printJob, null, 2));

        const createdJob = await PrintJob.create(printJob);

        // You can also log the saved object to see what MongoDB returns
        console.log('Saved print job:', JSON.stringify(createdJob, null, 2));
        
        return res.status(201).json({
          success: true,
          orderId: createdJob.orderId, // Return the custom orderId instead of _id
          jobId: createdJob._id,
          message: 'Order created successfully',
          job: createdJob
        });
      } catch (error) {
        // Clean up any temp files on error
        if (req.files) {
          req.files.forEach(file => {
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            } catch (unlinkErr) {
              console.error('Failed to delete temp file:', unlinkErr);
            }
          });
        }
        
        console.error('Order creation error:', error);
        return res.status(500).json({
          success: false, 
          message: 'Failed to create order',
          error: error.message
        });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all orders for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const PrintJob = mongoose.model('PrintJob');
    
    // Find all print jobs for this user
    const userOrders = await PrintJob.find({ userId })
      .populate('shopkeeperId', 'name address phone') // Populate shopkeeper details
      .sort({ 'timeline.created': -1 }); // Sort by creation date (newest first)
    
    return res.status(200).json({
      success: true,
      count: userOrders.length,
      orders: userOrders
    });
    
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
});

module.exports = router;