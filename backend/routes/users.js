const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user.id);
    
    let user = null;
    // First check if user is admin
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id).select('-password');
    } else {
      user = await User.findById(req.user.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User profile found:', user);
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    console.log('Updating profile for user:', req.user.id);
    console.log('Update data:', req.body);

    const { name, phoneNumber, address, avatar } = req.body;
    
    let user = null;
    // First check if user is admin
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    await user.save();
    console.log('Profile updated successfully');
    
    // Return updated user without password
    const updatedUser = user.toObject();
    delete updatedUser.password;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        role: req.user.role
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    console.log('Changing password for user:', req.user.id);
    
    const { currentPassword, newPassword } = req.body;
    
    let user = null;
    // First check if user is admin
    if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    console.log('Password changed successfully');
    
    res.json({ 
      success: true,
      message: 'Password updated successfully' 
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router; 