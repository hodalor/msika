import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Rating,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product:', id);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch product');
        }

        console.log('Product data:', data);
        setProduct(data);
        setSelectedImage(data.images?.[0]);
        setError(null);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Error fetching product details');
        showNotification('Error fetching product details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, showNotification]);

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      addToCart(product, quantity, selectedVariant);
      showNotification('Product added to cart', 'success');
    } catch (error) {
      showNotification('Error adding product to cart', 'error');
    }
  };

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">
          Product not found
        </Alert>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={selectedImage || product.images?.[0] || '/placeholder-image.jpg'}
              alt={product.name}
              onError={(e) => {
                console.error('Image load error:', selectedImage);
                e.target.src = '/placeholder-image.jpg';
              }}
              sx={{ height: 400, objectFit: 'cover' }}
            />
          </Card>
          {/* Thumbnail Images */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {product.images?.map((image, index) => (
              <Card 
                key={index} 
                sx={{ 
                  width: 80, 
                  height: 80,
                  cursor: 'pointer',
                  border: selectedImage === image ? '2px solid primary.main' : 'none'
                }}
                onClick={() => setSelectedImage(image)}
              >
                <CardMedia
                  component="img"
                  image={image || '/placeholder-image.jpg'}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  onError={(e) => {
                    console.error('Thumbnail load error:', image);
                    e.target.src = '/placeholder-image.jpg';
                  }}
                  sx={{ height: '100%', objectFit: 'cover' }}
                />
              </Card>
            ))}
          </Box>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Product ID: {product.productId}
          </Typography>

          {/* Vendor Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StoreIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Sold by: {product.vendor?.storeName || 'Unknown Vendor'}
            </Typography>
          </Box>

          {/* Price */}
          <Typography variant="h5" color="primary" gutterBottom>
            ${selectedVariant?.price || product.price}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={product.averageRating || 0} readOnly precision={0.5} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({product.ratings?.length || 0} reviews)
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Description */}
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>

          {/* Variants */}
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

          {/* Quantity */}
          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={handleQuantityChange}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ mb: 2, width: 100 }}
          />

          {/* Stock Status */}
          <Box sx={{ mb: 2 }}>
            <Chip
              label={product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              color={product.stock > 0 ? 'success' : 'error'}
            />
          </Box>

          {/* Add to Cart Button */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<CartIcon />}
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