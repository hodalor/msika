const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');

// Get all vendors with search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'vendor' };

    if (search) {
      query = {
        ...query,
        $or: [
          { storeName: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const vendors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Add additional vendor stats
    const vendorsWithStats = await Promise.all(vendors.map(async (vendor) => {
      const totalProducts = await Product.countDocuments({ vendor: vendor._id });
      const totalReviews = await Product.aggregate([
        { $match: { vendor: vendor._id } },
        { $project: { ratingCount: { $size: "$ratings" } } },
        { $group: { _id: null, total: { $sum: "$ratingCount" } } }
      ]);

      const avgRating = await Product.aggregate([
        { $match: { vendor: vendor._id } },
        { $unwind: "$ratings" },
        { $group: { _id: null, avg: { $avg: "$ratings.rating" } } }
      ]);

      return {
        ...vendor.toObject(),
        totalProducts,
        totalReviews: totalReviews[0]?.total || 0,
        rating: avgRating[0]?.avg || 0
      };
    }));

    res.json(vendorsWithStats);
  } catch (err) {
    console.error('Vendor fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor profile
router.get('/profile', auth, async (req, res) => {
  try {
    const vendor = await User.findById(req.user.id).select('-password');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 