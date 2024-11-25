import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  LocalShipping,
  Security,
  Payment,
  Star,
} from '@mui/icons-material';
import { useProducts } from '../hooks/useProducts';

const Home = () => {
  const { products: featuredProducts = [], loading: featuredLoading } = useProducts('/api/products/featured');
  const { products: flashSales = [], loading: flashLoading } = useProducts('/api/products/flash-sales');
  const { products: topDeals = [], loading: dealsLoading } = useProducts('/api/products/top-deals');

  console.log('Featured Products:', featuredProducts);
  console.log('Flash Sales:', flashSales);
  console.log('Top Deals:', topDeals);

  if (featuredLoading || flashLoading || dealsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container>
        {/* Hero Banner */}
        <Paper sx={{ position: 'relative', mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <img
            src="/banner-placeholder.jpg"
            alt="Hero Banner"
            style={{ width: '100%', height: 'auto' }}
          />
          <IconButton
            sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronRight />
          </IconButton>
        </Paper>

        {/* Featured Products */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Featured Products
        </Typography>
        {Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images?.[0] || '/placeholder-image.jpg'}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${product.price}
                    </Typography>
                    {product.discount > 0 && (
                      <Typography variant="caption" bgcolor="error.main" color="white" px={1}>
                        -{product.discount}%
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            No featured products available
          </Typography>
        )}

        {/* Flash Sales */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
              Flash Sales
            </Typography>
            <Typography variant="subtitle1" color="error">
              Ending in: 02:45:30
            </Typography>
          </Box>
          {Array.isArray(flashSales) && flashSales.length > 0 ? (
            <Grid container spacing={2}>
              {flashSales.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item._id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.images?.[0] || '/placeholder-image.jpg'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <CardContent>
                      <Typography variant="body2" noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${item.price}
                      </Typography>
                      {item.originalPrice && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                          ${item.originalPrice}
                        </Typography>
                      )}
                      {item.discount > 0 && (
                        <Typography variant="caption" bgcolor="error.main" color="white" px={1}>
                          -{item.discount}%
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
              No flash sales available
            </Typography>
          )}
        </Paper>

        {/* Features */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalShipping color="primary" />
              <Typography variant="subtitle2">Free Delivery</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Security color="primary" />
              <Typography variant="subtitle2">Secure Payment</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Payment color="primary" />
              <Typography variant="subtitle2">Multiple Payment Options</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Star color="primary" />
              <Typography variant="subtitle2">Best Quality Products</Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 