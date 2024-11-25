import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';

export const useProducts = (endpoint) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api${endpoint}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log(`Fetched products from ${endpoint}:`, data);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [endpoint]);

  return { products, loading, error };
}; 