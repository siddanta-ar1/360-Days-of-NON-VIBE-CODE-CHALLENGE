#!/bin/bash

# 1. CONFIGURATION
# Your direct PostgreSQL connection string (Found in Supabase -> Database -> Connection String)
DB_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
S3_BUCKET="s3://noteacher-db-backups-2026"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="/tmp/db_backups"
FILE_NAME="noteacher_backup_${TIMESTAMP}.sql.gz"

echo "Initiating Disaster Recovery Backup Sequence at ${TIMESTAMP}..."

# 2. CREATE TEMPORARY DIRECTORY
mkdir -p ${BACKUP_DIR}

# 3. THE DUMP & COMPRESS
# We pipe the raw SQL dump directly into the gzip compressor to save disk space
echo "Extracting and compressing PostgreSQL database..."
pg_dump --dbname=${DB_URL} --clean | gzip > ${BACKUP_DIR}/${FILE_NAME}

# 4. THE VAULT UPLOAD
# Move the compressed payload to the isolated AWS S3 bucket
echo "Uploading payload to AWS S3 Vault..."
aws s3 cp ${BACKUP_DIR}/${FILE_NAME} ${S3_BUCKET}/${FILE_NAME}

# 5. CLEANUP
# Delete the local file so we don't fill up the VPS hard drive
rm -rf ${BACKUP_DIR}

echo " Backup Complete and Secured in S3."