const mongoose = require('mongoose');
const { generateUniqueId, PREFIXES } = require('../utils/idGenerator');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  vendorId: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'user'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  storeName: String,
  phoneNumber: String,
  address: String,
  description: String,
  logo: String,
  storeImages: [String],
  bannerImage: String,
  storeStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  shippingAddresses: [{
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    isDefault: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate userId/vendorId before saving
userSchema.pre('save', async function(next) {
  if (!this.userId) {
    this.userId = await generateUniqueId(this.constructor, PREFIXES.USER);
  }
  if (this.role === 'vendor' && !this.vendorId) {
    this.vendorId = await generateUniqueId(this.constructor, PREFIXES.VENDOR, 'vendorId');
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 