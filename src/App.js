import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import theme from './theme';
import { Box, CircularProgress } from '@mui/material';
import ProtectedRoute from './components/ProtectedRoute';
import Checkout from './pages/Checkout';

// Layout
import MainLayout from './layouts/MainLayout';

// Public Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import VendorListing from './pages/VendorListing';

// Vendor Pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProducts from './pages/vendor/Products';
import VendorOrders from './pages/vendor/Orders';
import VendorFinancials from './pages/vendor/Financials';
import StoreProfile from './pages/vendor/StoreProfile';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VendorRegister from './pages/auth/VendorRegister';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AccountSettings from './pages/AccountSettings';

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                <CssBaseline />
                <Router>
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Home />} />
                      <Route path="products" element={<ProductListing />} />
                      <Route path="products/:id" element={<ProductDetails />} />
                      <Route path="vendors" element={<VendorListing />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route path="vendor/register" element={<VendorRegister />} />
                      
                      {/* Protected Vendor Routes */}
                      <Route path="vendor/*" element={
                        <ProtectedRoute>
                          <Routes>
                            <Route path="dashboard" element={<VendorDashboard />} />
                            <Route path="products" element={<VendorProducts />} />
                            <Route path="orders" element={<VendorOrders />} />
                            <Route path="financials" element={<VendorFinancials />} />
                            <Route path="profile" element={<StoreProfile />} />
                          </Routes>
                        </ProtectedRoute>
                      } />
                      <Route path="/checkout" element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin Routes */}
                      <Route path="admin/*" element={
                        <ProtectedRoute>
                          <Routes>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagement />} />
                          </Routes>
                        </ProtectedRoute>
                      } />

                      {/* Account Settings Route */}
                      <Route path="account/settings" element={
                        <ProtectedRoute>
                          <AccountSettings />
                        </ProtectedRoute>
                      } />
                    </Route>
                  </Routes>
                </Router>
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App; 