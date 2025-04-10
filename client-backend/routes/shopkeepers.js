// routes/shopkeepers.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Shopkeeper = mongoose.model('Shopkeeper');

/**
 * Get shopkeeper details by ID
 * @route GET /api/shopkeepers/:id
 * @param {string} id - Shopkeeper ID
 * @returns {Object} Shopkeeper details including printing costs
 */
router.get('/:id', async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.params.id);
    
    if (!shopkeeper) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shopkeeper not found' 
      });
    }
    
    // Return only necessary details including printing costs
    return res.status(200).json({
      success: true,
      data: {
        id: shopkeeper._id,
        name: shopkeeper.name,
        printCosts: {
          blackAndWhite: shopkeeper.printCosts.blackAndWhite,
          color: shopkeeper.printCosts.color
        },
        discountRules: shopkeeper.discountRules,
        shopHours: shopkeeper.shopHours,
        address: shopkeeper.address
      }
    });
  } catch (error) {
    console.error('Error fetching shopkeeper:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * Get shopkeeper-specific details
 * @route GET /api/shopkeepers/:id/details
 * @param {string} id - Shopkeeper ID
 * @returns {Object} Shopkeeper details including printing costs, discount rules, and shop hours
 */
router.get('/:id/details', async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.params.id, 'name printCosts discountRules shopHours address');
    
    if (!shopkeeper) {
      return res.status(404).json({
        success: false,
        message: 'Shopkeeper not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: shopkeeper,
    });
  } catch (error) {
    console.error('Error fetching shopkeeper details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * Get all shopkeepers
 * @route GET /api/shopkeepers/
 * @returns {Object[]} List of shopkeepers including name, printing costs, discount rules, shop hours, and address
 */
router.get('/', async (req, res) => {
  try {
    const shopkeepers = await Shopkeeper.find({}, 'name printCosts discountRules shopHours address');
    return res.status(200).json({
      success: true,
      data: shopkeepers,
    });
  } catch (error) {
    console.error('Error fetching shopkeepers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * Add a new shopkeeper
 * @route POST /api/shopkeepers/
 * @body {Object} shopkeeper - Shopkeeper details including name, printCosts, discountRules, shopHours, and address
 * @returns {Object} Newly created shopkeeper
 */
router.post('/', async (req, res) => {
  try {
    const { name, printCosts, discountRules, shopHours, address } = req.body;

    // Create a new shopkeeper document
    const newShopkeeper = new Shopkeeper({
      name,
      printCosts,
      discountRules,
      shopHours,
      address,
    });

    // Save the shopkeeper to the database
    const savedShopkeeper = await newShopkeeper.save();

    return res.status(201).json({
      success: true,
      data: savedShopkeeper,
    });
  } catch (error) {
    console.error('Error adding shopkeeper:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;