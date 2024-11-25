const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  slug: {
    type: String,
    required: true,
    unique: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  icon: String,         // Category icon image
  image: String,        // Category main image
  bannerImage: String,  // Category banner image
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema); 