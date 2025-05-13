// routes/shopkeeperDashboard.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const printJobService = require('../services/printJobService');

/**
 * Get all live print jobs for a shopkeeper (pending or processing)
 * @route GET /:shopkeeperId/live-print-jobs
 * @description Get all print jobs with status pending or processing
 * @access Private
 */
router.get('/:shopkeeperId/live-print-jobs', async (req, res) => {
  try {
    const { shopkeeperId } = req.params;
    
    // Get live print jobs (pending and processing)
    const liveJobs = await printJobService.getLivePrintJobs(shopkeeperId);
    
    return res.status(200).json({
      success: true,
      count: liveJobs.length,
      jobs: liveJobs
    });
    
  } catch (error) {
    console.error('Error fetching live print jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get print jobs for a specific shopkeeper with pagination and status filtering
router.get('/:shopkeeperId/print-jobs', async (req, res) => {
  try {
    const { shopkeeperId } = req.params;
    
    // Validate shopkeeper ID format
    if (!mongoose.Types.ObjectId.isValid(shopkeeperId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shopkeeper ID format'
      });
    }
    
    // Parse pagination and filtering parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || null; // 'pending', 'completed', etc.
    
    // Build the query
    const query = { 
      shopkeeperId: new mongoose.Types.ObjectId(shopkeeperId) 
    };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Get the PrintJob model
    const PrintJob = mongoose.model('PrintJob');
      // Execute the query with pagination and only fetch necessary fields
    const printJobs = await PrintJob.find(query)
      .select('jobId orderId files username userId pricing.totalAmount status timeline createdAt')
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalJobs = await PrintJob.countDocuments(query);
    
    // Transform data to return simplified info
    const simplifiedJobs = printJobs.map(job => ({
      jobId: job.jobId,
      orderId: job.orderId,
      username: job.username || 'Unknown User',
      userId: job.userId,
      amount: job.pricing?.totalAmount || 0,
      fileCount: job.files?.length || 0,
      fileNames: job.files?.map(file => file.filename).join(', ') || 'Unknown file',
      status: job.status,
      createdAt: job.createdAt || job.timeline?.created,
    }));
    
    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs: totalJobs,
      jobs: simplifiedJobs
    });
    
  } catch (error) {
    console.error('Error fetching shopkeeper print jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get job details for a specific print job
router.get('/print-jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get the PrintJob model
    const PrintJob = mongoose.model('PrintJob');
    
    // Find by jobId string or orderId
    const printJob = await PrintJob.findOne({
      $or: [
        { jobId },
        { orderId: jobId }
      ]
    });
    
    if (!printJob) {
      return res.status(404).json({
        success: false,
        message: 'Print job not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      job: printJob
    });
    
  } catch (error) {
    console.error('Error fetching print job details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update status of a print job
router.put('/print-jobs/:jobId/status', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    
    // Validate status value
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Get the PrintJob model
    const PrintJob = mongoose.model('PrintJob');
    
    // Update the status and add timestamp to timeline
    const timelineUpdate = {};
    timelineUpdate[`timeline.${status}`] = new Date();
    
    // Find and update the job
    const updatedJob = await PrintJob.findOneAndUpdate(
      { jobId },
      { 
        $set: { 
          status,
          ...timelineUpdate
        } 
      },
      { new: true } // Return the updated document
    );
    
    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: 'Print job not found'
      });
    }
    
    // Create a notification for the user
    try {
      const Notification = mongoose.model('Notification');
      
      const notification = new Notification({
        recipient: 'user',
        recipientId: updatedJob.userId,
        title: 'Print Job Update',
        message: `Your print job (${jobId}) status has been updated to ${status}`,
        type: 'order_update',
        relatedTo: {
          model: 'PrintJob',
          id: updatedJob._id
        }
      });
      
      await notification.save();
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Continue with response even if notification fails
    }
    
    return res.status(200).json({
      success: true,
      job: updatedJob
    });
    
  } catch (error) {
    console.error('Error updating print job status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get counts of jobs by status for a shopkeeper (for dashboard stats)
router.get('/:shopkeeperId/job-stats', async (req, res) => {
  try {
    const { shopkeeperId } = req.params;
    
    // Validate shopkeeper ID format
    if (!mongoose.Types.ObjectId.isValid(shopkeeperId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shopkeeper ID format'
      });
    }
    
    // Get the PrintJob model
    const PrintJob = mongoose.model('PrintJob');
    
    // Aggregate to get counts by status
    const stats = await PrintJob.aggregate([
      { 
        $match: { 
          shopkeeperId: new mongoose.Types.ObjectId(shopkeeperId) 
        } 
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format the results into an object
    const result = {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      failed: 0
    };
    
    stats.forEach(item => {
      if (result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    });
    
    // Add total count
    result.total = Object.values(result).reduce((sum, count) => sum + count, 0);
    
    return res.status(200).json({
      success: true,
      stats: result
    });
    
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;