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
        
        // Create print jobs in database
        const PrintJob = mongoose.model('PrintJob');
        const printJobs = fileConfigs.map(fileConfig => {
          // Map color mode to correct enum value (Fix case sensitivity)
          let colorMode;
          if (fileConfig.options.colorMode.toLowerCase() === 'blackandwhite') {
            colorMode = 'blackAndWhite';
          } else {
            colorMode = 'color';
          }

          return {
            // Store the Clerk user ID as a string instead of trying to cast to ObjectId
            userId: orderMetadata.userId,
            shopkeeperId: new mongoose.Types.ObjectId(orderMetadata.shopkeeperId),
            file: {
              filename: fileConfig.fileName,
              originalName: fileConfig.fileName,
              fileId: new mongoose.Types.ObjectId(fileConfig.fileId),
              uploadDate: fileConfig.uploadDate
            },
            printConfig: {
              copies: fileConfig.options.copies,
              // Use the properly formatted enum value
              colorMode: colorMode,
              pageSize: fileConfig.options.paperSize,
              orientation: fileConfig.options.orientation || 'portrait',
              duplexPrinting: fileConfig.options.doubleSided,
              pageRange: fileConfig.selectedPages,
              pagesPerSheet: parseInt(fileConfig.options.pagesPerSheet || '1')
            },
            status: 'pending',
            payment: {
              status: 'pending',
              method: 'online'
            },
            timeline: {
              created: new Date()
            }
          };
        });
        
        const createdJobs = await PrintJob.insertMany(printJobs);
        
        return res.status(201).json({
          success: true,
          orderId: createdJobs[0]._id,
          message: 'Order created successfully',
          jobs: createdJobs
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

module.exports = router;