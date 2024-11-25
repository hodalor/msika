import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const socket = io(process.env.REACT_APP_API_URL);

export const useRealTimeData = (endpoint, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time updates
    socket.on(`${endpoint}/update`, (updatedData) => {
      setData(updatedData);
    });

    return () => {
      socket.off(`${endpoint}/update`);
    };
  }, [endpoint]);

  return { data, loading, error };
}; 