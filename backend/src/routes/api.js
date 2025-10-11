const express = require('express');
const FileController = require('../controllers/FileController');
const HealthController = require('../controllers/HealthController');
const FileService = require('../services/fileService');

/**
 * API Routes Configuration
 */
const setupApiRoutes = (dataDir) => {
  const router = express.Router();

  // Initialize services and controllers
  const fileService = new FileService(dataDir);
  const fileController = new FileController(fileService);
  const healthController = new HealthController();

  // Health check routes
  router.get('/health', (req, res) => healthController.getHealth(req, res));
  router.get('/system', (req, res) => healthController.getSystemInfo(req, res));

  // File system routes
  router.get('/list', (req, res) => fileController.listDirectory(req, res));
  router.get('/file', (req, res) => fileController.getFileContent(req, res));
  router.get('/download', (req, res) => fileController.downloadItem(req, res));

  return router;
};

module.exports = setupApiRoutes;