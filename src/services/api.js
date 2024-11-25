import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Product APIs
export const productAPI = {
  getAllProducts: () => api.get('/products'),
  getVendorProducts: () => api.get('/products/vendor'),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Order APIs
export const orderAPI = {
  getVendorOrders: (params) => api.get('/orders/vendor', { params }),
  getOrderDetails: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getOrderStats: () => api.get('/orders/stats/overview'),
};

// Vendor APIs
export const vendorAPI = {
  getAllVendors: () => api.get('/vendors'),
  getProfile: () => api.get('/vendors/profile'),
};

export default api; 