const {
  ListDirectoryQuery,
  ListDirectoryResponse,
  GetFileContentQuery,
  GetFileContentResponse,
  DownloadItemQuery,
  ErrorResponse
} = require('../schemas');

/**
 * File Routes - File system operations and management endpoints
 * @param {Object} fastify - Fastify instance
 * @param {Object} options - Plugin options
 */
async function fileRoutes(fastify, options) {
  const { fileController } = options;

  // List directory contents
  fastify.get('/list', {
    schema: {
      description: 'List files and directories in the specified path',
      tags: ['Files'],
      querystring: ListDirectoryQuery,
      response: {
        200: ListDirectoryResponse,
        400: ErrorResponse,
        500: ErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const { path: dirPath = '/' } = request.query;
      const items = await fileController.listDirectory(dirPath);
      return reply.send(items);
    } catch (error) {
      fastify.log.error('List directory error:', error);
      return reply.status(500).send({
        error: 'Failed to list directory',
        message: error.message,
        statusCode: 500
      });
    }
  });

  // Get file content
  fastify.get('/file', {
    schema: {
      description: 'Get content of a specific file',
      tags: ['Files'],
      querystring: GetFileContentQuery,
      response: {
        200: {
          type: 'string'
        },
        400: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const { path: filePath } = request.query;

      if (!filePath) {
        return reply.status(400).send({
          error: 'File path is required',
          statusCode: 400
        });
      }

      const fileData = await fileController.getFileContent(filePath);

      // Set content type to plain text and send just the content
      reply.type('text/plain');
      return reply.send(fileData.content);
    } catch (error) {
      fastify.log.error('Get file content error:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          error: 'File not found',
          message: error.message,
          statusCode: 404
        });
      }

      return reply.status(500).send({
        error: 'Failed to read file',
        message: error.message,
        statusCode: 500
      });
    }
  });

  // Download file or directory
  fastify.get('/download', {
    schema: {
      description: 'Download a file or directory as a zip archive',
      tags: ['Files'],
      querystring: DownloadItemQuery,
      response: {
        200: {
          description: 'File or directory download',
          content: {
            'application/octet-stream': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'application/zip': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        },
        400: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse
      }
    }
  }, async (request, reply) => {
    try {
      const { path: itemPath } = request.query;

      if (!itemPath) {
        return reply.status(400).send({
          error: 'Item path is required',
          statusCode: 400
        });
      }

      await fileController.downloadItem(itemPath, reply);
    } catch (error) {
      fastify.log.error('Download item error:', error);

      if (error.message.includes('not found')) {
        return reply.status(404).send({
          error: 'Item not found',
          message: error.message,
          statusCode: 404
        });
      }

      return reply.status(500).send({
        error: 'Failed to download item',
        message: error.message,
        statusCode: 500
      });
    }
  });
}

module.exports = fileRoutes;