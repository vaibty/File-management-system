/**
 * HealthService - Handles health check and system information
 *
 * This service provides health monitoring capabilities including
 * basic health status and detailed system information.
 */
class HealthService {
  /**
   * Get health status of the application
   * @returns {Object} Health status object with timestamp, uptime, version, and environment
   */
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Get detailed system information
   * @returns {Object} System information including memory usage, platform, and runtime details
   */
  getSystemInfo() {
    const memUsage = process.memoryUsage();
    const memoryInfo = this._formatMemoryUsage(memUsage);

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: memoryInfo,
        uptime: Math.floor(process.uptime())
      }
    };
  }

  /**
   * Format memory usage information
   * @private
   * @param {Object} memUsage - Process memory usage object
   * @returns {Object} Formatted memory information
   */
  _formatMemoryUsage(memUsage) {
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;
    const usedMB = (usedMem / 1024 / 1024).toFixed(2);
    const totalMB = (totalMem / 1024 / 1024).toFixed(2);
    const percentage = parseFloat(((usedMem / totalMem) * 100).toFixed(2));

    return {
      used: `${usedMB} MB`,
      total: `${totalMB} MB`,
      percentage
    };
  }
}

module.exports = HealthService;
