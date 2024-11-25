const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// Get all products with search, filter, and sort
router.get('/', async (req, res) => {
  try {
    const { search, category, sortBy, minPrice, maxPrice } = req.query;
    let query = { status: 'active' };

    // Search
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Create base query
    let productsQuery = Product.find(query).populate('vendor', 'name storeName');

    // Sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          productsQuery = productsQuery.sort({ price: 1 });
          break;
        case 'price-desc':
          productsQuery = productsQuery.sort({ price: -1 });
          break;
        case 'name-asc':
          productsQuery = productsQuery.sort({ name: 1 });
          break;
        case 'name-desc':
          productsQuery = productsQuery.sort({ name: -1 });
          break;
        case 'newest':
          productsQuery = productsQuery.sort({ createdAt: -1 });
          break;
        default:
          productsQuery = productsQuery.sort({ createdAt: -1 });
      }
    }

    const products = await productsQuery.exec();
    res.json(products);
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      status: 'active',
      stock: { $gt: 0 }
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('vendor', 'name storeName');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top deals
router.get('/top-deals', async (req, res) => {
  try {
    const deals = await Product.find({
      status: 'active',
      discount: { $gt: 0 }
    })
    .sort({ discount: -1 })
    .limit(4)
    .populate('vendor', 'name storeName');
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get flash sales
router.get('/flash-sales', async (req, res) => {
  try {
    const sales = await Product.find({
      status: 'active',
      'flashSale.isActive': true
    })
    .sort({ 'flashSale.endTime': 1 })
    .limit(4)
    .populate('vendor', 'name storeName');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor products
router.get('/vendor', auth, async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
router.post('/', auth, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      vendor: req.user.id
    });
    await product.save();
    
    // Emit real-time update
    req.io.emit('products/update', { action: 'create', product });
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Emit real-time update
    req.io.emit('products/update', { action: 'update', product });
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      vendor: req.user.id
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Emit real-time update
    req.io.emit('products/update', { action: 'delete', productId: req.params.id });
    
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 