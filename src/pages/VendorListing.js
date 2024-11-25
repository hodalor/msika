import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Rating,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const VendorListing = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const queryParams = new URLSearchParams(
          searchTerm ? { search: searchTerm } : {}
        );
        
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/vendors?${queryParams}`
        );
        if (response.ok) {
          const data = await response.json();
          setVendors(data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [searchTerm]);

  const filteredVendors = vendors.filter(vendor =>
    vendor.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Our Vendors
        </Typography>
        <TextField
          fullWidth
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={3}>
          {filteredVendors.map((vendor) => (
            <Grid item xs={12} sm={6} md={4} key={vendor._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={vendor.logo || '/placeholder-store.jpg'}
                  alt={vendor.storeName}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StoreIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="h2">
                      {vendor.storeName}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {vendor.description || 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      {vendor.phoneNumber || 'No phone number'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      {vendor.address || 'No address available'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={vendor.rating || 0} readOnly precision={0.5} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({vendor.totalReviews || 0} reviews)
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={vendor.storeStatus || 'active'}
                      color={vendor.storeStatus === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={`${vendor.totalProducts || 0} products`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/vendors/${vendor._id}/products`)}
                  >
                    View Products
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredVendors.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No vendors found
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default VendorListing; 