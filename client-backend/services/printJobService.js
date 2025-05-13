// services/printJobService.js
const mongoose = require('mongoose');
const wsEvents = require('../utils/wsEvents');

/**
 * Fetch all live print jobs for a specific shopkeeper
 * Live jobs are those with status 'pending' or 'processing'
 * 
 * @param {String} shopkeeperId - The ID of the shopkeeper
 * @returns {Promise<Array>} - Array of live print jobs
 */
const getLivePrintJobs = async (shopkeeperId) => {
  try {
    // Validate shopkeeper ID format
    if (!mongoose.Types.ObjectId.isValid(shopkeeperId)) {
      throw new Error('Invalid shopkeeper ID format');
    }
    
    const PrintJob = mongoose.model('PrintJob');
    
    // Find all jobs with status 'pending' or 'processing'
    const liveJobs = await PrintJob.find({
      shopkeeperId: new mongoose.Types.ObjectId(shopkeeperId),
      status: { $in: ['pending', 'processing'] }
    }).sort({ 'timeline.created': -1 }); // Newest first
    
    return liveJobs;
  } catch (error) {
    console.error('Error fetching live print jobs:', error);
    throw error;
  }
};

/**
 * Get the previous status of a job before it was updated
 * 
 * @param {String|ObjectId} jobId - The ID of the job
 * @param {String} currentStatus - The current status of the job
 * @returns {Promise<String|null>} - The previous status or null if not found
 */
const getPreviousJobStatus = async (jobId, currentStatus) => {
  try {
    // In a real production system, you might want to implement a more robust
    // solution like storing status history in the job document itself.
    // This is a simplified approach for demonstration purposes.
    
    // Check timeline timestamps to determine previous status
    const PrintJob = mongoose.model('PrintJob');
    const job = await PrintJob.findById(jobId);
    
    if (!job || !job.timeline) return null;
    
    // Get status timestamps
    const statusTimestamps = {
      pending: job.timeline.created ? new Date(job.timeline.created) : null,
      processing: job.timeline.processing ? new Date(job.timeline.processing) : null,
      completed: job.timeline.completed ? new Date(job.timeline.completed) : null,
      cancelled: job.timeline.cancelled ? new Date(job.timeline.cancelled) : null,
      failed: job.timeline.failed ? new Date(job.timeline.failed) : null,
    };
    
    // Filter out the current status and nulls
    const validStatuses = Object.entries(statusTimestamps)
      .filter(([status, timestamp]) => status !== currentStatus && timestamp)
      .sort(([, timestampA], [, timestampB]) => timestampB - timestampA);
    
    // Return the most recent previous status, or null if none found
    return validStatuses.length > 0 ? validStatuses[0][0] : null;
  } catch (error) {
    console.error('Error getting previous job status:', error);
    return null;
  }
};

/**
 * Start processing a print job (transition from pending to processing)
 * 
 * @param {String} jobId - The ID of the job (can be jobId or orderId)
 * @returns {Promise<Object>} - The updated print job object
 * @throws {Error} - If job is not found or not in pending state
 */
const startProcessingJob = async (jobId) => {
  try {
    // Validate input
    if (!jobId) {
      throw new Error('Job ID is required');
    }
    
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
      throw new Error('Print job not found or not in pending state');
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
      
      // Broadcast notification to user
      wsEvents.broadcastNotification(notification);
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Continue even if notification fails
    }
    
    return job;
  } catch (error) {
    console.error('Error starting print job processing:', error);
    throw error;
  }
};

/**
 * Set up a change stream to monitor print job changes
 * This will broadcast events when jobs are created or updated
 */
const setupPrintJobChangeStream = async () => {
  try {
    // Ensure we have a valid MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection not available');
    }
    
    const PrintJob = mongoose.model('PrintJob');
    
    // Create a change stream on the PrintJob collection
    const changeStream = PrintJob.watch([], { 
      fullDocument: 'updateLookup' // Include the full updated document
    });
      // Handle changes
    changeStream.on('change', async (change) => {
      // Get full document
      const job = change.fullDocument;
      
      if (!job) return;
      
      // Handle different operations
      switch (change.operationType) {
        case 'insert':
          // New job created
          console.log(`New print job created: ${job.jobId}`);
          wsEvents.broadcastNewPrintJob(job);
          break;
          
        case 'update':
          // Job updated
          console.log(`Print job updated: ${job.jobId}`);
            // Determine if status changed
          let previousStatus = null;
          if (change.updateDescription && change.updateDescription.updatedFields) {
            if (change.updateDescription.updatedFields.status) {
              // Need to check the previous status
              // In MongoDB change streams, updatedFields contains the new values, so we need
              // to get the previous value differently
              previousStatus = await getPreviousJobStatus(job._id, job.status);
            }
          }
          
          wsEvents.broadcastUpdatedPrintJob(job, previousStatus);
          break;
          
        case 'delete':
          // Job deleted - we don't usually do this but handle it anyway
          console.log(`Print job deleted: ${change.documentKey._id}`);
          break;
      }
    });
    
    // Handle errors
    changeStream.on('error', (error) => {
      console.error('Print job change stream error:', error);
      
      // Try to restart the change stream after a delay
      setTimeout(() => setupPrintJobChangeStream(), 5000);
    });
    
    console.log('Print job change stream initialized');
    return changeStream;
  } catch (error) {
    console.error('Error setting up print job change stream:', error);
    
    // Try to restart after a delay
    setTimeout(() => setupPrintJobChangeStream(), 5000);
    return null;
  }
};

module.exports = {
  getLivePrintJobs,
  setupPrintJobChangeStream,
  getPreviousJobStatus,
  startProcessingJob
};
