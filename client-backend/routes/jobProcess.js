// routes/jobProcess.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * Start processing a print job (transition from pending to processing)
 * @route PUT /job-process/:jobId/execute
 * @param {string} jobId - Print job ID
 * @returns {Object} Updated print job
 */
router.put('/:jobId/execute', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get the PrintJob model
    const PrintJob = mongoose.model('PrintJob');
    
    // Find the job and make sure it's in pending state
    const job = await PrintJob.findOne({ 
      $or: [
        { jobId: jobId }, 
        { orderId: jobId }  // Allow finding by either jobId or orderId
      ],
      status: 'pending' 
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Print job not found or not in pending state'
      });
    }
    
    // Update the job status to processing and add timestamp
    job.status = 'processing';
    job.timeline.processing = new Date();
    
    // Save the updated job
    await job.save();
    
    // Create a notification for the user
    try {
      const Notification = mongoose.model('Notification');
      
      const notification = new Notification({
        recipient: 'user',
        recipientId: job.userId,
        title: 'Print Job Processing',
        message: `Your order #${job.orderId} is now being processed`,
        type: 'order_update',
        relatedTo: {
          model: 'PrintJob',
          id: job._id
        }
      });
      
      await notification.save();
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Continue with response even if notification fails
    }
    
    return res.status(200).json({
      success: true,
      job
    });
    
  } catch (error) {
    console.error('Error executing print job:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * Get print jobs filtered by status for a shopkeeper
 * @route GET /job-process/:shopkeeperId/by-status/:status
 * @param {string} shopkeeperId - Shopkeeper ID
 * @param {string} status - Job status (pending, processing, completed, etc.)
 * @returns {Object} List of print jobs with the specified status
 */
router.get('/:shopkeeperId/by-status/:status', async (req, res) => {
  try {
    const { shopkeeperId, status } = req.params;
    
    // Validate shopkeeper ID format
    if (!mongoose.Types.ObjectId.isValid(shopkeeperId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shopkeeper ID format'
      });
    }
    
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
    
    // Find jobs with the specified shopkeeper ID and status
    const jobs = await PrintJob.find({ 
      shopkeeperId: new mongoose.Types.ObjectId(shopkeeperId),
      status
    })
    .select('jobId file.filename pricing.totalAmount status timeline createdAt')
    .sort({ createdAt: -1 });
    
    // Transform data to return simplified info
    const simplifiedJobs = jobs.map(job => ({
      jobId: job.jobId,
      amount: job.pricing?.totalAmount || 0,
      fileName: job.file?.filename || 'Unknown file',
      status: job.status,
      createdAt: job.createdAt || job.timeline?.created,
    }));
    
    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs: simplifiedJobs
    });
    
  } catch (error) {
    console.error('Error fetching jobs by status:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
