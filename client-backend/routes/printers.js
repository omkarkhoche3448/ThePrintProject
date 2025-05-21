// routes/printers.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');

// Endpoint to check if any printers are available for processing jobs
router.get('/available', async (req, res) => {
  try {
    // This will call the Electron app to check printer availability
    // We'll call the print controller endpoint which would be exposed by the Electron app
    const response = await axios.get('http://localhost:3001/api/printers/available');
    
    return res.json(response.data);
  } catch (error) {
    console.error('Error checking printer availability:', error);
    
    // If we can't reach the printer service, we'll assume no printers are available
    return res.json({
      available: false,
      message: 'Printer service is not available'
    });
  }
});

module.exports = router;
