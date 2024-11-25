import React, { useState } from 'react';
import { Link as RouterLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Link,
  IconButton,
  Badge,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Cart from '../components/Cart';
import { useCart } from '../context/CartContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route is vendor or admin route
  const shouldShowSidebar = location.pathname.startsWith('/vendor') || location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            Multivendor Marketplace
          </Typography>
          
          <Button color="inherit" component={RouterLink} to="/products">
            Products
          </Button>
          <Button color="inherit" component={RouterLink} to="/vendors">
            Vendors
          </Button>
          
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Button color="inherit" component={RouterLink} to="/admin/dashboard">
                  Admin Dashboard
                </Button>
              ) : user.role === 'vendor' ? (
                <Button color="inherit" component={RouterLink} to="/vendor/dashboard">
                  Vendor Dashboard
                </Button>
              ) : null}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
          
          <IconButton 
            color="inherit" 
            onClick={() => setCartOpen(true)}
            sx={{ ml: 2 }}
          >
            <Badge badgeContent={cartItems.length} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {shouldShowSidebar && user && <Sidebar />}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: shouldShowSidebar ? '240px' : 0,
          width: shouldShowSidebar ? 'calc(100% - 240px)' : '100%',
        }}
      >
        <Outlet />
      </Box>

      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </Box>
  );
};

export default MainLayout; 