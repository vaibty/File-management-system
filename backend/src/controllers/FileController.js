const FileService = require('../services/fileService');

/**
 * FileController - Handles file system operations and API endpoints
 */
class FileController {
  constructor(fileService) {
    this.fileService = fileService;
  }

  /**
   * Lists files and directories in the specified path
   */
  async listDirectory(req, res) {
    try {
      const { path: dirPath = '/' } = req.query;
      const items = await this.fileService.listDirectory(dirPath);
      res.json(items);
    } catch (error) {
      console.error('Error listing directory:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Retrieves content of a specific file
   */
  async getFileContent(req, res) {
    try {
      const { path: filePath } = req.query;

      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }

      const fileData = await this.fileService.getFileContent(filePath);
      res.setHeader('Content-Type', 'text/plain');
      res.send(fileData.content);
    } catch (error) {
      console.error('Error getting file content:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Downloads a file or directory as a zip archive
   */
  async downloadItem(req, res) {
    try {
      const { path: itemPath } = req.query;

      if (!itemPath) {
        return res.status(400).json({ error: 'Item path is required' });
      }

      await this.fileService.downloadItem(itemPath, res);
    } catch (error) {
      console.error('Error downloading item:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = FileController;