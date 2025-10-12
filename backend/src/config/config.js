/**
 * Application configuration
 * Centralized configuration management
 */

const path = require('path');

/**
 * Application configuration object
 */
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: '0.0.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // Data directory configuration
  data: {
    directory: process.env.NODE_ENV === 'production'
      ? '/data'
      : path.join(__dirname, '../../data')
  },

  // CORS configuration
  cors: {
    origins: [
      'http://localhost:4200',  // Development frontend
      'https://dashboard.example.com'  // Production frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
  },

  // Security configuration
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
};

module.exports = config;
