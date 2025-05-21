const express = require('express');
const cors = require('cors');
const WindowsPrinterManager = require('./windowsPrinterManager.cjs');

// Create a printer manager instance
const printerManager = new WindowsPrinterManager();

// Start API server for printer operations
function startPrinterApiServer() {
  const app = express();
  
  // Use CORS to allow requests from other origins
  app.use(cors());
  app.use(express.json());
  
  // Route to check if any printers are available
  app.get('/api/printers/available', async (req, res) => {
    try {
      // Ensure printer list is up-to-date
      await printerManager.discoverPrinters();
      
      // Check if any printers are online
      const hasOnlinePrinters = printerManager.hasOnlinePrinters();
      
      return res.json({
        available: hasOnlinePrinters,
        printers: printerManager.availablePrinters,
        message: hasOnlinePrinters 
          ? `${printerManager.availablePrinters.length} printer(s) available` 
          : 'No printers are currently online'
      });
    } catch (error) {
      console.error('[PrinterApi] Error checking printer availability:', error);
      return res.status(500).json({
        available: false,
        error: error.message,
        message: 'Error checking printer availability'
      });
    }
  });
  
  // Get all printers and their status
  app.get('/api/printers', async (req, res) => {
    try {
      // Ensure printer list is up-to-date
      await printerManager.discoverPrinters();
      
      return res.json({
        printers: printerManager.getPrinterList(),
        message: 'Printer list retrieved successfully'
      });
    } catch (error) {
      console.error('[PrinterApi] Error getting printer list:', error);
      return res.status(500).json({
        error: error.message,
        message: 'Error retrieving printer list'
      });
    }
  });
  
  // Start the server
  const PORT = process.env.PRINTER_API_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`[PrinterApi] Printer API server running on port ${PORT}`);
  });
}

module.exports = {
  startPrinterApiServer
};
