// models/shopkeeper.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

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
  },  active: {
    type: Boolean,
    default: true
  },
  priorityRate: {
    type: Number,
    required: true,
    default: 1.0,
    min: 1.0
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Method to check if password is valid
shopkeeperSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Pre-save hook to hash password before saving
shopkeeperSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Shopkeeper', shopkeeperSchema);

