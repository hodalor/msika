const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const notificationService = require('../services/notificationService');

// Get vendor orders with filtering and pagination
router.get('/vendor', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = { vendor: new mongoose.Types.ObjectId(req.user.id) };

    // Add filters if provided
    if (status) {
      query.status = status;
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get order details
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      vendor: req.user.id
    })
      .populate('customer', 'name email')
      .populate('items.product', 'name images')
      .populate('items.variant');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user.id },
      { status },
      { new: true }
    ).populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Notify customer of order status update
    notificationService.notifyOrderUpdate(order.customer._id, order._id, status);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const stats = await Order.aggregate([
      {
        $match: {
          vendor: new mongoose.Types.ObjectId(req.user.id),
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$totalAmount' },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // If no stats found, return default values
    const defaultStats = {
      totalOrders: 0,
      totalSales: 0,
      totalRevenue: 0,
      pendingOrders: 0
    };

    res.json(stats[0] || defaultStats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get recent orders
router.get('/recent', auth, async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      customer: req.user.id
    });
    await order.save();

    // Notify vendor of new order
    notificationService.notifyNewOrder(order.vendor, order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 