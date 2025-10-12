#!/bin/bash

# Monitoring script for Test Report Dashboard
# Checks system health and logs metrics

LOG_FILE="/var/log/monitor.log"
API_URL="http://localhost:3001/api/health"

echo "$(date): Starting health check..." >> ${LOG_FILE}

# Check if API is responding
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL})

if [ ${HTTP_STATUS} -eq 200 ]; then
    echo "$(date): API health check PASSED" >> ${LOG_FILE}
else
    echo "$(date): API health check FAILED (HTTP ${HTTP_STATUS})" >> ${LOG_FILE}
fi

# Check disk usage
DISK_USAGE=$(df /data | tail -1 | awk '{print $5}' | sed 's/%//')
if [ ${DISK_USAGE} -gt 80 ]; then
    echo "$(date): WARNING: Disk usage is ${DISK_USAGE}%" >> ${LOG_FILE}
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ ${MEMORY_USAGE} -gt 80 ]; then
    echo "$(date): WARNING: Memory usage is ${MEMORY_USAGE}%" >> ${LOG_FILE}
fi

echo "$(date): Health check completed" >> ${LOG_FILE}
