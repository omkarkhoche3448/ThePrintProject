// models/printJob.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const printJobSchema = new Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    default: () => `JOB-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  },
  userId: {
    type: String, // Change from Schema.Types.ObjectId to String
    required: true
  },
  shopkeeperId: {
    type: Schema.Types.ObjectId,
    ref: 'Shopkeeper',
    required: true
  },
  file: {
    filename: String,
    originalName: String,
    contentType: String,
    size: Number,
    uploadDate: Date,
    fileId: Schema.Types.ObjectId
  },
  printConfig: {
    copies: {
      type: Number,
      default: 1
    },
    colorMode: {
      type: String,
      enum: ['blackAndWhite', 'color'],
      required: true
    },
    pageSize: {
      type: String,
      default: 'A4'
    },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'portrait'
    },
    duplexPrinting: {
      type: Boolean,
      default: false
    },
    pageRange: {
      type: String,
      default: 'all'
    },
    pagesPerSheet: {
      type: Number,
      default: 1
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },
  pricing: {
    baseCost: Number,
    discount: Number,
    taxAmount: Number,
    totalAmount: Number
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    method: {
      type: String,
      enum: ['online', 'cash']
    }
  },
  timeline: {
    created: {
      type: Date,
      default: Date.now
    },
    paid: Date,
    processing: Date,
    ready: Date,
    completed: Date,
    cancelled: Date
  },
  deliveryMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  },
  pickupCode: String,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('PrintJob', printJobSchema);

