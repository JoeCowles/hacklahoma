#!/usr/bin/env bash
# Unified Start Script for E2E Testing

# 1. Start Backend
echo "🚀 Starting Backend..."
cd backend
python3 -m pip install websockets fastapi uvicorn pydantic-settings httpx google-generativeai --break-system-packages
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
BACKEND_PID=$!
echo "Backend running on http://localhost:8000 (PID: $BACKEND_PID)"

# 2. Start Frontend
echo "🎨 Starting Frontend..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!
echo "Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "✨ SYSTEM READY ✨"
echo "1. Open http://localhost:3000 in your browser."
echo "2. Click 'Start Transcription'."
echo "3. Speak into your microphone."
echo "4. Watch the 'Key Concepts' sidebar update in real-time!"
echo ""
echo "Press Ctrl+C to stop both servers."

# Keep script running and handle cleanup
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Stopped servers.'; exit" INT TERM
wait
