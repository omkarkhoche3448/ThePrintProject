// models/transaction.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  shopkeeperId: {
    type: Schema.Types.ObjectId,
    ref: 'Shopkeeper'
  },
  printJobId: {
    type: Schema.Types.ObjectId,
    ref: 'PrintJob'
  },
  type: {
    type: String,
    enum: ['payment', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['razorpay', 'cash'],
      required: true
    },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    razorpaySignature: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    required: true
  },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);

