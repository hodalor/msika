const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Hash the password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: [
        'manage_users',
        'manage_vendors',
        'manage_products',
        'manage_orders',
        'manage_categories',
        'manage_settings',
        'view_analytics',
        'manage_admins'
      ],
      status: 'active'
    });

    await admin.save();

    console.log('Admin created successfully!');
    console.log('Login credentials:');
    console.log('Email:', admin.email);
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin(); 