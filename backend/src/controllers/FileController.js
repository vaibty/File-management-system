const FileService = require('../services/fileService');

/**
 * FileController - Handles file system operations and API endpoints
 *
 * This controller acts as a bridge between the HTTP layer and the file service,
 * providing clean separation of concerns and consistent error handling.
 */
class FileController {
  /**
   * Creates a new FileController instance
   * @param {FileService} fileService - The file service instance
   */
  constructor(fileService) {
    this.fileService = fileService;
  }

  /**
   * Lists files and directories in the specified path
   * @param {string} dirPath - Directory path to list (default: '/')
   * @returns {Promise<Array>} Array of file/directory items
   * @throws {Error} When directory listing fails
   */
  async listDirectory(dirPath = '/') {
    try {
      return await this.fileService.listDirectory(dirPath);
    } catch (error) {
      console.error('Error listing directory:', error);
      throw error;
    }
  }

  /**
   * Retrieves content of a specific file
   * @param {string} filePath - Path to the file
   * @returns {Promise<Object>} File data object with content, size, and modified date
   * @throws {Error} When file path is invalid or file cannot be read
   */
  async getFileContent(filePath) {
    if (!filePath) {
      throw new Error('File path is required');
    }

    try {
      return await this.fileService.getFileContent(filePath);
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  }

  /**
   * Downloads a file or directory as a zip archive
   * @param {string} itemPath - Path to the item to download
   * @param {Object} reply - Fastify reply object for streaming response
   * @throws {Error} When item path is invalid or download fails
   */
  async downloadItem(itemPath, reply) {
    if (!itemPath) {
      throw new Error('Item path is required');
    }

    try {
      await this.fileService.downloadItem(itemPath, reply);
    } catch (error) {
      console.error('Error downloading item:', error);
      throw error;
    }
  }
}

module.exports = FileController;