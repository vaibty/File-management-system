/**
 * Health Service - Handles health check and system information
 */
class HealthService {
  /**
   * Get health status
   */
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

module.exports = HealthService;
