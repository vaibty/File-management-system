const createApp = require('./app');
const FileService = require('./services/fileService');
const config = require('./config/config');

/**
 * Start the server
 */
const startServer = async () => {
  try {
    const dataDir = config.data.directory;
    const port = config.server.port;

    console.log(`Starting server with DATA_DIR: ${dataDir}`);
    console.log(`NODE_ENV: ${config.server.environment}`);

    // Initialize file system
    const fileService = new FileService(dataDir);
    await fileService.initialize();

    // Create and start the app
    const app = createApp(dataDir);

    app.listen(port, '0.0.0.0', () => {
      console.log(`Backend server running on port ${port}`);
      console.log(`Data directory: ${dataDir}`);
      console.log(`API endpoints available at: http://localhost:${port}/api`);
    });
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