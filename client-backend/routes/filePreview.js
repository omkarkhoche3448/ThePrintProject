const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { protect } = require('../middleware/auth');

/**
 * Get a PDF file for preview
 * @route GET /file-preview/:fileId
 * @description Stream a PDF file from GridFS
 * @param {string} fileId - The ID of the file in GridFS
 * @access Private
 */
router.get('/:fileId', protect, async (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Validate file ID format
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID format'
      });
    }
    
    // Get the GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'pdfs'
    });
    
    // Check if file exists
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Set headers
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${files[0].filename}"`);
    
    // Stream the file to response
    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    
    // Handle errors on the stream
    downloadStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      
      // Only send error if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Error streaming file',
          error: err.message
        });
      }
    });
    
    // Pipe the file to the response
    downloadStream.pipe(res);
    
  } catch (error) {
    console.error('Error retrieving file for preview:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;