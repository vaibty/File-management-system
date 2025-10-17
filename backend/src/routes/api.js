const healthRoutes = require('./health');
const fileRoutes = require('./files');

/**
 * API Routes Configuration for Fastify
 * Main router that registers all route modules
 */
async function setupApiRoutes(fastify, options) {
  const { dataDir } = options;

  // Initialize services and controllers
  const FileService = require('../services/fileService');
  const FileController = require('../controllers/FileController');
  const HealthController = require('../controllers/HealthController');

  const fileService = new FileService(dataDir);
  const fileController = new FileController(fileService);
  const healthController = new HealthController();

  // Register route modules with their dependencies
  await fastify.register(healthRoutes, { healthController });
  await fastify.register(fileRoutes, { fileController });
}

module.exports = setupApiRoutes;