# Test Report Dashboard

## Overview

The Test Report Dashboard is a comprehensive file management system designed to provide easy access to test logs, results, and related data from internal testing pipelines. This document outlines the system's capabilities, architecture, and usage patterns.

## System Architecture

### Frontend (Angular 17)
- **Location**: `frontend/`
- **Port**: 4200 (development), 80 (production)
- **Features**:
  - File system browser with breadcrumb navigation
  - Dual view modes (grid and list)
  - File content viewer with syntax highlighting
  - Search functionality
  - Download support for files and directories
  - Responsive design for all devices

### Backend (Node.js/Fastify)
- **Location**: `backend/`
- **Port**: 3001
- **Features**:
  - RESTful API with OpenAPI documentation
  - File system operations (list, read, download)
  - Directory compression for ZIP downloads
  - Health monitoring endpoints
  - Structured logging with Pino
  - TypeBox validation for all endpoints

## Key Features

### 1. File System Navigation
- **Breadcrumb Navigation**: Easy navigation through directory structures
- **Folder/File Distinction**: Clear visual indicators for different item types
- **Search Capability**: Real-time search within current directory
- **View Modes**: Switch between grid and list views

### 2. File Operations
- **Content Viewing**: View file contents in modal with syntax highlighting
- **File Downloads**: Download individual files directly
- **Directory Downloads**: Download entire directories as ZIP archives
- **Binary File Handling**: Proper handling of non-text files

### 3. API Endpoints

#### Core Endpoints
- `GET /api/health` - Service health check
- `GET /api/system` - System information
- `GET /api/list?path=<directory>` - List directory contents
- `GET /api/file?path=<file>` - Get file content
- `GET /api/download?path=<item>` - Download file or directory

#### Documentation
- `GET /api/docs` - Interactive Swagger UI documentation

### 4. Data Structure

The system creates a fabricated file structure on startup:

```
/data/
├── static-files/
│   ├── config.json
│   ├── data/
│   │   ├── metrics.csv
│   │   └── sample-data.json
│   ├── deployment.yaml
│   ├── docs/
│   │   ├── API.md
│   │   └── README.md
│   └── scripts/
│       ├── backup.sh
│       └── monitor.sh
```

## Usage Patterns

### 1. Development Workflow
```bash
# Start backend in development mode
cd backend
npm install
npm run dev

# Start frontend in development mode
cd frontend
npm install
npm run start
```

### 2. Production Deployment
```bash
# Using Docker Compose
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Testing
```bash
# Run automated tests (Linux/macOS)
./test_dashboard.sh

# Run automated tests (Windows)
test_dashboard.bat
```

## API Documentation

### Request/Response Examples

#### List Directory Contents
```bash
curl "http://localhost:3001/api/list?path=/static-files"
```

Response:
```json
[
  {
    "name": "data",
    "path": "/static-files/data",
    "isFolder": true,
    "size": 0,
    "modified": "2024-01-15T10:30:00.000Z"
  },
  {
    "name": "config.json",
    "path": "/static-files/config.json",
    "isFolder": false,
    "size": 1024,
    "modified": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Download File
```bash
curl -O "http://localhost:3001/api/download?path=/static-files/config.json"
```

#### Download Directory
```bash
curl -O "http://localhost:3001/api/download?path=/static-files"
# Downloads as static-files.zip
```

## Security Considerations

### Path Validation
- All file paths are validated to prevent directory traversal attacks
- Path sanitization ensures safe file access
- Error handling for invalid paths

### CORS Configuration
- Configured for development and production environments
- Secure headers for file downloads
- Proper content type handling

## Performance Optimizations

### Backend Optimizations
- Fastify framework for high performance
- Efficient file streaming for downloads
- Compressed responses where appropriate
- Structured logging for monitoring

### Frontend Optimizations
- OnPush change detection strategy
- Lazy loading for large directories
- Efficient search with debouncing
- Responsive design for all screen sizes

## Monitoring and Health Checks

### Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/system` - Detailed system information

### Health Check Response
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345,
  "version": "1.0.0",
  "environment": "development"
}
```

## Troubleshooting

### Common Issues

1. **Service Not Starting**
   - Check if ports 3001 and 4200 are available
   - Verify Docker is running (for containerized deployment)
   - Check logs: `docker-compose logs -f`

2. **File Download Issues**
   - Verify file paths are correct
   - Check file permissions
   - Ensure sufficient disk space

3. **API Connection Issues**
   - Verify backend is running on port 3001
   - Check CORS configuration
   - Verify network connectivity

### Debug Commands
```bash
# Check service health
curl http://localhost:3001/api/health

# Test file listing
curl "http://localhost:3001/api/list"

# Test file download
curl -I "http://localhost:3001/api/download?path=/static-files"
```

## Development Guidelines

### Code Standards
- TypeScript for frontend development
- ES6+ for backend development
- Consistent error handling
- Comprehensive logging

### Testing Requirements
- Unit tests for all components
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance testing for large files

### Documentation Standards
- Inline code comments
- API documentation with examples
- README files for each component
- Architecture decision records

## Future Enhancements

### Planned Features
- User authentication and authorization
- File upload capabilities
- Advanced search with filters
- File versioning
- Real-time notifications
- Bulk operations

### Scalability Considerations
- Horizontal scaling with load balancers
- Database integration for metadata
- Caching layer for frequently accessed files
- CDN integration for static assets

## Support and Maintenance

### Regular Maintenance
- Update dependencies regularly
- Monitor system performance
- Review and update security configurations
- Backup important data

### Support Channels
- GitHub Issues for bug reports
- Documentation for common questions
- Community discussions for feature requests

---

**Test Report Dashboard** - Simplifying test log access and analysis for development teams.
