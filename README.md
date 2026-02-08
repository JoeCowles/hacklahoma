# Hacklahoma Project

A modern video generation and search application built with Next.js and FastAPI.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, Lucide React
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI (Python)
- **AI/LLM**: Google Gemini API (`gemini-2.5-flash`)
  - Used for generating video scripts.
  - Used for retrieving relevant YouTube video links (replacing traditional scraping).
- **Voice Synthesis**: ElevenLabs API
- **Database**: (Planned) Vector DB

## Prerequisite

- Node.js 18+
- Python 3.10+
- Google Gemini API Key

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
environment=dev
gemini_api_key=YOUR_GEMINI_API_KEY
gemini_model=gemini-2.5-flash-lite
elevenlabs_api_key=YOUR_ELEVENLABS_KEY
elevenlabs_voice_id=YOUR_VOICE_ID
```

Start the server:
```bash
./scripts/start_backend.sh
# Server runs at http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

## Features

- **Video Search**: Generates relevant YouTube video links using Gemini AI matching.
- **Script Generation**: Creates educational scripts based on search queries.
- **Audio Generation**: Converts scripts to audio using ElevenLabs.

## Docker
- Build and run:
  - `cd /Users/joecowles/Desktop/hacklahoma`
  - `docker compose up --build`

Frontend: `http://localhost:3000`
## API Endpoints (stubbed)
- `POST /concepts/extract`
- `POST /concepts/{lecture_id}/walkthrough`
- `POST /animations/generate`
- `POST /videos/search`
- `GET /credits/{user_id}`
- `POST /credits/spend`
- `POST /shares`

Update these to wire Gemini, ElevenLabs, and your vector DB.
