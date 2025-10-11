const HealthService = require('../services/healthService');

/**
 * HealthController - Handles health check and system status endpoints
 */
class HealthController {
  constructor() {
    this.healthService = new HealthService();
  }

  /**
   * Returns health status of the API server
   */
  getHealth(req, res) {
    const health = this.healthService.getHealth();
    res.json(health);
  }

  /**
   * Returns system information and status
   */
  getSystemInfo(req, res) {
    const systemInfo = this.healthService.getSystemInfo();
    res.json(systemInfo);
  }
}

module.exports = HealthController;