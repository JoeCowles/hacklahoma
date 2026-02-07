#!/usr/bin/env bash
set -euo pipefail

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# Set ROOT_DIR to the parent directory of the script
ROOT_DIR="$SCRIPT_DIR/.."

# Navigate to the project root
cd "$ROOT_DIR"

# Run the frontend service using docker-compose
# We use 'docker compose' (v2) if available, otherwise 'docker-compose' (v1)
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
  docker compose up --build frontend
elif command -v docker-compose &> /dev/null; then
  docker-compose up --build frontend
else
  echo "Error: Neither 'docker compose' nor 'docker-compose' found manually."
  exit 1
fi

cd $ROOT_DIR/frontend

npm install
npm start
