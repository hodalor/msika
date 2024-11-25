import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Box,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authAPI } from '../../services/api';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('Attempting login with:', values);
        const result = await authAPI.login(values);
        console.log('Login result:', result);
        
        if (result.success) {
          localStorage.setItem('token', result.token);
          showNotification('Login successful!', 'success');
          
          // Redirect based on user role
          if (result.user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (result.user?.role === 'vendor') {
            navigate('/vendor/dashboard');
          } else {
            navigate('/');
          }
        } else {
          showNotification(result.message || 'Invalid credentials', 'error');
        }
      } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'An error occurred during login', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            margin="normal"
            name="password"
            label="Password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            sx={{ mt: 3 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register">
                Register here
              </Link>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Want to become a vendor?{' '}
              <Link component={RouterLink} to="/vendor/register">
                Register as Vendor
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login; 