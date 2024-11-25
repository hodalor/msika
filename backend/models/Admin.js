const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super_admin']
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_vendors',
      'manage_products',
      'manage_orders',
      'manage_categories',
      'manage_settings',
      'view_analytics',
      'manage_admins'
    ]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
adminSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add method to check permissions
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Add method to check if admin is super admin
adminSchema.methods.isSuperAdmin = function() {
  return this.role === 'super_admin';
};

module.exports = mongoose.model('Admin', adminSchema); 