#!/bin/bash
# Script to start the backend service using Docker

# Navigate to the project root directory
# Assuming the script is run from the project root or scripts directory
# This finds the directory of the script, then goes up one level to the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/.."

cd "$PROJECT_ROOT"

echo "Starting backend container..."
docker-compose up -d backend

echo "Backend service started."
echo "Logs can be viewed with: docker-compose logs -f backend"
