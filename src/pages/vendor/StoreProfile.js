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
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import ImageUpload from '../../components/vendor/ImageUpload';

const validationSchema = Yup.object({
  storeName: Yup.string().required('Store name is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  address: Yup.string().required('Address is required'),
  description: Yup.string(),
});

const StoreProfile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const formik = useFormik({
    initialValues: {
      storeName: '',
      phoneNumber: '',
      address: '',
      description: '',
      logo: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/vendors/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          showNotification('Store profile updated successfully', 'success');
          setEditing(false);
        } else {
          const data = await response.json();
          showNotification(data.message || 'Failed to update profile', 'error');
        }
      } catch (error) {
        showNotification('Error updating profile', 'error');
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/vendors/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          formik.setValues({
            storeName: data.storeName || '',
            phoneNumber: data.phoneNumber || '',
            address: data.address || '',
            description: data.description || '',
            logo: data.logo || '',
          });
        }
      } catch (error) {
        showNotification('Error fetching profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Store Profile</Typography>
          <Button
            variant="contained"
            startIcon={editing ? null : <EditIcon />}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>

        {editing ? (
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ImageUpload
                  images={formik.values.logo ? [formik.values.logo] : []}
                  onChange={(newImages) => formik.setFieldValue('logo', newImages[0])}
                  maxImages={1}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="storeName"
                  label="Store Name"
                  value={formik.values.storeName}
                  onChange={formik.handleChange}
                  error={formik.touched.storeName && Boolean(formik.errors.storeName)}
                  helperText={formik.touched.storeName && formik.errors.storeName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="phoneNumber"
                  label="Phone Number"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                  helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Store Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={formik.values.logo}
                    alt={formik.values.storeName}
                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  >
                    <StoreIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    {formik.values.storeName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 2 }} />
                    <Typography>
                      {formik.values.phoneNumber || 'No phone number provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 2 }} />
                    <Typography>
                      {formik.values.address || 'No address provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 2, mt: 0.5 }} />
                    <Typography>
                      {formik.values.description || 'No description provided'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default StoreProfile; 