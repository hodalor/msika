const mongoose = require('mongoose');
const { generateUniqueId, PREFIXES } = require('../utils/idGenerator');

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String],
  thumbnail: String
});

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  subcategory: String,
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [String],
  thumbnail: String,
  featuredImage: String,
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  variants: [variantSchema],
  status: {
    type: String,
    enum: ['active', 'draft', 'outOfStock'],
    default: 'draft'
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewImages: [String],
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  tags: [String],
  specifications: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  flashSale: {
    isActive: {
      type: Boolean,
      default: false
    },
    startTime: Date,
    endTime: Date,
    discountPrice: Number,
    saleImage: String
  }
});

// Generate productId before saving
productSchema.pre('save', async function(next) {
  try {
    if (!this.productId) {
      this.productId = await generateUniqueId(this.constructor, PREFIXES.PRODUCT, 'productId');
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Product', productSchema); 