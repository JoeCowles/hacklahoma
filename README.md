# LearnStream Scaffold

This repo scaffolds the LearnStream platform with a Next.js frontend and a FastAPI backend.

## Services
- `frontend`: Next.js 14 app router UI
- `backend`: FastAPI API with stubbed endpoints for transcript ingestion, concept extraction, media generation, and credits

## Local Dev (no Docker)
1. Frontend:
   - `cd /Users/joecowles/Desktop/hacklahoma/frontend`
   - `npm install`
   - `npm run dev`
2. Backend:
   - `cd /Users/joecowles/Desktop/hacklahoma/backend`
   - `python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload`

## Docker
- Build and run:
  - `cd /Users/joecowles/Desktop/hacklahoma`
  - `docker compose up --build`

Frontend: `http://localhost:3000`
Backend: `http://localhost:8000`

## API Endpoints (stubbed)
- `POST /concepts/extract`
- `POST /concepts/{lecture_id}/walkthrough`
- `POST /animations/generate`
- `POST /videos/search`
- `GET /credits/{user_id}`
- `POST /credits/spend`
- `POST /shares`

Update these to wire Gemini, ElevenLabs, and your vector DB.
