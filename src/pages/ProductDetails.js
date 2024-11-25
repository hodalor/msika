import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Card,
  CardMedia,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        showNotification('Error fetching product details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!product) {
    return <Typography>Product not found</Typography>;
  }

  return (
    <Container>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.images[0] || 'https://via.placeholder.com/400'}
              alt={product.name}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            ${selectedVariant?.price || product.price}
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>

          {product.variants?.length > 0 && (
            <TextField
              select
              fullWidth
              label="Select Variant"
              value={selectedVariant?._id || ''}
              onChange={(e) => {
                const variant = product.variants.find(v => v._id === e.target.value);
                setSelectedVariant(variant);
              }}
              sx={{ mb: 2 }}
            >
              {product.variants.map((variant) => (
                <MenuItem key={variant._id} value={variant._id}>
                  {variant.name} - ${variant.price}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddToCart}
            disabled={!product.stock}
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails; 