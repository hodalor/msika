import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  ShoppingCart,
  AttachMoney,
  Store,
  Person,
  People,
  Settings,
  Security,
  Assessment,
  Category,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const vendorMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/vendor/dashboard' },
    { text: 'Products', icon: <Inventory />, path: '/vendor/products' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/vendor/orders' },
    { text: 'Financials', icon: <AttachMoney />, path: '/vendor/financials' },
    { text: 'Store Profile', icon: <Store />, path: '/vendor/profile' },
  ];

  const adminMenuItems = [
    // Overview Section
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Analytics', icon: <Assessment />, path: '/admin/analytics' },
    
    // User Management Section
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Vendors', icon: <Store />, path: '/admin/vendors' },
    { text: 'Roles & Permissions', icon: <Security />, path: '/admin/roles' },
    
    // Product Management
    { text: 'Products', icon: <Inventory />, path: '/admin/products' },
    { text: 'Categories', icon: <Category />, path: '/admin/categories' },
    
    // Order Management
    { text: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
    { text: 'Transactions', icon: <AttachMoney />, path: '/admin/transactions' },
    
    // System Settings
    { text: 'Settings', icon: <Settings />, path: '/admin/settings' },
    { text: 'Notifications', icon: <Notifications />, path: '/admin/notifications' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : vendorMenuItems;

  const renderMenuSection = (items, title) => (
    <>
      {title && (
        <Typography
          variant="overline"
          sx={{ px: 3, py: 1, display: 'block', color: 'text.secondary' }}
        >
          {title}
        </Typography>
      )}
      <List>
        {items.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
    </>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px', // Height of AppBar
          backgroundColor: 'background.default',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        {user?.role === 'admin' ? (
          <>
            {renderMenuSection(adminMenuItems.slice(0, 2), 'Overview')}
            {renderMenuSection(adminMenuItems.slice(2, 5), 'User Management')}
            {renderMenuSection(adminMenuItems.slice(5, 7), 'Product Management')}
            {renderMenuSection(adminMenuItems.slice(7, 9), 'Order Management')}
            {renderMenuSection(adminMenuItems.slice(9), 'System')}
          </>
        ) : (
          renderMenuSection(vendorMenuItems)
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar; 