# File Management System

A unified, user-friendly interface for browsing and interacting with files and directories. This full-stack application provides a file system browser-like experience for navigating through file structures, viewing file contents, and downloading files or directories as ZIP archives.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)
- [Design Rationale](#design-rationale)
- [AI Usage Policy](#ai-usage-policy)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

The File Management System addresses the challenge of accessing and managing files and directories through a web interface. This project provides an intuitive file browser experience, making it easy to navigate file structures, view file contents, and download files or entire directories as ZIP archives.

### Core Objectives

- **Centralized Access**: Provide a single interface for file and directory management
- **User-Friendly Navigation**: Implement intuitive file system browser functionality
- **Efficient Data Retrieval**: Enable quick access to files and directory contents
- **Download Capabilities**: Support downloading individual files or entire directories as ZIP archives
- **Responsive Design**: Ensure optimal experience across different devices

## Features

### Frontend Features
- **File System Browser**: Navigate through directories with breadcrumb navigation
- **Dual View Modes**: Switch between grid and list views for optimal data presentation
- **File Content Viewer**: View file contents in a modal with syntax highlighting
- **Search Functionality**: Search for files and folders within the current directory
- **Download Support**: Download individual files or entire directories as ZIP archives
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

### Backend Features
- **Fastify Framework**: High-performance web framework with built-in validation
- **TypeBox Validation**: JSON Schema validation for request/response data
- **Swagger/OpenAPI Documentation**: Interactive API documentation at `/api/docs`
- **Modular Architecture**: Separate route files for better organization
- **Static File System**: Creates sample data structure on startup
- **RESTful API**: Well-structured endpoints for all frontend operations
- **File Operations**: Support for listing, reading, and downloading files/directories
- **Error Handling**: Comprehensive error handling with custom error classes
- **Security**: Path validation to prevent directory traversal attacks
- **Health Monitoring**: Health check endpoints for service monitoring
- **Structured Logging**: Enhanced logging with Pino for better debugging

## Architecture

The application follows a microservices architecture with clear separation of concerns:

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Frontend      │◄──────────────►│   Backend       │
│   (Angular)     │                 │   (Node.js)     │
│   Port: 4200    │                 │   Port: 3001    │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Nginx         │                 │   File System   │
│   (Static Files)│                 │   (/data)       │
└─────────────────┘                 └─────────────────┘
```

### Component Architecture

**Frontend (Angular)**:
- `AppComponent`: Main application component with navigation and state management
- `FileItemComponent`: Reusable component for displaying files and folders
- `FileViewerComponent`: Modal component for viewing file contents
- Services: HTTP client for API communication

**Backend (Node.js/Fastify)**:
- Fastify server with built-in validation and serialization
- TypeBox schemas for request/response validation
- Modular route structure with separate route files per controller
- File system fabrication service
- API route handlers for file operations
- Archiver integration for ZIP creation
- Swagger/OpenAPI documentation generation
- Structured logging with Pino

## Technology Stack

### Frontend
- **Angular 17**: Modern, component-based framework
- **TypeScript**: Type-safe development
- **SCSS**: Enhanced CSS with variables and mixins
- **RxJS**: Reactive programming for HTTP requests
- **Nginx**: Web server for production deployment

### Backend
- **Node.js 18**: JavaScript runtime
- **Fastify**: High-performance web framework
- **TypeBox**: JSON Schema validation
- **@fastify/swagger**: OpenAPI documentation
- **@fastify/swagger-ui**: Interactive API documentation
- **@fastify/cors**: Cross-origin resource sharing
- **Pino**: Structured logging
- **Archiver**: ZIP file creation
- **fs-extra**: Enhanced file system operations

### DevOps & Deployment
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and static file serving
- **Health Checks**: Service monitoring

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- Git (for cloning the repository)
- curl (for testing, optional)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vaibty/File-management-system.git
   cd File-management-system
   ```

2. **Start the application**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

### Development Setup

For development with hot reloading:

1. **Backend Development**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run start
   ```

### Manual Installation

If you prefer to run without Docker:

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run build
   # Serve the dist folder with any web server
   ```

## API Documentation

### Interactive Documentation
Visit **http://localhost:3001/api/docs** for the complete interactive Swagger UI documentation with:
- Request/response examples
- Schema validation details
- Try-it-out functionality
- Automatic OpenAPI specification generation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### 1. List Directory Contents
**GET** `/list?path=<directory_path>`

Lists the contents of a specified directory.

**Parameters**:
- `path` (query, optional): Directory path (default: "/")

**Response**:
```json
[
  {
    "isFolder": true,
    "name": "static-files",
    "path": "/static-files",
    "size": 0,
    "modified": "2024-01-15T10:30:00.000Z"
  },
  {
    "isFolder": false,
    "name": "metrics.csv",
    "path": "/static-files/data/metrics.csv",
    "size": 1024,
    "modified": "2024-01-15T10:30:00.000Z"
  }
]
```

**Example**:
```bash
curl "http://localhost:3001/api/list?path=/static-files"
```

#### 2. Get File Content
**GET** `/file?path=<file_path>`

Retrieves the content of a specified file as plain text.

**Parameters**:
- `path` (query, required): File path

**Response**: Plain text content of the file

**Example**:
```bash
curl "http://localhost:3001/api/file?path=/static-files/data/metrics.csv"
```

#### 3. Download File or Directory
**GET** `/download?path=<item_path>`

Downloads a file or directory (as ZIP archive).

**Parameters**:
- `path` (query, required): File or directory path

**Response**:
- For files: File content with appropriate headers
- For directories: ZIP archive

**Example**:
```bash
# Download a file
curl -O "http://localhost:3001/api/download?path=/static-files/data/metrics.csv"

# Download a directory
curl -O "http://localhost:3001/api/download?path=/static-files"
```

#### 4. Health Check
**GET** `/health`

Returns the health status of the backend service.

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345,
  "version": "1.0.0",
  "environment": "development"
}
```

#### 5. System Information
**GET** `/system`

Returns detailed system information and status.

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "system": {
    "platform": "linux",
    "arch": "x64",
    "nodeVersion": "18.17.0",
    "memory": {
      "used": "45.2 MB",
      "total": "512 MB",
      "percentage": 8.8
    },
    "uptime": 12345
  }
}
```

### Error Responses

All endpoints return appropriate HTTP status codes and structured error messages:

```json
{
  "error": "Error description",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/file"
}
```

Common status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters or validation errors)
- `404`: Not Found (file/directory doesn't exist)
- `500`: Internal Server Error

### Validation

All API endpoints use TypeBox schemas for automatic request/response validation:
- **Request validation**: Query parameters and request body are automatically validated
- **Response validation**: Response data is validated against defined schemas
- **Error handling**: Validation errors return structured error responses
- **Type safety**: Full type safety with JSON Schema validation

## Usage Guide

### Navigation

1. **Breadcrumb Navigation**: Click on any part of the breadcrumb to navigate to that directory
2. **Folder Navigation**: Click on folder icons to enter directories
3. **Back Navigation**: Use breadcrumbs to navigate up the directory tree

### Viewing Files

1. **File Preview**: Click on any file to open it in the file viewer modal
2. **Content Display**: Text files are displayed with syntax highlighting
3. **Binary Files**: Non-text files show download information

### Downloading

1. **Single File**: Click the download button in list view or right-click on files
2. **Directory**: Right-click on folders to download as ZIP archives
3. **Bulk Download**: Use the download button in the file viewer modal

### Search

1. **Current Directory**: Use the search bar to filter files and folders
2. **Real-time Results**: Search results update as you type
3. **Clear Search**: Clear the search bar to show all items

### View Modes

1. **Grid View**: Icons with names below (default)
2. **List View**: Detailed view with file sizes and dates
3. **Toggle**: Use the view toggle button in the top-right corner

## Docker Deployment

### Production Deployment

1. **Build and Start**:
   ```bash
   docker-compose up --build -d
   ```

2. **Check Status**:
   ```bash
   docker-compose ps
   ```

3. **View Logs**:
   ```bash
   docker-compose logs -f
   ```

### Custom Configuration

Modify `docker-compose.yml` for custom settings:

```yaml
services:
  backend:
    ports:
      - "3001:3001"  # Change backend port
    environment:
      - NODE_ENV=production
      - PORT=3001

  frontend:
    ports:
      - "4200:80"    # Change frontend port
```

### Health Monitoring

Both services include health checks:

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check frontend health
curl http://localhost:4200
```

## Testing

### Automated Testing

Run the comprehensive test suite:

**Linux/macOS**:
```bash
./test_dashboard.sh
```

**Windows**:
```cmd
test_dashboard.bat
```

### Test Coverage

The test suite covers:

1. **Service Health Checks**: Verify both frontend and backend are running
2. **API Endpoint Tests**: Test all REST endpoints
3. **Download Tests**: Verify file and directory downloads
4. **Navigation Tests**: Test directory traversal
5. **Error Handling**: Test invalid paths and error responses
6. **Performance Tests**: Measure response times
7. **Data Integrity**: Verify fabricated file structure
8. **Frontend Integration**: Test UI functionality

### Manual Testing

1. **Start the application**:
   ```bash
   docker-compose up --build
   ```

2. **Test API endpoints**:
   ```bash
   # Test using the provided test script
   node backend/examples/api-test.js

   # Or test individual endpoints
   curl http://localhost:3001/api/health
   curl http://localhost:3001/api/system
   curl "http://localhost:3001/api/list?path=/"
   ```

3. **Test API documentation**:
   - Visit http://localhost:3001/api/docs
   - Try the interactive Swagger UI
   - Test endpoints directly from the documentation

4. **Test navigation**:
   - Navigate to different directories
   - Use breadcrumb navigation
   - Test search functionality

5. **Test file operations**:
   - View different file types
   - Download individual files
   - Download directories as ZIP

6. **Test responsive design**:
   - Resize browser window
   - Test on mobile devices
   - Switch between view modes

### Backend Architecture Testing

The new Fastify backend includes:

- **TypeBox Validation**: All requests are automatically validated
- **Error Handling**: Custom error classes for different error types
- **Logging**: Structured logging with request/response details
- **Documentation**: Auto-generated OpenAPI specification
- **Performance**: Enhanced performance with Fastify optimizations
- **Modular Routes**: Separate route files for each controller (health, files)

### Route Structure

The backend follows a modular route architecture:

```
backend/src/routes/
├── api.js          # Main API router
├── health.js       # Health check routes
├── files.js        # File system routes
└── README.md       # Route documentation
```

Each route file is organized by controller functionality, making the codebase more maintainable and scalable.

## Design Rationale

### Architectural Decisions

#### 1. Microservices Architecture
**Decision**: Separate frontend and backend services
**Rationale**:
- Enables independent scaling and deployment
- Facilitates technology-specific optimizations
- Improves maintainability and team collaboration
- Supports future service expansion

#### 2. Angular for Frontend
**Decision**: Use Angular 17 as the frontend framework
**Rationale**:
- Component-based architecture for reusability
- Strong TypeScript support for type safety
- Built-in dependency injection
- Excellent tooling and ecosystem
- Enterprise-grade framework suitable for complex applications

#### 3. Node.js/Fastify for Backend
**Decision**: Use Node.js with Fastify framework
**Rationale**:
- JavaScript ecosystem consistency
- ~2x performance improvement over Express
- Built-in JSON Schema validation with TypeBox
- Automatic OpenAPI/Swagger documentation generation
- Excellent file system handling capabilities
- Rich package ecosystem (archiver, fs-extra)
- Fast development and deployment
- Superior performance for I/O operations
- Structured logging with Pino

#### 4. Docker Containerization
**Decision**: Containerize both services
**Rationale**:
- Consistent deployment across environments
- Simplified dependency management
- Easy scaling and orchestration
- Isolation and security benefits
- Simplified CI/CD pipeline integration

### UI/UX Design Decisions

#### 1. File System Browser Interface
**Decision**: Mimic traditional file system browsers
**Rationale**:
- Familiar user experience
- Intuitive navigation patterns
- Clear visual hierarchy
- Efficient information display

#### 2. Dual View Modes
**Decision**: Implement both grid and list views
**Rationale**:
- Grid view: Quick visual scanning, mobile-friendly
- List view: Detailed information, desktop-optimized
- User preference accommodation
- Enhanced usability across devices

#### 3. Modal File Viewer
**Decision**: Use modal for file content display
**Rationale**:
- Non-disruptive content viewing
- Maintains navigation context
- Efficient screen space usage
- Professional application feel

#### 4. Responsive Design
**Decision**: Mobile-first responsive approach
**Rationale**:
- Accessibility across all devices
- Modern web standards compliance
- Improved user experience
- Future-proof design

### Technical Implementation Decisions

#### 1. Sample File System
**Decision**: Create sample data structure on startup
**Rationale**:
- Demonstrates real-world usage patterns
- Provides consistent sample environment
- Eliminates external dependencies
- Enables comprehensive testing

#### 2. RESTful API Design
**Decision**: Follow REST principles for API design
**Rationale**:
- Standard HTTP methods and status codes
- Predictable URL patterns
- Easy integration and testing
- Industry best practices

#### 3. Error Handling Strategy
**Decision**: Comprehensive error handling with meaningful messages
**Rationale**:
- Improved debugging experience
- Better user feedback
- Robust application behavior
- Professional error management

#### 4. Security Considerations
**Decision**: Implement path validation and security headers
**Rationale**:
- Prevent directory traversal attacks
- Secure file access patterns
- Professional security standards
- Production-ready implementation

#### 5. Fastify Migration Benefits
**Decision**: Migrate from Express to Fastify
**Rationale**:
- **Performance**: ~2x faster request/response handling
- **Validation**: Built-in JSON Schema validation with TypeBox
- **Documentation**: Automatic OpenAPI/Swagger documentation generation
- **Type Safety**: Full type safety with request/response validation
- **Logging**: Structured logging with Pino for better debugging
- **Error Handling**: Enhanced error handling with custom error classes
- **Modularity**: Better route organization with separate route files

## AI Usage Policy

### AI Tools Used

This project was developed with assistance from AI tools, specifically:

- **Claude (Anthropic)**: Primary AI assistant for code generation and architecture design
- **GitHub Copilot**: Code completion and suggestions during development

### AI-Assisted Development Areas

#### 1. Code Generation
**AI Contribution**: Generated boilerplate code for Angular components, Express routes, and Docker configurations
**Human Oversight**: All generated code was reviewed, modified, and customized to meet specific requirements

#### 2. Architecture Design
**AI Contribution**: Provided architectural recommendations and best practices
**Human Oversight**: Final architectural decisions were made based on project requirements and constraints

#### 3. Documentation
**AI Contribution**: Assisted in creating comprehensive documentation and README content
**Human Oversight**: All documentation was reviewed, fact-checked, and customized for the project

#### 4. Testing Strategy
**AI Contribution**: Helped design test scenarios and create test scripts
**Human Oversight**: Test cases were validated and expanded based on actual functionality

### Quality Assurance

- **Code Review**: All AI-generated code underwent thorough human review
- **Testing**: Comprehensive testing was performed to ensure functionality
- **Customization**: Generic AI suggestions were customized for specific project needs
- **Validation**: All implementations were validated against requirements

### Ethical Considerations

- **Transparency**: Full disclosure of AI tool usage
- **Attribution**: Proper acknowledgment of AI assistance
- **Quality**: Human oversight ensured high-quality deliverables
- **Learning**: AI tools were used as assistants, not replacements for human expertise

### Future Development

- **Continued Learning**: AI tools will continue to assist in future development
- **Best Practices**: Maintain high standards for AI-assisted development
- **Documentation**: Continue documenting AI usage in future contributions
- **Quality Control**: Maintain rigorous review processes for AI-generated content

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make changes**: Follow coding standards and add tests
4. **Test thoroughly**: Run the test suite and manual testing
5. **Commit changes**: Use descriptive commit messages
6. **Push to branch**: `git push origin feature/new-feature`
7. **Create Pull Request**: Provide detailed description of changes

### Coding Standards

- **TypeScript**: Use strict typing and follow Angular style guide
- **JavaScript**: Follow ESLint configuration and Node.js best practices
- **CSS/SCSS**: Use BEM methodology and maintain consistent naming
- **Documentation**: Update README and code comments for new features
- **Testing**: Add tests for new functionality

### Code Review Process

1. **Automated Checks**: All PRs must pass automated tests
2. **Peer Review**: At least one team member must review
3. **Testing**: Manual testing of new features
4. **Documentation**: Update relevant documentation
5. **Approval**: Maintainer approval required for merge

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- **Issues**: Create an issue in the repository
- **Documentation**: Check this README and inline code comments
- **Testing**: Run the test suite to verify functionality
- **Community**: Join discussions in the repository

---

**File Management System** - Simplifying file access and management for development teams.
