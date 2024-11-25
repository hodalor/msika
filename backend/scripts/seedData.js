const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const bcrypt = require('bcrypt');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@admin.com',
      password: adminPassword,
      role: 'admin'
    });

    console.log('Admin user created:', {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Create users
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9PeOuv.RTnKxBi',
        role: 'admin'
      },
      {
        name: 'Vendor User',
        email: 'vendor@test.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9PeOuv.RTnKxBi',
        role: 'vendor',
        storeName: 'Tech Store',
        phoneNumber: '1234567890',
        address: '123 Vendor St'
      },
      {
        name: 'Regular User',
        email: 'user@test.com',
        password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9PeOuv.RTnKxBi',
        role: 'user'
      }
    ]);

    // Create products with real data
    const products = await Product.insertMany([
      {
        name: 'Samsung Galaxy A24',
        description: '6.5" Display, 128GB Storage, 4GB RAM',
        price: 1299.99,
        category: 'Electronics',
        vendor: users[1]._id,
        images: ['/images/products/samsung-a24.jpg'],
        stock: 50,
        status: 'active',
        variants: [
          {
            name: 'Black',
            sku: 'SAM-A24-BLK',
            price: 1299.99,
            stock: 30
          },
          {
            name: 'White',
            sku: 'SAM-A24-WHT',
            price: 1299.99,
            stock: 20
          }
        ]
      },
      {
        name: 'Nasco 43" Smart TV',
        description: 'Full HD LED Smart Android TV with Netflix',
        price: 1599.99,
        category: 'Electronics',
        vendor: users[1]._id,
        images: ['/images/products/nasco-tv.jpg'],
        stock: 30,
        status: 'active'
      },
      {
        name: 'Oraimo FreePods 3',
        description: 'Wireless Earbuds with Active Noise Cancellation',
        price: 89.99,
        category: 'Electronics',
        vendor: users[1]._id,
        images: ['/images/products/oraimo-pods.jpg'],
        stock: 100,
        status: 'active',
        variants: [
          {
            name: 'Black',
            sku: 'ORA-FP3-BLK',
            price: 89.99,
            stock: 50
          },
          {
            name: 'White',
            sku: 'ORA-FP3-WHT',
            price: 89.99,
            stock: 50
          }
        ]
      },
      {
        name: 'Binatone Blender',
        description: '1.5L Jar + Grinder, Multiple Speed Settings',
        price: 149.99,
        category: 'Home & Kitchen',
        vendor: users[1]._id,
        images: ['/images/products/binatone-blender.jpg'],
        stock: 45,
        status: 'active'
      }
    ]);

    // Create orders with real data
    await Order.insertMany([
      {
        orderNumber: 'ORD-001',
        customer: users[2]._id,
        vendor: users[1]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            price: products[0].price,
            variant: products[0].variants[0]
          }
        ],
        totalAmount: products[0].price,
        status: 'pending',
        shippingAddress: {
          street: '123 Main St',
          city: 'Accra',
          state: 'Greater Accra',
          zipCode: '00233',
          country: 'Ghana'
        },
        paymentStatus: 'paid'
      },
      {
        orderNumber: 'ORD-002',
        customer: users[2]._id,
        vendor: users[1]._id,
        items: [
          {
            product: products[2]._id,
            quantity: 2,
            price: products[2].price,
            variant: products[2].variants[0]
          }
        ],
        totalAmount: products[2].price * 2,
        status: 'completed',
        shippingAddress: {
          street: '456 High St',
          city: 'Kumasi',
          state: 'Ashanti',
          zipCode: '00234',
          country: 'Ghana'
        },
        paymentStatus: 'paid'
      }
    ]);

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 