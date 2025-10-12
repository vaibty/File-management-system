const HealthService = require('../services/healthService');

/**
 * HealthController - Handles health check and system status endpoints
 *
 * This controller provides health monitoring capabilities for the API,
 * including basic health checks and system information.
 */
class HealthController {
  /**
   * Creates a new HealthController instance
   */
  constructor() {
    this.healthService = new HealthService();
  }

  /**
   * Returns health status of the API server
   * @returns {Object} Health status object with timestamp and uptime
   */
  getHealth() {
    return this.healthService.getHealth();
  }

  /**
   * Returns system information and status
   * @returns {Object} System information including memory usage and platform details
   */
  getSystemInfo() {
    return this.healthService.getSystemInfo();
  }
}

module.exports = HealthController;