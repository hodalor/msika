import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const steps = ['Shipping Address', 'Payment', 'Review Order'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { cartItems, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Group items by vendor
      const itemsByVendor = cartItems.reduce((acc, item) => {
        if (!acc[item.vendor]) {
          acc[item.vendor] = [];
        }
        acc[item.vendor].push(item);
        return acc;
      }, {});

      // Create an order for each vendor
      const orderPromises = Object.entries(itemsByVendor).map(([vendorId, items]) => {
        return fetch(`${process.env.REACT_APP_API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            items: items.map(item => ({
              product: item.productId,
              variant: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
            shippingAddress,
            vendor: vendorId,
            totalAmount: items.reduce((total, item) => total + (item.price * item.quantity), 0),
            paymentMethod: 'card', // You can make this dynamic
            shippingMethod: 'standard', // You can make this dynamic
            shippingCost: 10, // You can calculate this based on items and location
          }),
        });
      });

      await Promise.all(orderPromises);
      showNotification('Orders placed successfully!', 'success');
      clearCart();
      navigate('/orders');
    } catch (error) {
      showNotification('Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="street"
                label="Street Address"
                value={shippingAddress.street}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="city"
                label="City"
                value={shippingAddress.city}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="state"
                label="State"
                value={shippingAddress.state}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="zipCode"
                label="ZIP Code"
                value={shippingAddress.zipCode}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="country"
                label="Country"
                value={shippingAddress.country}
                onChange={handleAddressChange}
                required
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Typography>
            Payment integration will be implemented here
          </Typography>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {cartItems.map((item) => (
              <Box key={`${item.productId}-${item.variantId}`} sx={{ mb: 2 }}>
                <Typography>
                  {item.name} {item.variantName && `(${item.variantName})`}
                </Typography>
                <Typography color="text.secondary">
                  Quantity: {item.quantity} × ${item.price}
                </Typography>
              </Box>
            ))}
            <Typography variant="h6">
              Total: ${getTotal().toFixed(2)}
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => prev - 1)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (activeStep === steps.length - 1) {
                handlePlaceOrder();
              } else {
                setActiveStep((prev) => prev + 1);
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 
              activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Checkout; 