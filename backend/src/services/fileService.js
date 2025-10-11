const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

/**
 * File Service - Handles all file system operations
 */
class FileService {
  constructor(dataDir) {
    this.dataDir = dataDir;
  }

  /**
   * Initialize the file system with static files
   */
  async initialize() {
    try {
      await fs.ensureDir(this.dataDir);
      await this.copyStaticFiles();
      console.log('File system initialized successfully');
    } catch (error) {
      console.error('Error initializing file system:', error);
      throw error;
    }
  }

  /**
   * Copy static files from static-files directory to data directory
   */
  async copyStaticFiles() {
    const staticFilesPath = path.join(__dirname, '../../static-files');
    const staticFilesDest = path.join(this.dataDir, 'static-files');

    if (await fs.pathExists(staticFilesPath)) {
      await fs.copy(staticFilesPath, staticFilesDest);
      console.log('Static files copied to data directory');
    }
  }

  /**
   * List files and directories in a given path
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
      const result = [];

      for (const item of items) {
        const itemPath = path.join(fullPath, item);
        const itemStats = await fs.stat(itemPath);

        result.push({
          name: item,
          path: path.join(dirPath, item).replace(/\\/g, '/'),
          isFolder: itemStats.isDirectory(),
          size: itemStats.size,
          modified: itemStats.mtime.toISOString()
        });
      }

      return result.sort((a, b) => {
        // Folders first, then files
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      throw new Error(`Failed to list directory: ${error.message}`);
    }
  }

  /**
   * Get file content
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
   * Download file or directory as zip
   */
  async downloadItem(itemPath, res) {
    try {
      const fullPath = path.join(this.dataDir, itemPath);

      if (!await fs.pathExists(fullPath)) {
        throw new Error('Item not found');
      }

      const stats = await fs.stat(fullPath);
      const itemName = path.basename(itemPath);

      if (stats.isFile()) {
        // Download single file
        res.setHeader('Content-Disposition', `attachment; filename="${itemName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        return fs.createReadStream(fullPath).pipe(res);
      } else {
        // Download directory as zip
        const archive = archiver('zip', { zlib: { level: 9 } });

        res.setHeader('Content-Disposition', `attachment; filename="${itemName}.zip"`);
        res.setHeader('Content-Type', 'application/zip');

        archive.pipe(res);
        archive.directory(fullPath, itemName);
        await archive.finalize();
      }
    } catch (error) {
      throw new Error(`Failed to download item: ${error.message}`);
    }
  }
}

module.exports = FileService;
