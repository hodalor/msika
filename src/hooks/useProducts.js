import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useProducts = (endpoint) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`);
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Listen for real-time updates
    socket.on('products/update', (update) => {
      if (update.action === 'create') {
        setProducts(prev => [...prev, update.product]);
      } else if (update.action === 'update') {
        setProducts(prev => prev.map(p => 
          p._id === update.product._id ? update.product : p
        ));
      } else if (update.action === 'delete') {
        setProducts(prev => prev.filter(p => p._id !== update.productId));
      }
    });

    return () => {
      socket.off('products/update');
    };
  }, [endpoint, socket]);

  return { products, loading, error };
}; 