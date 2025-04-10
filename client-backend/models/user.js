// models/user.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  favoriteShops: [{
    type: Schema.Types.ObjectId,
    ref: 'Shopkeeper'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

