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
  orderId: {
    type: String,
    required: true,
    default: () => `ORDER-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  shopkeeperId: {
    type: Schema.Types.ObjectId,
    ref: 'Shopkeeper',
    required: true
  },
  files: [{
    filename: String,
    originalName: String,
    contentType: String,
    size: Number,
    uploadDate: Date,
    fileId: Schema.Types.ObjectId,
    printConfig: {
      copies: {
        type: Number,
        default: 1,
        min: 1,
        max: 100
      },
      color_mode: {
        type: String,
        enum: ['monochrome', 'color'],
        required: true
      },
      paper_size: {
        type: String,
        default: 'A4'
      },
      orientation: {
        type: String,
        enum: ['portrait', 'landscape'],
        default: 'portrait'
      },
      duplex: {
        type: Boolean,
        default: false
      },
      page_ranges: {
        type: String,
        default: 'all'
      },
      pages_per_sheet: {
        type: Number,
        enum: [1, 2, 4, 6],
        default: 1
      },
      border: {
        type: String,
        enum: ['none', 'single'],
        default: 'none'
      },
      printer: {
        type: String,
        default: 'Virtual_PDF_Printer_1'
      },
      priority: {
        type: Number,
        default: 90
      }
    }
  }],
  jobConfig: {
    // Any common job configuration can go here
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

