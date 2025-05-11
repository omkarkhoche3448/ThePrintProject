const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { printQueue } = require('./printer.js');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Route for printing PDF with configuration
router.post('/print', upload.single('pdf'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }
    
    if (!req.body.config) {
      return res.status(400).json({ error: 'No configuration provided' });
    }
    
    const pdfPath = req.file.path;
    let config;
    
    try {
      config = JSON.parse(req.body.config);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON configuration' });
    }
    
    // Add job to the print queue with priority
    const priority = config.priority !== undefined ? parseInt(config.priority, 10) : 50;
    
    // Validate priority
    if (isNaN(priority) || priority < 0 || priority > 100) {
      return res.status(400).json({ error: 'Priority must be a number between 0 and 100' });
    }
    
    // Add to queue and get job ID
    const jobId = printQueue.addJob(pdfPath, config, priority);
    
    res.status(202).json({ 
      message: 'Print job added to queue',
      jobId,
      priority
    });
    
  } catch (error) {
    console.error('Error processing print request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get print job status
router.get('/print/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  const status = printQueue.getJobStatus(jobId);
  
  if (!status) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.status(200).json(status);
});

// Route to cancel a print job
router.delete('/print/:jobId', (req, res) => {
  const { jobId } = req.params;
  
  const result = printQueue.removeJob(jobId);
  
  if (!result) {
    return res.status(404).json({ error: 'Job not found or already completed' });
  }
  
  res.status(200).json({ message: 'Print job cancelled successfully' });
});

module.exports = router; 