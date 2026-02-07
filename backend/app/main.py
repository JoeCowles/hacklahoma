from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .services.gemini import GeminiClient
from .services.elevenlabs import ElevenLabsClient
# from .services.google_search import search_youtube_via_google
from .schemas import (
    TranscriptChunk,
    Concept,
    ConceptExtractionResponse,
    VideoSearchRequest,
    VideoSearchResponse,
    VideoResult,
    AnimationRequest,
    AnimationResponse,
    WalkthroughRequest,
    WalkthroughResponse,
    CreditBalance,
    CreditSpendRequest,
    CreditSpendResponse,
    ShareRequest,
    ShareResponse,
    AuthRegisterRequest,
    AuthRegisterResponse,
    AuthLoginRequest,
    AuthLoginResponse,
    OnboardingRequest,
    OnboardingResponse,
)
from pathlib import Path

app = FastAPI(title="LearnStream API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)

# Temporary in-memory stores for scaffold
CONCEPTS: dict[str, list[Concept]] = {}
CREDITS: dict[str, int] = {}
SHARES: dict[str, ShareResponse] = {}
USERS: dict[str, dict[str, str]] = {}
SESSIONS: dict[str, str] = {}

gemini_client = GeminiClient(settings.gemini_api_key or "", settings.gemini_model)
elevenlabs_client = ElevenLabsClient(settings.elevenlabs_api_key or "")
# youtube_client = YouTubeClient() # Initialized later or on demand if needed, but here we likely want it global or dependency injected
from .services.youtube import YouTubeClient
youtube_client = YouTubeClient()

PROMPT_DIR = Path(__file__).parent / "prompts"
PROMPT_CACHE: dict[str, str] = {}


def load_prompt(name: str) -> str:
    if name in PROMPT_CACHE:
        return PROMPT_CACHE[name]
    path = PROMPT_DIR / f"{name}.md"
    text = path.read_text(encoding="utf-8")
    PROMPT_CACHE[name] = text
    return text


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}


@app.post("/concepts/extract", response_model=ConceptExtractionResponse)
def extract_concepts(payload: TranscriptChunk) -> ConceptExtractionResponse:
    """
    Gemini-backed concept extraction. Returns new concepts as JSON list.
    """
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Transcript chunk is empty")

    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured")

    prompt_template = load_prompt("concept_extraction")
    prompt = (
        prompt_template.replace("{{previous_context}}", payload.previous_context or "")
        .replace("{{transcript_chunk}}", payload.text)
    )

    try:
        data = gemini_client.generate_json(prompt)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Gemini error: {exc}") from exc

    raw_concepts = (data or {}).get("concepts", []) if isinstance(data, dict) else data
    new_concepts: list[Concept] = []
    for item in raw_concepts or []:
        keyword = (item or {}).get("keyword")
        if not keyword:
            continue
        concept = Concept(
            keyword=str(keyword),
            stem_concept=bool((item or {}).get("stem_concept", False)),
            source_chunk_id=payload.chunk_id,
        )
        new_concepts.append(concept)

    if not new_concepts:
        raise HTTPException(status_code=502, detail="Gemini returned no concepts")

    CONCEPTS.setdefault(payload.lecture_id, []).extend(new_concepts)
    return ConceptExtractionResponse(lecture_id=payload.lecture_id, new_concepts=new_concepts)


@app.post("/concepts/{lecture_id}/walkthrough", response_model=WalkthroughResponse)
def create_walkthrough(lecture_id: str, payload: WalkthroughRequest) -> WalkthroughResponse:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured")

    prompt = load_prompt("walkthrough").replace("{{concept}}", payload.concept)
    try:
        data = gemini_client.generate_json(prompt)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Gemini error: {exc}") from exc

    content = (data or {}).get("content") if isinstance(data, dict) else None
    if not content:
        raise HTTPException(status_code=502, detail="Gemini returned empty walkthrough")
    return WalkthroughResponse(concept=payload.concept, status="ready", content=content)


@app.post("/animations/generate", response_model=AnimationResponse)
def generate_animation(payload: AnimationRequest) -> AnimationResponse:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured")

    prompt = load_prompt("animation").replace("{{concept}}", payload.concept)
    try:
        data = gemini_client.generate_json(prompt)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Gemini error: {exc}") from exc

    code = (data or {}).get("code") if isinstance(data, dict) else None
    if not code:
        raise HTTPException(status_code=502, detail="Gemini returned empty code")
    return AnimationResponse(concept=payload.concept, status="ready", asset_url=None, code=code)


@app.post("/videos/search", response_model=VideoSearchResponse)
def search_videos(payload: VideoSearchRequest) -> VideoSearchResponse:
    try:
        items = youtube_client.search(payload.query, payload.limit)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Google search error: {exc}") from exc
    results = [VideoResult(**item) for item in items]
    return VideoSearchResponse(query=payload.query, results=results)


@app.get("/credits/{user_id}", response_model=CreditBalance)
def get_credits(user_id: str) -> CreditBalance:
    balance = CREDITS.setdefault(user_id, settings.credit_start_balance)
    return CreditBalance(user_id=user_id, balance=balance)


@app.post("/credits/spend", response_model=CreditSpendResponse)
def spend_credits(payload: CreditSpendRequest) -> CreditSpendResponse:
    balance = CREDITS.setdefault(payload.user_id, settings.credit_start_balance)
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if balance < payload.amount:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    balance -= payload.amount
    CREDITS[payload.user_id] = balance
    return CreditSpendResponse(user_id=payload.user_id, balance=balance)


@app.post("/shares", response_model=ShareResponse)
def share_transcript(payload: ShareRequest) -> ShareResponse:
    share_id = f"share_{payload.lecture_id}"
    response = ShareResponse(lecture_id=payload.lecture_id, share_id=share_id, status="active")
    SHARES[share_id] = response
    return response


@app.post("/auth/register", response_model=AuthRegisterResponse)
def register(payload: AuthRegisterRequest) -> AuthRegisterResponse:
    user_id = f"user_{len(USERS) + 1}"
    USERS[user_id] = {
        "email": payload.email,
        "display_name": payload.display_name,
    }
    CREDITS.setdefault(user_id, settings.credit_start_balance)
    return AuthRegisterResponse(user_id=user_id, status="registered")


@app.post("/auth/login", response_model=AuthLoginResponse)
def login(payload: AuthLoginRequest) -> AuthLoginResponse:
    # Placeholder auth: no password checks in scaffold
    user_id = next((uid for uid, info in USERS.items() if info["email"] == payload.email), None)
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    token = f"token_{user_id}"
    SESSIONS[token] = user_id
    return AuthLoginResponse(user_id=user_id, token=token)


@app.post("/users/onboarding", response_model=OnboardingResponse)
def onboarding(payload: OnboardingRequest) -> OnboardingResponse:
    if payload.user_id not in USERS:
        raise HTTPException(status_code=404, detail="User not found")
    return OnboardingResponse(user_id=payload.user_id, status="saved")
