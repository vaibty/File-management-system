const express = require('express');
const cors = require('cors');
const setupApiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const config = require('./config/config');

/**
 * Create and configure Express application
 */
const createApp = (dataDir) => {
  const app = express();

  // Middleware
  app.use(cors(config.cors));
  app.use(express.json({ limit: config.security.maxFileSize }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Routes
  app.use('/api', setupApiRoutes(dataDir));

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'File Management API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        system: '/api/system',
        list: '/api/list',
        file: '/api/file',
        download: '/api/download'
      }
    });
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;