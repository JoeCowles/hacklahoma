from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}


@app.post("/concepts/extract", response_model=ConceptExtractionResponse)
def extract_concepts(payload: TranscriptChunk) -> ConceptExtractionResponse:
    """
    Placeholder extractor. Replace with Gemini calls and your push_concept tool.
    """
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Transcript chunk is empty")

    # naive demo: split on sentences, pick first 2 words as concept
    words = payload.text.split()
    keyword = " ".join(words[:2]) if len(words) >= 2 else payload.text
    concept = Concept(keyword=keyword, stem_concept=True, source_chunk_id=payload.chunk_id)

    CONCEPTS.setdefault(payload.lecture_id, []).append(concept)
    return ConceptExtractionResponse(lecture_id=payload.lecture_id, new_concepts=[concept])


@app.post("/concepts/{lecture_id}/walkthrough", response_model=WalkthroughResponse)
def create_walkthrough(lecture_id: str, payload: WalkthroughRequest) -> WalkthroughResponse:
    return WalkthroughResponse(
        concept=payload.concept,
        status="queued",
        content=None,
    )


@app.post("/animations/generate", response_model=AnimationResponse)
def generate_animation(payload: AnimationRequest) -> AnimationResponse:
    return AnimationResponse(concept=payload.concept, status="queued", asset_url=None)


@app.post("/videos/search", response_model=VideoSearchResponse)
def search_videos(payload: VideoSearchRequest) -> VideoSearchResponse:
    # Placeholder. Replace with YouTube search via API or custom scraper.
    results = [
        VideoResult(
            title=f"{payload.query} overview",
            url="https://youtube.com",
            channel="Example",
            published_at=None,
        )
    ]
    return VideoSearchResponse(query=payload.query, results=results[: payload.limit])


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
