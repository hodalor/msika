const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { generateUniqueId, PREFIXES } = require('../utils/idGenerator');

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
          { category: { $regex: search, $options: 'i' } },
          { productId: { $regex: search, $options: 'i' } }
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
    let productsQuery = Product.find(query)
      .populate('vendor', 'name storeName')
      .sort(sortBy === 'price-asc' ? { price: 1 } : 
            sortBy === 'price-desc' ? { price: -1 } : 
            { createdAt: -1 });

    const products = await productsQuery.exec();
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      status: 'active',
      stock: { $gt: 0 }
    })
    .populate('vendor', 'name storeName')
    .sort({ createdAt: -1 })
    .limit(6);
    
    console.log(`Found ${products.length} featured products`);
    res.json(products);
  } catch (err) {
    console.error('Error fetching featured products:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
    console.error('Error fetching top deals:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get flash sales
router.get('/flash-sales', async (req, res) => {
  try {
    const sales = await Product.find({
      status: 'active',
      'flashSale.isActive': true,
      'flashSale.endTime': { $gt: new Date() }
    })
    .sort({ 'flashSale.endTime': 1 })
    .limit(4)
    .populate('vendor', 'name storeName');
    res.json(sales);
  } catch (err) {
    console.error('Error fetching flash sales:', err);
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
    console.log('Creating product with data:', req.body);
    console.log('User ID:', req.user.id);

    // Validate required fields
    const { name, description, price, category, stock } = req.body;
    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        requiredFields: ['name', 'description', 'price', 'category', 'stock']
      });
    }

    const product = new Product({
      ...req.body,
      vendor: new mongoose.Types.ObjectId(req.user.id),
      status: req.body.status || 'draft'
    });
    
    // Generate productId if not provided
    if (!product.productId) {
      product.productId = await generateUniqueId(Product, PREFIXES.PRODUCT, 'productId');
    }
    
    await product.save();
    console.log('Product created successfully:', product);
    
    // Populate vendor information
    await product.populate('vendor', 'name storeName');
    
    // Emit real-time update
    if (req.io) {
      req.io.emit('products/update', { action: 'create', product });
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error creating product', 
      error: err.message,
      details: err.errors 
    });
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

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name storeName')
      .populate('ratings.user', 'name');

    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product found:', product);
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 