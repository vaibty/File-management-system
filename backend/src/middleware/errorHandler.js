/**
 * Error handling utilities for Fastify
 * Centralized error handling for the application
 */

/**
 * Custom error classes for better error handling
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

/**
 * Fastify error handler
 * @param {Error} error - Error object
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
const errorHandler = async (error, request, reply) => {
  // Log the error
  request.log.error(error);

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  }

  return reply.status(statusCode).send({
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: request.url
  });
};

/**
 * 404 handler for undefined routes
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
const notFoundHandler = async (request, reply) => {
  return reply.status(404).send({
    error: 'Route not found',
    message: `Route ${request.method}:${request.url} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
};
