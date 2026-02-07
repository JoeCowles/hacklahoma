#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/joecowles/Desktop/hacklahoma"
FRONTEND_DIR="$ROOT_DIR/frontend"

cd "$FRONTEND_DIR"

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi

if [ ! -d "node_modules" ]; then
  npm install
fi

npm run dev
