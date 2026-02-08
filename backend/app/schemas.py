from pydantic import BaseModel, Field


class TranscriptChunk(BaseModel):
    lecture_id: str = Field(..., description="Unique lecture session id")
    chunk_id: str = Field(..., description="Chunk id from the stream")
    text: str
    previous_context: str | None = None


class Concept(BaseModel):
    keyword: str
    stem_concept: bool = False
    source_chunk_id: str | None = None


class ConceptExtractionResponse(BaseModel):
    lecture_id: str
    new_concepts: list[Concept]


class VideoSearchRequest(BaseModel):
    query: str
    limit: int = 5


class VideoResult(BaseModel):
    title: str
    url: str
    channel: str | None = None
    published_at: str | None = None


class VideoSearchResponse(BaseModel):
    query: str
    results: list[VideoResult]


class AnimationRequest(BaseModel):
    concept: str
    lecture_id: str | None = None


class AnimationResponse(BaseModel):
    concept: str
    status: str
    asset_url: str | None = None
    code: str | None = None


class WalkthroughRequest(BaseModel):
    concept: str
    lecture_id: str | None = None


class WalkthroughResponse(BaseModel):
    concept: str
    status: str
    content: str | None = None


class CreditBalance(BaseModel):
    user_id: str
    balance: int


class CreditSpendRequest(BaseModel):
    user_id: str
    amount: int
    reason: str


class CreditSpendResponse(BaseModel):
    user_id: str
    balance: int


class ShareRequest(BaseModel):
    lecture_id: str
    owner_id: str
    title: str
    summary: str | None = None


class ShareResponse(BaseModel):
    lecture_id: str
    share_id: str
    status: str


class AuthRegisterRequest(BaseModel):
    email: str
    password: str
    display_name: str


class AuthRegisterResponse(BaseModel):
    user_id: str
    status: str


class AuthLoginRequest(BaseModel):
    email: str
    password: str


class AuthLoginResponse(BaseModel):
    user_id: str
    token: str


class OnboardingRequest(BaseModel):
    user_id: str
    major: str | None = None
    year: str | None = None
    interests: list[str] = []


class OnboardingResponse(BaseModel):
    user_id: str
    status: str
