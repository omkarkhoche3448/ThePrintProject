// routes/auth.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { protect } = require('../middleware/auth');

/**
 * Register a new shopkeeper
 * @route POST /api/auth/register
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, password, address, printCosts, discountRules, shopHours } = req.body;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    const Shopkeeper = mongoose.model('Shopkeeper');
    
    // Check if email already exists
    const emailExists = await Shopkeeper.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    // Check if phone number already exists
    const phoneExists = await Shopkeeper.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already in use'
      });
    }
    
    // Create shopkeeper
    const shopkeeper = new Shopkeeper({
      name,
      email,
      phoneNumber,
      password,
      address: address || {}, // Default to empty object if not provided
      printCosts: printCosts || { blackAndWhite: 1, color: 5 }, // Default values
      discountRules: discountRules || [],
      shopHours: shopHours || {}
    });
    
    // Save shopkeeper
    await shopkeeper.save();
    
    // Generate JWT token
    const token = generateToken(shopkeeper._id);
    
    res.status(201).json({
      success: true,
      message: 'Shopkeeper registered successfully',
      token,
      shopkeeper: {
        id: shopkeeper._id,
        name: shopkeeper.name,
        email: shopkeeper.email,
        phoneNumber: shopkeeper.phoneNumber
      }
    });
    
  } catch (error) {
    console.error('Shopkeeper registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register shopkeeper',
      error: error.message
    });
  }
});

/**
 * Login shopkeeper
 * @route POST /api/auth/login
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }
    
    const Shopkeeper = mongoose.model('Shopkeeper');
    
    // Check if shopkeeper exists
    const shopkeeper = await Shopkeeper.findOne({ email });
    if (!shopkeeper) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await shopkeeper.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = generateToken(shopkeeper._id);
    
    res.status(200).json({
      success: true,
      token,
      shopkeeper: {
        id: shopkeeper._id,
        name: shopkeeper.name,
        email: shopkeeper.email,
        phoneNumber: shopkeeper.phoneNumber
      }
    });
    
  } catch (error) {
    console.error('Shopkeeper login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
});

/**
 * Get current logged in shopkeeper's profile
 * @route GET /api/auth/me
 * @access Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    // req.shopkeeper is set by the auth middleware
    res.status(200).json({
      success: true,
      shopkeeper: req.shopkeeper
    });
  } catch (error) {
    console.error('Get shopkeeper profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

/**
 * Update shopkeeper profile
 * @route PUT /api/auth/me
 * @access Private
 */
router.put('/me', protect, async (req, res) => {
  try {
    const { name, email, phoneNumber, address, printCosts, discountRules, shopHours } = req.body;
    
    // Fields to update
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;
    if (phoneNumber) fieldsToUpdate.phoneNumber = phoneNumber;
    if (address) fieldsToUpdate.address = address;
    if (printCosts) fieldsToUpdate.printCosts = printCosts;
    if (discountRules) fieldsToUpdate.discountRules = discountRules;
    if (shopHours) fieldsToUpdate.shopHours = shopHours;
    
    // Update shopkeeper
    const Shopkeeper = mongoose.model('Shopkeeper');
    const updatedShopkeeper = await Shopkeeper.findByIdAndUpdate(
      req.shopkeeper._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      shopkeeper: updatedShopkeeper
    });
    
  } catch (error) {
    console.error('Update shopkeeper profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * Update shopkeeper password
 * @route PUT /api/auth/update-password
 * @access Private
 */
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const Shopkeeper = mongoose.model('Shopkeeper');
    // Get shopkeeper with password
    const shopkeeper = await Shopkeeper.findById(req.shopkeeper._id);
    
    // Check current password
    const isMatch = await shopkeeper.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    shopkeeper.password = newPassword;
    await shopkeeper.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
    
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
});

module.exports = { router };
