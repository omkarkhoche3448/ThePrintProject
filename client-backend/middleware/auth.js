// middleware/auth.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Middleware for verifying JWT tokens
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header (Bearer token)
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
      // Verify token
    try {
      // Ensure JWT_SECRET exists
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
          error: 'JWT_SECRET not configured'
        });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach shopkeeper to request object
      const Shopkeeper = mongoose.model('Shopkeeper');
      req.shopkeeper = await Shopkeeper.findById(decoded.id).select('-password');
      
      // If shopkeeper not found
      if (!req.shopkeeper) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route'
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Generate JWT token
exports.generateToken = (id) => {
  // Ensure JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET must be defined in environment variables');
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};
