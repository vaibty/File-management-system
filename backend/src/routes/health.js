const {
  HealthResponse,
  SystemInfoResponse,
  ErrorResponse
} = require('../schemas');

/**
 * Health Routes - Health check and system monitoring endpoints
 * @param {Object} fastify - Fastify instance
 * @param {Object} options - Plugin options
 */
async function healthRoutes(fastify, options) {
  const { healthController } = options;

  // Health check endpoint
  fastify.get('/health', {
    schema: {
      description: 'Get API health status',
      tags: ['Health'],
      response: {
        200: HealthResponse,
        500: ErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const health = healthController.getHealth();
      return reply.send(health);
    } catch (error) {
      fastify.log.error('Health check error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error.message,
        statusCode: 500
      });
    }
  });

  // System information endpoint
  fastify.get('/system', {
    schema: {
      description: 'Get system information and status',
      tags: ['Health'],
      response: {
        200: SystemInfoResponse,
        500: ErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const systemInfo = healthController.getSystemInfo();
      return reply.send(systemInfo);
    } catch (error) {
      fastify.log.error('System info error:', error);
      return reply.status(500).send({
        error: 'Internal server error',
        message: error.message,
        statusCode: 500
      });
    }
  });
}

module.exports = healthRoutes;
