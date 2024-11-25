const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { initSocket } = require('./services/socket');

dotenv.config();

const connectDB = require('./config/db');
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Connect to MongoDB
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch((err) => {
  console.error('Database connection error:', err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Add socket.io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/products'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: err.message 
  });
});

// Handle 404s
app.use((req, res) => {
  console.log('404 Not Found:', req.url);
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

module.exports = app; 