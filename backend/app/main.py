from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import time
import asyncio

from .config import settings
from .services.gemini import GeminiClient
from .services.elevenlabs import ElevenLabsClient
from .services.youtube import YouTubeClient
from .services.pipeline import PipelineService
from .services.simulation import SimulationService
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
    CreateLectureRequest,
    Lecture,
    LectureListResponse,
    CreateClassRequest,
    Class,
    ClassListResponse,
)
from pymongo import MongoClient
from pathlib import Path

app = FastAPI(title="LearnStream API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)

# Database Initialization
if settings.mongo_connection_string:
    mongo_client = MongoClient(settings.mongo_connection_string)
    db = mongo_client.get_database("hacklahoma_db")
    
    # Ensure default user exists
    default_user = {
        "user_id": "student_default",
        "email": "student@example.com",
        "display_name": "Default Student",
        "credits": settings.credit_start_balance
    }
    
    # Upsert default user to ensure they exist
    try:
        db.users.update_one(
            {"user_id": "student_default"},
            {"$setOnInsert": default_user},
            upsert=True
        )
    except Exception as e:
        print(f"Failed to initialize default user: {e}")

else:
    print("WARNING: MongoDB connection string not found. Database features will fail.")
    mongo_client = None
    db = None


# Temporary in-memory stores for scaffold
CONCEPTS: dict[str, list[Concept]] = {}
CREDITS: dict[str, int] = {}
SHARES: dict[str, ShareResponse] = {}
USERS: dict[str, dict[str, str]] = {}
SESSIONS: dict[str, str] = {}

gemini_client = GeminiClient(settings.gemini_api_key or "", settings.gemini_model)
simulation_client = GeminiClient(settings.gemini_api_key or "", settings.gemini_simulation_model)
elevenlabs_client = ElevenLabsClient(settings.elevenlabs_api_key or "")
youtube_client = YouTubeClient()
simulation_service = SimulationService(simulation_client)
pipeline_service = PipelineService(gemini_client, youtube_client, simulation_service)

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

async def run_simulation_background(websocket: WebSocket, simulation_service: SimulationService, sim_request: dict, lecture_id: str, previous_context: str, text: str):
    try:
        print(f"DEBUG: Starting background simulation for {sim_request['concept']}")
        code = await simulation_service.generate_simulation(
            concept=sim_request["concept"],
            description=sim_request["description"],
            context=f"{previous_context}\n\nRecent Transcript: {text}"
        )
        
        # Send update to client
        if websocket.client_state.name == "CONNECTED":
            await websocket.send_json({
                "type": "pipeline_result",
                "lecture_id": lecture_id,
                "results": {
                    "concepts": [],
                    "videos": [],
                    "simulations": [{
                        **sim_request,
                        "status": "ready",
                        "code": code
                    }]
                }
            })
            print(f"DEBUG: Background simulation for {sim_request['concept']} completed and sent.")
    except Exception as e:
        print(f"Error in background simulation task: {e}")

@app.websocket("/ws/{client_id}")

async def websocket_endpoint(websocket: WebSocket, client_id: str):

    await websocket.accept()

    try:

        while True:

            data = await websocket.receive_text()

            try:

                message = json.loads(data)

                msg_type = message.get("type")

                

                if msg_type == "transcript_commit":

                    # Process the committed transcript

                    text = message.get("text", "")

                    previous_context = message.get("previous_context", "")

                    lecture_id = message.get("lecture_id", "default_lecture")

                    

                    if text:

                        # Get existing concepts for this lecture

                        existing_concepts_map = {c.keyword: c.id for c in CONCEPTS.get(lecture_id, [])}

                        

                        # Run the pipeline (now returns concepts immediately, simulations are pending)

                        result = await pipeline_service.process_chunk(text, previous_context, lecture_id, existing_concepts_map)

                        

                        # Send back the initial results

                        await websocket.send_json({

                            "type": "pipeline_result",

                            "lecture_id": lecture_id,

                            "results": result

                        })



                        # Handle background simulation generation

                        for sim in result.get("simulations", []):

                            if sim.get("status") == "pending":

                                asyncio.create_task(run_simulation_background(

                                    websocket, 

                                    simulation_service, 

                                    sim, 

                                    lecture_id, 

                                    previous_context, 

                                    text

                                ))

                        

                        # Also update local store if needed (e.g., CONCEPTS)

                        new_concepts_data = result.get("concepts", [])

                        if new_concepts_data:

                            new_concepts_objs = [

                                Concept(

                                    id=c["id"],

                                    keyword=c["keyword"], 

                                    definition=c.get("definition"),

                                    stem_concept=c["stem_concept"], 

                                    source_chunk_id=message.get("chunk_id")

                                ) 

                                for c in new_concepts_data

                            ]

                            CONCEPTS.setdefault(lecture_id, []).extend(new_concepts_objs)



            except json.JSONDecodeError:

                pass

            except Exception as e:

                print(f"Error processing message: {e}")

                await websocket.send_json({"type": "error", "message": str(e)})



    except WebSocketDisconnect:

        print(f"Client {client_id} disconnected")





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
            id=str((item or {}).get("id", f"concept_{payload.lecture_id}_{int(time.time()*1000)}_{len(new_concepts)}")),
            keyword=str(keyword),
            definition=str((item or {}).get("definition", "")),
            stem_concept=bool((item or {}).get("stem_concept", False)),
            source_chunk_id=payload.chunk_id,
        )
        new_concepts.append(concept)

    if not new_concepts:
        raise HTTPException(status_code=502, detail="Gemini returned no concepts")

    if db is not None:
        # Prepare documents for insertion
        concept_docs = [concept.model_dump() for concept in new_concepts]
        for doc in concept_docs:
            doc["lecture_id"] = payload.lecture_id
        db.concepts.insert_many(concept_docs)
    else:
        # Fallback to in-memory if DB is down (or just fail, but for now fallback is okay or just skip)
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
async def generate_animation(payload: AnimationRequest) -> AnimationResponse:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured")

    # For on-demand, we might not have full context, but we can pass what we have
    context = f"Manual request for animation on: {payload.concept}"
    
    try:
        code = await simulation_service.generate_simulation(
            concept=payload.concept,
            description=f"Interactive simulation of {payload.concept}",
            context=context
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Simulation error: {exc}") from exc

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


@app.post("/lectures/create", response_model=Lecture)
def create_lecture(payload: CreateLectureRequest) -> Lecture:
    # In a real app we'd validate against the authenticated user
    # For now, we trust the payload or check against our basic USERS dict
    if payload.student_id not in USERS:
        # Check in DB if not in memory
        if db is not None:
             if not db.users.find_one({"user_id": payload.student_id}):
                 raise HTTPException(status_code=404, detail="Student not found")
        else:
             raise HTTPException(status_code=404, detail="Student not found")

    import uuid
    lecture_id = f"lecture_{uuid.uuid4()}"
    
    new_lecture = {
        "id": lecture_id,
        "professor": payload.professor,
        "school": payload.school,
        "class_name": payload.class_name,
        "class_time": payload.class_time,
        "student_id": payload.student_id,
    }

    if db is not None:
        db.lectures.insert_one(new_lecture.copy())
    else:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    return Lecture(**new_lecture)


@app.get("/lectures", response_model=LectureListResponse)
def get_lectures() -> LectureListResponse:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    # In a real app, filtering by user_id would happen here
    lectures_cursor = db.lectures.find()
    # MongoDB returns _id, we need to map it or ignore it since we store "id" explicitly
    lectures = [Lecture(**l) for l in lectures_cursor]
    return LectureListResponse(lectures=lectures)


@app.post("/classes", response_model=Class)
def create_class(payload: CreateClassRequest) -> Class:
    import uuid
    class_id = f"class_{uuid.uuid4()}"
    
    new_class = {
        "id": class_id,
        "name": payload.name,
        "professor": payload.professor,
        "school": payload.school,
        "class_time": payload.class_time,
    }

    if db is not None:
        db.classes.insert_one(new_class.copy())
    else:
        # Fallback for dev without DB
        print("Warning: DB not available, class not persisted")
    
    return Class(**new_class)


@app.get("/classes", response_model=ClassListResponse)
def get_classes() -> ClassListResponse:
    if db is None:
         # Return empty list or error? Let's return empty list for cleaner UI if DB down
         return ClassListResponse(classes=[])
    
    classes_cursor = db.classes.find()
    classes = [Class(**c) for c in classes_cursor]
    return ClassListResponse(classes=classes)
