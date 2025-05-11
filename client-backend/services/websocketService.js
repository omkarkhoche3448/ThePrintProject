// services/websocketService.js
const WebSocket = require('ws');
const { printJobEvents } = require('./changeStreamService');

let wss; // WebSocket server instance

// Initialize WebSocket server
const initWebSocketServer = (server) => {
  // Create WebSocket server
  wss = new WebSocket.Server({ server });
  
  // Store connected clients with their shopkeeper ID
  const clients = new Map();
  
  // Handle new connections
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection established');
    
    // Parse shopkeeper ID from query parameters
    const url = new URL(req.url, 'ws://localhost');
    const shopkeeperId = url.searchParams.get('shopkeeperId');
    
    if (shopkeeperId) {
      // Store the connection with its shopkeeper ID
      if (!clients.has(shopkeeperId)) {
        clients.set(shopkeeperId, new Set());
      }
      clients.get(shopkeeperId).add(ws);
      
      console.log(`Client registered for shopkeeper: ${shopkeeperId}`);
      
      // Send confirmation
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to print job updates',
        shopkeeperId: shopkeeperId
      }));
    } else {
      console.log('Client connected without shopkeeper ID');
      ws.close(1003, 'Shopkeeper ID required');
    }
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);
        
        // Handle specific message types if needed
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      if (shopkeeperId && clients.has(shopkeeperId)) {
        clients.get(shopkeeperId).delete(ws);
        
        // Clean up empty sets
        if (clients.get(shopkeeperId).size === 0) {
          clients.delete(shopkeeperId);
        }
        
        console.log(`Client disconnected for shopkeeper: ${shopkeeperId}`);
      }
    });
  });
  
  // Subscribe to print job events
  printJobEvents.on('newPrintJob', (data) => {
    // Send updates to relevant shopkeeper clients
    const shopkeeperId = data.shopkeeperId;
    
    if (shopkeeperId && clients.has(shopkeeperId)) {
      const shopkeeperClients = clients.get(shopkeeperId);
      
      shopkeeperClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'newPrintJob',
            data: data.job
          }));
        }
      });
    }
  });
  
  printJobEvents.on('updatedPrintJob', (data) => {
    // Send updates to relevant shopkeeper clients
    const shopkeeperId = data.shopkeeperId;
    
    if (shopkeeperId && clients.has(shopkeeperId)) {
      const shopkeeperClients = clients.get(shopkeeperId);
      
      shopkeeperClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'updatedPrintJob',
            data: data.job
          }));
        }
      });
    }
  });
  
  // Ping clients every 30 seconds to keep connections alive
  setInterval(() => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'ping' }));
      }
    });
  }, 30000);
  
  console.log('WebSocket server initialized');
};

// Broadcast message to all connected clients
const broadcast = (message) => {
  if (wss) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
};

module.exports = {
  initWebSocketServer,
  broadcast
};