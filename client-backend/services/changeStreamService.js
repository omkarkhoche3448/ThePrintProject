// services/changeStreamService.js
const mongoose = require('mongoose');
const EventEmitter = require('events');

// Custom event emitter to handle order events
class PrintJobEventEmitter extends EventEmitter {}

// Create a singleton instance
const printJobEvents = new PrintJobEventEmitter();

// Initialize watch on PrintJob collection
const initChangeStream = async () => {
  try {
    // Check if connection is ready
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection not ready. Change stream not initialized.');
      return;
    }

    console.log('Initializing PrintJob change stream...');
    
    // Get the PrintJob collection
    const PrintJob = mongoose.model('PrintJob');
    
    // Create a change stream pipeline that filters for insert operations
    const changeStream = PrintJob.watch([
      {
        $match: {
          operationType: { $in: ['insert', 'update'] }
        }
      }
    ], { 
      fullDocument: 'updateLookup' // Include the full updated document
    });
    
    // Handle change events
    changeStream.on('change', (change) => {
      try {
        if (change.operationType === 'insert') {
          // For new print jobs
          const newJob = change.fullDocument;
          
          // Emit event with shopkeeper ID to allow filtering
          printJobEvents.emit('newPrintJob', {
            shopkeeperId: newJob.shopkeeperId?.toString(),
            job: {
              jobId: newJob.jobId,
              amount: newJob.pricing?.totalAmount || 0,
              fileName: newJob.file?.filename || 'Unknown file',
              status: newJob.status,
              createdAt: newJob.createdAt || newJob.timeline?.created
            }
          });
        } else if (change.operationType === 'update') {
          // For updated print jobs
          const updatedJob = change.fullDocument;
          
          printJobEvents.emit('updatedPrintJob', {
            shopkeeperId: updatedJob.shopkeeperId?.toString(),
            job: {
              jobId: updatedJob.jobId,
              status: updatedJob.status,
              updatedAt: new Date()
            }
          });
        }
      } catch (error) {
        console.error('Error processing change stream event:', error);
      }
    });
    
    // Handle errors and closure
    changeStream.on('error', (error) => {
      console.error('Change stream error:', error);
      
      // Attempt to restart the change stream after a delay
      setTimeout(() => {
        console.log('Attempting to restart change stream...');
        initChangeStream();
      }, 5000); // 5 second delay before reconnecting
    });
    
    changeStream.on('close', () => {
      console.log('Change stream closed. Attempting to reconnect...');
      
      // Attempt to restart the change stream after a delay
      setTimeout(() => {
        console.log('Attempting to restart change stream...');
        initChangeStream();
      }, 5000); // 5 second delay before reconnecting
    });
    
    console.log('PrintJob change stream initialized successfully');
    return printJobEvents;
    
  } catch (error) {
    console.error('Failed to initialize change stream:', error);
    
    // Attempt to restart the change stream after a delay
    setTimeout(() => {
      console.log('Attempting to restart change stream...');
      initChangeStream();
    }, 5000); // 5 second delay before reconnecting
  }
};

module.exports = {
  initChangeStream,
  printJobEvents
};