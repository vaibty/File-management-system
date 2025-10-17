const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

/**
 * FileService - Handles all file system operations
 *
 * This service provides a clean interface for file system operations,
 * including directory listing, file reading, and archive creation.
 */
class FileService {
  /**
   * Creates a new FileService instance
   * @param {string} dataDir - Base directory for file operations
   */
  constructor(dataDir) {
    this.dataDir = dataDir;
  }

  /**
   * Initialize the file system with static files
   * @throws {Error} When initialization fails
   */
  async initialize() {
    try {
      await fs.ensureDir(this.dataDir);
      await this._copyStaticFiles();
      console.log('File system initialized successfully');
    } catch (error) {
      console.error('Error initializing file system:', error);
      throw error;
    }
  }

  /**
   * Copy static files from static-files directory to data directory
   * @private
   */
  async _copyStaticFiles() {
    const staticFilesPath = path.join(__dirname, '../../static-files');
    const staticFilesDest = path.join(this.dataDir, 'static-files');

    if (await fs.pathExists(staticFilesPath)) {
      await fs.copy(staticFilesPath, staticFilesDest);
      console.log('Static files copied to data directory');
    }
  }

  /**
   * List files and directories in a given path
   * @param {string} dirPath - Directory path to list (default: '/')
   * @returns {Promise<Array>} Sorted array of file/directory items
   * @throws {Error} When directory doesn't exist or listing fails
   */
  async listDirectory(dirPath = '/') {
    try {
      const fullPath = path.join(this.dataDir, dirPath);

      if (!await fs.pathExists(fullPath)) {
        throw new Error('Directory not found');
      }

      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
      }

      const items = await fs.readdir(fullPath);
      const result = await Promise.all(
        items.map(item => this._getItemInfo(fullPath, item, dirPath))
      );

      return this._sortItems(result);
    } catch (error) {
      throw new Error(`Failed to list directory: ${error.message}`);
    }
  }

  /**
   * Get information about a single item
   * @private
   * @param {string} fullPath - Full path to the parent directory
   * @param {string} item - Item name
   * @param {string} dirPath - Original directory path
   * @returns {Promise<Object>} Item information object
   */
  async _getItemInfo(fullPath, item, dirPath) {
    const itemPath = path.join(fullPath, item);
    const itemStats = await fs.stat(itemPath);

    return {
      name: item,
      path: path.join(dirPath, item).replace(/\\/g, '/'),
      isFolder: itemStats.isDirectory(),
      size: itemStats.size,
      modified: itemStats.mtime.toISOString()
    };
  }

  /**
   * Sort items with folders first, then alphabetically
   * @private
   * @param {Array} items - Array of items to sort
   * @returns {Array} Sorted array
   */
  _sortItems(items) {
    return items.sort((a, b) => {
      // Folders first, then files
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Get file content with metadata
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} File data with content, size, and modified date
   * @throws {Error} When file doesn't exist or cannot be read
   */
  async getFileContent(filePath) {
    try {
      const fullPath = path.join(this.dataDir, filePath);

      if (!await fs.pathExists(fullPath)) {
        throw new Error('File not found');
      }

      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        throw new Error('Path is a directory, not a file');
      }

      const content = await fs.readFile(fullPath, 'utf8');
      return {
        content,
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * Download file or directory as zip archive
   * @param {string} itemPath - Path to the item to download
   * @param {Object} reply - Fastify reply object for streaming response
   * @throws {Error} When item doesn't exist or download fails
   */
  async downloadItem(itemPath, reply) {
    try {
      const fullPath = path.join(this.dataDir, itemPath);

      if (!await fs.pathExists(fullPath)) {
        throw new Error('Item not found');
      }

      const stats = await fs.stat(fullPath);
      const itemName = path.basename(itemPath);

      // Set common headers for all downloads
      reply.header('Cache-Control', 'no-cache');
      reply.header('Pragma', 'no-cache');

      if (stats.isFile()) {
        await this._downloadFile(fullPath, itemName, reply);
      } else {
        await this._downloadDirectory(fullPath, itemName, reply);
      }
    } catch (error) {
      throw new Error(`Failed to download item: ${error.message}`);
    }
  }

  /**
   * Download a single file
   * @private
   * @param {string} fullPath - Full path to the file
   * @param {string} itemName - Name of the item
   * @param {Object} reply - Fastify reply object
   */
  async _downloadFile(fullPath, itemName, reply) {
    const ext = path.extname(itemName).toLowerCase();
    let contentType = 'application/octet-stream';

    // Set appropriate content type based on file extension
    const contentTypes = {
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.csv': 'text/csv',
      '.md': 'text/markdown',
      '.yaml': 'application/x-yaml',
      '.yml': 'application/x-yaml',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip'
    };

    if (contentTypes[ext]) {
      contentType = contentTypes[ext];
    }

    // Set headers on the raw response object
    reply.raw.setHeader('Content-Disposition', `attachment; filename="${itemName}"`);
    reply.raw.setHeader('Content-Type', contentType);
    reply.code(200);
    return reply.send(fs.createReadStream(fullPath));
  }

  /**
   * Download a directory as zip archive
   * @private
   * @param {string} fullPath - Full path to the directory
   * @param {string} itemName - Name of the item
   * @param {Object} reply - Fastify reply object
   */
  async _downloadDirectory(fullPath, itemName, reply) {
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Set headers on the raw response object
    reply.raw.setHeader('Content-Disposition', `attachment; filename="${itemName}.zip"`);
    reply.raw.setHeader('Content-Type', 'application/zip');
    reply.raw.setHeader('Content-Transfer-Encoding', 'binary');

    // Handle archive events
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      reply.code(500).send({ error: 'Failed to create archive' });
    });

    archive.on('end', () => {
      console.log('Archive finalized');
    });

    // Add directory to archive
    archive.directory(fullPath, itemName);

    // Set the response code and pipe archive to response
    reply.code(200);
    archive.pipe(reply.raw);
    await archive.finalize();
  }
}

module.exports = FileService;
