const { Type } = require('@sinclair/typebox');

/**
 * Common response schemas
 */
const ErrorResponse = Type.Object({
  error: Type.String(),
  message: Type.Optional(Type.String()),
  statusCode: Type.Number()
});

const SuccessResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String())
});

/**
 * Health check schemas
 */
const HealthResponse = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
  uptime: Type.Number(),
  version: Type.String(),
  environment: Type.String()
});

const SystemInfoResponse = Type.Object({
  status: Type.String(),
  timestamp: Type.String(),
  system: Type.Object({
    platform: Type.String(),
    arch: Type.String(),
    nodeVersion: Type.String(),
    memory: Type.Object({
      used: Type.String(),
      total: Type.String(),
      percentage: Type.Number()
    }),
    uptime: Type.Number()
  })
});

/**
 * File system schemas
 */
const FileItem = Type.Object({
  name: Type.String(),
  path: Type.String(),
  isFolder: Type.Boolean(),
  size: Type.Number(),
  modified: Type.String()
});

const ListDirectoryQuery = Type.Object({
  path: Type.Optional(Type.String({ default: '/' }))
});

const ListDirectoryResponse = Type.Array(FileItem);

const GetFileContentQuery = Type.Object({
  path: Type.String()
});

const GetFileContentResponse = Type.Object({
  content: Type.String(),
  size: Type.Number(),
  modified: Type.String()
});

const DownloadItemQuery = Type.Object({
  path: Type.String()
});

/**
 * API Info schema
 */
const ApiInfoResponse = Type.Object({
  message: Type.String(),
  version: Type.String(),
  endpoints: Type.Object({
    health: Type.String(),
    system: Type.String(),
    list: Type.String(),
    file: Type.String(),
    download: Type.String(),
    docs: Type.String()
  })
});

module.exports = {
  // Common
  ErrorResponse,
  SuccessResponse,

  // Health
  HealthResponse,
  SystemInfoResponse,

  // File system
  FileItem,
  ListDirectoryQuery,
  ListDirectoryResponse,
  GetFileContentQuery,
  GetFileContentResponse,
  DownloadItemQuery,

  // API Info
  ApiInfoResponse
};
