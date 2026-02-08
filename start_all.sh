#!/usr/bin/env bash
# Unified Start Script for LearnStream

# Get the root directory (where this script is located)
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup INT TERM

# 1. Start Backend
echo "🚀 Starting Backend with uv..."
cd "$ROOT_DIR/backend"
# uv run will automatically handle environment and dependencies from pyproject.toml
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend starting (PID: $BACKEND_PID)"

# 2. Start Frontend
echo "🎨 Starting Frontend..."
cd "$ROOT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
echo "Frontend starting (PID: $FRONTEND_PID)"

echo ""
echo "✨ SYSTEM READY ✨"
echo "1. Frontend: http://localhost:3000"
echo "2. Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers."

# Keep script running
wait
