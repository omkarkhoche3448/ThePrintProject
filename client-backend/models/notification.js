// models/notification.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Mixed } = Schema.Types;

const notificationSchema = new Schema({
  recipient: {
    type: String,
    enum: ['user', 'shopkeeper'],
    required: true
  },  recipientId: {
    type: Schema.Types.Mixed, // Changed from ObjectId to Mixed to support both ObjectId and String
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order_update', 'payment', 'system'],
    required: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['PrintJob', 'Transaction']
    },
    id: Schema.Types.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);