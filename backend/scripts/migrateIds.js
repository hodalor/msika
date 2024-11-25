const mongoose = require('mongoose');
const { generateUniqueId, PREFIXES } = require('../utils/idGenerator');
const Product = require('../models/Product');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
require('dotenv').config({ path: '../.env' });

const migrateIds = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Migrate products
    console.log('Migrating products...');
    const products = await Product.find({ productId: { $exists: false } });
    for (const product of products) {
      product.productId = await generateUniqueId(Product, PREFIXES.PRODUCT, 'productId');
      await product.save();
    }
    console.log(`Migrated ${products.length} products`);

    // Migrate users
    console.log('Migrating users...');
    const users = await User.find({ userId: { $exists: false } });
    for (const user of users) {
      user.userId = await generateUniqueId(User, PREFIXES.USER, 'userId');
      if (user.role === 'vendor' && !user.vendorId) {
        user.vendorId = await generateUniqueId(User, PREFIXES.VENDOR, 'vendorId');
      }
      await user.save();
    }
    console.log(`Migrated ${users.length} users`);

    // Migrate admins
    console.log('Migrating admins...');
    const admins = await Admin.find({ adminId: { $exists: false } });
    for (const admin of admins) {
      admin.adminId = await generateUniqueId(Admin, PREFIXES.ADMIN, 'adminId');
      await admin.save();
    }
    console.log(`Migrated ${admins.length} admins`);

    // Migrate orders
    console.log('Migrating orders...');
    const orders = await Order.find({ orderId: { $exists: false } });
    for (const order of orders) {
      order.orderId = await generateUniqueId(Order, PREFIXES.ORDER, 'orderId');
      await order.save();
    }
    console.log(`Migrated ${orders.length} orders`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateIds(); 