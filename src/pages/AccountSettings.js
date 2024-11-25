import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ImageUpload from '../components/vendor/ImageUpload';

const AccountSettings = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        console.log('User data received:', data);

        setUserData(prevData => ({
          ...prevData,
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          avatar: data.avatar || ''
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
        showNotification(error.message || 'Error fetching user data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating profile with data:', {
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        address: userData.address
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          address: userData.address
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      console.log('Profile update response:', data);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification(error.message || 'Error updating profile', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (userData.newPassword !== userData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: userData.currentPassword,
          newPassword: userData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      showNotification('Password updated successfully', 'success');
      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification(error.message || 'Error updating password', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profile Information
        </Typography>
        <form onSubmit={handleProfileUpdate}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                src={userData.avatar || '/placeholder-avatar.jpg'}
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
              />
              <ImageUpload
                images={userData.avatar ? [userData.avatar] : []}
                onChange={(urls) => setUserData(prev => ({ ...prev, avatar: urls[0] }))}
                maxImages={1}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Full Name"
                value={userData.name}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Email"
                value={userData.email}
                disabled
              />
              <TextField
                fullWidth
                margin="normal"
                name="phoneNumber"
                label="Phone Number"
                value={userData.phoneNumber}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                margin="normal"
                name="address"
                label="Address"
                value={userData.address}
                onChange={handleChange}
                multiline
                rows={3}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <form onSubmit={handlePasswordChange}>
          <TextField
            fullWidth
            margin="normal"
            name="currentPassword"
            label="Current Password"
            type="password"
            value={userData.currentPassword}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="newPassword"
            label="New Password"
            type="password"
            value={userData.newPassword}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={userData.confirmPassword}
            onChange={handleChange}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Change Password
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AccountSettings; 