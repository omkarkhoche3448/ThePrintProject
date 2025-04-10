// models/shopkeeper.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopkeeperSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  printCosts: {
    blackAndWhite: {
      type: Number,
      required: true
    },
    color: {
      type: Number,
      required: true
    }
  },
  discountRules: [{
    discountPercentage: Number,
    minimumOrderAmount: Number
  }],
  shopHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema);

