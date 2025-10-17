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
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  itemName: { type: 'string' },
                  isDirectory: { type: 'boolean' },
                  size: { type: 'number' },
                  downloadUrl: { type: 'string' },
                  instructions: { type: 'string' }
                }
              }
            },
            'application/zip': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'application/octet-stream': {
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

      // Check if the request is from Swagger UI (accepts JSON)
      const acceptHeader = request.headers.accept || '';
      const isSwaggerRequest = acceptHeader.includes('application/json');

      if (isSwaggerRequest) {
        // For Swagger UI, return a JSON response with download information
        const fs = require('fs-extra');
        const path = require('path');
        const { dataDir } = options;
        const fullPath = path.join(dataDir, itemPath);

        if (!await fs.pathExists(fullPath)) {
          return reply.status(404).send({
            error: 'Item not found',
            message: `Path ${itemPath} does not exist`,
            statusCode: 404
          });
        }

        const stats = await fs.stat(fullPath);
        const itemName = path.basename(itemPath);

        return reply.send({
          message: 'Download available',
          itemName: itemName,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          downloadUrl: `/api/download?path=${encodeURIComponent(itemPath)}`,
          instructions: 'Use the downloadUrl to download the file/directory. For directories, it will be downloaded as a zip file.'
        });
      }

      // For regular requests, proceed with actual download
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
