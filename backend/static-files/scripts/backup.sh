#!/bin/bash

# Backup script for Test Report Dashboard
# Creates a backup of the data directory

BACKUP_DIR="/backups"
DATA_DIR="/data"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.tar.gz"

echo "Starting backup process..."
echo "Backup file: ${BACKUP_FILE}"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Create the backup
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" -C "${DATA_DIR}" .

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: ${BACKUP_FILE}"
else
    echo "Backup failed!"
    exit 1
fi

# Clean up old backups (keep last 7 days)
find ${BACKUP_DIR} -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup process completed."
