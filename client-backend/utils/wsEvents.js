// utils/wsEvents.js
// This module handles WebSocket event broadcasting

/**
 * Reference to the WebSocket server and clients map
 * Will be set via the initialize function
 */
let wss = null;
let clients = null;

/**
 * Initialize the WebSocket events module with references to
 * the WebSocket server and clients map
 * 
 * @param {Object} websocketServer - The WebSocket server instance
 * @param {Map} clientsMap - The Map of connected clients
 */
const initialize = (websocketServer, clientsMap) => {
  wss = websocketServer;
  clients = clientsMap;
  console.log('WebSocket events module initialized');
};

/**
 * Broadcast an event to all connected clients or filtered clients
 * 
 * @param {String} eventType - The type of event to broadcast
 * @param {Object} eventData - The data payload for the event
 * @param {Object} filter - Optional filter to target specific clients
 *   @param {String} filter.type - Client type ('user' or 'shopkeeper')
 *   @param {String} filter.id - Client ID to filter by
 */
const broadcastEvent = (eventType, eventData, filter = null) => {
  if (!wss || !clients) {
    console.error('WebSocket events module not initialized');
    return;
  }
  
  // Create the message payload
  const message = JSON.stringify({
    type: eventType,
    data: eventData
  });
  
  // Broadcast to all matching clients
  wss.clients.forEach((client) => {
    // Skip clients that aren't ready
    if (client.readyState !== 1) return; // 1 = WebSocket.OPEN
    
    const clientInfo = clients.get(client);
    
    // If filter is provided, check if client matches
    if (filter) {
      // Skip if client type doesn't match
      if (filter.type && clientInfo.type !== filter.type) return;
      
      // Skip if client ID doesn't match
      if (filter.id && clientInfo.id !== filter.id) return;
      
      // Check for subscription match if client has subscriptions
      if (clientInfo.subscriptions && clientInfo.subscriptions.length > 0) {
        const eventChannel = eventType.split('_')[0]; // e.g., 'printJob' from 'printJob_updated'
        
        // Check if client is subscribed to this channel and matches filters
        const hasMatchingSubscription = clientInfo.subscriptions.some(sub => {
          // Check if subscription channel matches event channel
          if (sub.channel !== eventChannel) return false;
          
          // If no filters in subscription, it's a match
          if (!sub.filters) return true;
          
          // Check if event data matches subscription filters
          return Object.entries(sub.filters).every(([key, value]) => 
            eventData[key] === value
          );
        });
        
        // Skip if no matching subscription
        if (!hasMatchingSubscription) return;
      }
    }
    
    // Send message to client
    try {
      client.send(message);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  });
};

/**
 * Broadcast a new print job event to relevant clients
 * 
 * @param {Object} jobData - The print job data to broadcast
 */
const broadcastNewPrintJob = (jobData) => {
  // Broadcast to the shopkeeper assigned to this job
  broadcastEvent('newPrintJob', jobData, {
    type: 'shopkeeper',
    id: jobData.shopkeeperId.toString()
  });
  
  // Also broadcast status-specific event
  broadcastEvent(`printJob_${jobData.status}`, jobData, {
    type: 'shopkeeper',
    id: jobData.shopkeeperId.toString()
  });
  
  // Broadcast to the user who created the job
  broadcastEvent('newPrintJob', jobData, {
    type: 'user',
    id: jobData.userId
  });
};

/**
 * Broadcast an updated print job event to relevant clients
 * 
 * @param {Object} jobData - The updated print job data to broadcast
 * @param {String} previousStatus - The previous status of the job (optional)
 */
const broadcastUpdatedPrintJob = (jobData, previousStatus = null) => {
  // Broadcast to the shopkeeper assigned to this job
  broadcastEvent('updatedPrintJob', jobData, {
    type: 'shopkeeper',
    id: jobData.shopkeeperId.toString()
  });
  
  // Also broadcast status-specific event if status changed
  if (previousStatus && previousStatus !== jobData.status) {
    broadcastEvent(`printJob_${jobData.status}`, jobData, {
      type: 'shopkeeper',
      id: jobData.shopkeeperId.toString()
    });
  }
  
  // Broadcast to the user who owns the job
  broadcastEvent('updatedPrintJob', jobData, {
    type: 'user',
    id: jobData.userId
  });
};

/**
 * Broadcast a notification to a specific client
 * 
 * @param {Object} notificationData - The notification data
 */
const broadcastNotification = (notificationData) => {
  const recipientType = notificationData.recipient; // 'user' or 'shopkeeper'
  const recipientId = notificationData.recipientId.toString();
  
  broadcastEvent('notification', notificationData, {
    type: recipientType,
    id: recipientId
  });
};

module.exports = {
  initialize,
  broadcastEvent,
  broadcastNewPrintJob,
  broadcastUpdatedPrintJob,
  broadcastNotification
};
