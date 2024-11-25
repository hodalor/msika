const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin exists
    const existingAdmin = await Admin.findOne({ email: 'admin@admin.com' });
    if (existingAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const superAdmin = new Admin({
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
      ]
    });

    await superAdmin.save();

    console.log('Super admin created successfully:', {
      email: 'admin@admin.com',
      password: 'admin123'
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin(); 