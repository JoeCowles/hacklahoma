#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$SCRIPT_DIR/.."
BACKEND_DIR="$ROOT_DIR/backend"

cd "$BACKEND_DIR"

uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
