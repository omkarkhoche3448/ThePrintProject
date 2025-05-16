// routes/jobProcess.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const printJobService = require('../services/printJobService');

/**
 * Start processing a print job (transition from pending to processing)
 * @route PUT /job-process/:jobId/execute
 * @param {string} jobId - Print job ID
 * @returns {Object} Updated print job
 */
router.put('/:jobId/execute', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Use the service to process the job
    const job = await printJobService.startProcessingJob(jobId);
      return res.status(200).json({
      success: true,
      job
    });
    
  } catch (error) {
    console.error('Error executing print job:', error);
    
    // Determine appropriate status code based on error type
    if (error.message.includes('not found') || error.message.includes('not in pending state')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * Start processing a print job (transition from pending to processing)
 * Button-friendly endpoint for UI actions
 * @route POST /job-process/:jobId/start-processing
 * @param {string} jobId - Print job ID
 * @returns {Object} Updated print job
 */
router.post('/:jobId/start-processing', async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body || {}; // Get any updates from request body
    
    // Use the service to process the job with updates
    const job = await printJobService.startProcessingJob(jobId, updates);
    
    return res.status(200).json({
      success: true,
      job,
      message: "Job processing started successfully"
    });
    
  } catch (error) {
    console.error('Error starting job processing:', error);
    
    // Determine appropriate status code based on error type
    if (error.message.includes('not found') || error.message.includes('not in pending state')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
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

/**
 * Get job details for printer assignment
 * @route GET /job-process/:jobId/details
 * @param {string} jobId - Print job ID
 * @returns {Object} Job details
 */
router.get('/:jobId/details', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Get the PrintJob model
    const PrintJob = mongoose.model('PrintJob');
    
    // Find job by jobId or orderId
    const job = await PrintJob.findOne({
      $or: [
        { jobId: jobId }, 
        { orderId: jobId }
      ]
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Print job not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      job
    });
    
  } catch (error) {
    console.error('Error fetching job details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
