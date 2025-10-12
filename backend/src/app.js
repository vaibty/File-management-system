const fastify = require('fastify');
const setupApiRoutes = require('./routes/api');
const config = require('./config/config');

/**
 * Create and configure Fastify application
 */
const createApp = async (dataDir) => {
  const app = fastify({
    logger: {
      level: config.server.environment === 'production' ? 'info' : 'debug',
      transport: config.server.environment === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      } : undefined
    },
    bodyLimit: config.security.maxFileSize,
    trustProxy: true
  });

  // Register CORS plugin
  await app.register(require('@fastify/cors'), config.cors);

  // Register Swagger plugin for API documentation
  await app.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'File Management API',
        description: 'A comprehensive file management system API with health monitoring and file operations',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        }
      },
      servers: [
        {
          url: `http://localhost:${config.server.port}`,
          description: 'Development server'
        }
      ],
      tags: [
        {
          name: 'Health',
          description: 'Health check and system monitoring endpoints'
        },
        {
          name: 'Files',
          description: 'File system operations and management'
        },
        {
          name: 'API',
          description: 'API information and documentation'
        }
      ]
    }
  });

  // Register Swagger UI plugin
  await app.register(require('@fastify/swagger-ui'), {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  });

  // Request logging hook
  app.addHook('onRequest', async (request, reply) => {
    app.log.info(`${request.method} ${request.url}`);
  });

  // Error handling hook
  app.setErrorHandler(async (error, request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    return reply.status(statusCode).send({
      error: message,
      statusCode,
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler
  app.setNotFoundHandler(async (request, reply) => {
    return reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404
    });
  });

  // Register API routes with /api prefix
  await app.register(async function (fastify) {
    await setupApiRoutes(fastify, { dataDir });
  }, { prefix: '/api' });

  // Root endpoint
  app.get('/', {
    schema: {
      description: 'Root endpoint with API information',
      tags: ['API'],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            version: { type: 'string' },
            documentation: { type: 'string' },
            endpoints: {
              type: 'object',
              properties: {
                health: { type: 'string' },
                system: { type: 'string' },
                list: { type: 'string' },
                file: { type: 'string' },
                download: { type: 'string' },
                docs: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return reply.send({
      message: 'File Management API',
      version: '1.0.0',
      documentation: '/api/docs',
      endpoints: {
        health: '/api/health',
        system: '/api/system',
        list: '/api/list',
        file: '/api/file',
        download: '/api/download',
        docs: '/api/docs'
      }
    });
  });

  return app;
};

module.exports = createApp;