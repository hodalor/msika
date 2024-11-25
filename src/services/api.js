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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
);

// Auth APIs - Remove /api prefix for auth routes
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  vendorRegister: (userData) => api.post('/auth/vendor/register', userData),
};

// Product APIs
export const productAPI = {
  createProduct: async (productData) => {
    try {
      console.log('Creating product with data:', productData);
      const response = await api.post('/api/products', productData);
      console.log('Product creation response:', response);
      return response;
    } catch (error) {
      console.error('Product creation error:', error);
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/api/products/${id}`, productData);
      return response;
    } catch (error) {
      console.error('Product update error:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/api/products/${id}`);
      return response;
    } catch (error) {
      console.error('Product deletion error:', error);
      throw error;
    }
  },

  getProducts: async () => {
    try {
      const response = await api.get('/api/products/vendor');
      return response;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  }
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