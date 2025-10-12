/**
 * Main server entry point
 * Uses simplified architecture
 */
const createApp = require('./src/app');
const FileService = require('./src/services/fileService');
const config = require('./src/config/config');

/**
 * Start the server
 */
const startServer = async () => {
  try {
    const dataDir = config.data.directory;
    const port = config.server.port;
    const host = '0.0.0.0';

    console.log(`Starting server with DATA_DIR: ${dataDir}`);
    console.log(`NODE_ENV: ${config.server.environment}`);

    // Initialize file system
    const fileService = new FileService(dataDir);
    await fileService.initialize();

    // Create and start the Fastify app
    const app = await createApp(dataDir);

    // Start the server
    await app.listen({ port, host });

    console.log(`Backend server running on port ${port}`);
    console.log(`Data directory: ${dataDir}`);
    console.log(`API endpoints available at: http://localhost:${port}/api`);
    console.log(`API documentation available at: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = startServer;