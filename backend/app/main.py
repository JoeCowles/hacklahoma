import asyncio
import json
import time
import uuid
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from pymongo import MongoClient

from .config import settings
from .schemas import (
    AnimationRequest,
    AnimationResponse,
    AuthLoginRequest,
    AuthLoginResponse,
    AuthRegisterRequest,
    AuthRegisterResponse,
    Class,
    ClassListResponse,
    Concept,
    ConceptExtractionResponse,
    CreateClassRequest,
    CreateLectureRequest,
    CreditBalance,
    CreditSpendRequest,
    CreditSpendResponse,
    Lecture,
    LectureDetailsResponse,
    LectureListResponse,
    LectureSearchResponse,
    OnboardingRequest,
    OnboardingResponse,
    ShareRequest,
    ShareResponse,
    TranscriptChunk,
    TranscriptItem,
    VideoResult,
    VideoSearchRequest,
    VideoSearchResponse,
    WalkthroughRequest,
    WalkthroughResponse,
    Flashcard,
    Question,
    Quiz,
)
from .services.auth import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from .services.elevenlabs import ElevenLabsClient
from .services.gemini import GeminiClient
from .services.pipeline import PipelineService
from .services.quiz import QuizService
from .services.simulation import SimulationService
from .services.youtube import YouTubeClient

app = FastAPI(title="Interactable API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
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

    # Ensure text indexes exist for search functionality
    try:
        if "text_text" not in db.transcripts.index_information():
            db.transcripts.create_index([("text", "text")], name="text_text")
            print("Created text index on 'transcripts.text'")
        if "keyword_text_definition_text" not in db.concepts.index_information():
            db.concepts.create_index([("keyword", "text"), ("definition", "text")], name="keyword_text_definition_text")
            print("Created text index on 'concepts.keyword' and 'concepts.definition'")
        if "name_text_professor_text" not in db.classes.index_information():
            db.classes.create_index([("name", "text"), ("professor", "text")], name="name_text_professor_text")
            print("Created text index on 'classes.name' and 'classes.professor'")
    except Exception as e:
        print(f"Failed to create text indexes: {e}")
else:
    print("WARNING: MongoDB connection string not found. Database features will fail.")
    mongo_client = None
    db = None


# Temporary in-memory stores for scaffold
CONCEPTS: dict[str, list[Concept]] = {}
QUIZZES: dict[str, list[dict]] = {}
CREDITS: dict[str, int] = {}
SHARES: dict[str, ShareResponse] = {}
USERS: dict[str, dict[str, str]] = {}
SESSIONS: dict[str, str] = {}

gemini_client = GeminiClient(settings.gemini_api_key or "", settings.gemini_model)
simulation_client = GeminiClient(settings.gemini_api_key or "", settings.gemini_sim_model)
quiz_client = GeminiClient(settings.gemini_api_key or "", settings.gemini_quiz_model)
elevenlabs_client = ElevenLabsClient(settings.elevenlabs_api_key or "")
youtube_client = YouTubeClient()
simulation_service = SimulationService(simulation_client)
quiz_service = QuizService(quiz_client)
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


# Auth Dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.users.find_one({"user_id": user_id})
    if user is None:
        raise credentials_exception
    return user


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}


@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "email": current_user["email"],
        "display_name": current_user.get("display_name"),
        "credits": current_user.get("credits", 0)
    }


@app.post("/auth/register", response_model=AuthRegisterResponse)
def register(payload: AuthRegisterRequest) -> AuthRegisterResponse:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Check if user already exists
    if db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = f"user_{uuid.uuid4()}"
    hashed_password = get_password_hash(payload.password)
    
    user_doc = {
        "user_id": user_id,
        "email": payload.email,
        "password": hashed_password,
        "display_name": payload.display_name,
        "credits": settings.credit_start_balance,
        "created_at": time.time()
    }
    
    db.users.insert_one(user_doc)
    return AuthRegisterResponse(user_id=user_id, status="registered")


@app.post("/auth/login", response_model=AuthLoginResponse)
def login(payload: AuthLoginRequest) -> AuthLoginResponse:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    user = db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(data={"sub": user["user_id"], "email": user["email"]})
    return AuthLoginResponse(user_id=user["user_id"], token=token)


async def run_simulation_background(websocket: WebSocket, simulation_service: SimulationService, sim_request: dict, lecture_id: str, previous_context: str, text: str):
    try:
        print(f"DEBUG: Starting background simulation for {sim_request['concept']}")
        code = await simulation_service.generate_simulation(
            concept=sim_request["concept"],
            description=sim_request["description"],
            context=f"{previous_context}\n\nRecent Transcript: {text}"
        )
        
        # Send update to client
        try:
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

            # Persist simulation
            if db is not None:
                sim_doc = {
                    "lecture_id": lecture_id,
                    "concept": sim_request["concept"],
                    "description": sim_request.get("description"),
                    "code": code,
                    "status": "ready",
                    "timestamp": time.time()
                }
                db.simulations.insert_one(sim_doc)
        except Exception as e:
            print(f"Could not send background simulation result (client likely disconnected): {e}")
    except Exception as e:
        print(f"Error in background simulation task: {e}")

async def run_quiz_background(websocket: WebSocket, quiz_service: QuizService, quiz_request: dict, lecture_id: str, previous_context: str, text: str):
    try:
        print(f"DEBUG: Starting background quiz generation for topic: {quiz_request['topic']}")
        quiz_data = await quiz_service.generate_quiz(
            topic=quiz_request["topic"],
            context=f"{previous_context}\n\nRecent Transcript: {text}"
        )
        
        questions = quiz_data.get("questions", [])
        
        # Send update to client
        try:
            await websocket.send_json({
                "type": "pipeline_result",
                "lecture_id": lecture_id,
                "results": {
                    "concepts": [],
                    "videos": [],
                    "simulations": [],
                    "quizzes": [{
                        **quiz_request,
                        "status": "ready",
                        "questions": questions
                    }]
                }
            })
            print(f"DEBUG: Background quiz for {quiz_request['topic']} completed and sent.")
        except Exception as e:
            print(f"Could not send background quiz result: {e}")
    except Exception as e:
        print(f"Error in background quiz task: {e}")

async def run_flashcard_background(websocket: WebSocket, quiz_service: QuizService, fc_request: dict, lecture_id: str, previous_context: str, text: str):
    try:
        concept = fc_request.get("concept") or fc_request.get("topic")
        print(f"DEBUG: Starting background flashcard generation for: {concept}")
        
        cards = await quiz_service.generate_flashcards(
            concept=concept,
            context=f"{previous_context}\n\nRecent Transcript: {text}",
            count=1
        )
        
        if cards:
            card = cards[0]
            # Send update to client
            try:
                await websocket.send_json({
                    "type": "pipeline_result",
                    "lecture_id": lecture_id,
                    "results": {
                        "concepts": [],
                        "videos": [],
                        "simulations": [],
                        "quizzes": [],
                        "flashcards": [{
                            **fc_request,
                            "status": "ready",
                            "front": card.get("front"),
                            "back": card.get("back")
                        }]
                    }
                })
                print(f"DEBUG: Background flashcard for {concept} completed and sent.")
            except Exception as e:
                print(f"Could not send background flashcard result: {e}")
    except Exception as e:
        print(f"Error in background flashcard task: {e}")

async def run_video_search_background(websocket: WebSocket, youtube_client: YouTubeClient, video_request: dict, lecture_id: str):
    try:
        query = video_request.get("query")
        if not query:
            return

        print(f"DEBUG: Starting background video search for: {query}")
        video_results = await asyncio.to_thread(youtube_client.search, query, limit=2)
        
        for v in video_results:
            v["context_concept"] = video_request.get("context_concept")
            v["context_concept_id"] = video_request.get("context_concept_id")

        if video_results:
             # Send update to client
            try:
                await websocket.send_json({
                    "type": "pipeline_result",
                    "lecture_id": lecture_id,
                    "results": {
                        "concepts": [],
                        "videos": video_results,
                        "simulations": [],
                        "quizzes": [],
                        "flashcards": []
                    }
                })
                print(f"DEBUG: Background video search for {query} completed and sent.")
                
                # Persist video results
                if db is not None:
                    video_docs = []
                    for v in video_results:
                        v_doc = v.copy()
                        v_doc["lecture_id"] = lecture_id
                        v_doc["timestamp"] = time.time()
                        video_docs.append(v_doc)
                    if video_docs:
                        db.videos.insert_many(video_docs)

            except Exception as e:
                print(f"Could not send background video search result: {e}")

    except Exception as e:
        print(f"Error in background video search task: {e}")

async def run_chunk_simulation_background(websocket: WebSocket, simulation_service: SimulationService, chunk_text: str, lecture_id: str, chunk_id: str, previous_context: str):
    # Send pending state immediately to UI
    try:
        await websocket.send_json({
            "type": "pipeline_result",
            "lecture_id": lecture_id,
            "results": {
                "concepts": [],
                "videos": [],
                "simulations": [{
                    "chunk_id": chunk_id,
                    "concept": "Analyzing...",
                    "concept_id": f"sim_chunk_{chunk_id}",
                    "status": "pending",
                    "description": "Identifying key concept for simulation..."
                }],
                "quizzes": [],
                "flashcards": []
            }
        })
    except Exception as e:
        print(f"Could not send initial pending status for chunk {chunk_id}: {e}")

    try:
        print(f"DEBUG: Starting background chunk simulation for chunk {chunk_id}.")
        result = await simulation_service.generate_simulation_from_chunk(
            chunk_text=chunk_text,
            context=previous_context
        )
        
        if result:
            print(f"DEBUG: Chunk simulation completed for concept: {result['concept']}")
            
            # Construct simulation object
            sim_obj = {
                "concept": result["concept"],
                "concept_id": f"sim_chunk_{chunk_id}", 
                "chunk_id": chunk_id,
                "description": result["description"],
                "code": result["code"],
                "status": "ready"
            }
            
            # Send to client
            try:
                await websocket.send_json({
                    "type": "pipeline_result",
                    "lecture_id": lecture_id,
                    "results": {
                        "concepts": [],
                        "videos": [],
                        "simulations": [sim_obj],
                        "quizzes": [],
                        "flashcards": []
                    }
                })

                # Persist
                if db is not None:
                    sim_doc = sim_obj.copy()
                    sim_doc["lecture_id"] = lecture_id
                    sim_doc["timestamp"] = time.time()
                    sim_doc["origin"] = "chunk_auto"
                    db.simulations.insert_one(sim_doc)

            except Exception as e:
                print(f"Could not send background chunk simulation result: {e}")
        else:
             print("DEBUG: Chunk simulation returned None (possibly no concept found)")

    except Exception as e:
        print(f"Error in background chunk simulation task: {e}")


async def process_transcript_message(websocket: WebSocket, message: dict):
    text = message.get("text", "")
    previous_context = message.get("previous_context", "")
    lecture_id = message.get("lecture_id", "default_lecture")
    chunk_id = message.get("chunk_id", f"chunk_{int(time.time()*1000)}")
    is_final = message.get("is_final", False)
    
    # Enhance context with last 4 chunks from DB for better simulation/pipeline decisions
    if db is not None and lecture_id:
        try:
            # Fetch last 4 transcripts (excluding the current one which isn't saved yet)
            last_4_cursor = db.transcripts.find(
                {"lecture_id": lecture_id},
                {"text": 1, "_id": 0}
            ).sort("timestamp", -1).limit(4)
            last_4 = list(last_4_cursor)
            if last_4:
                # Reverse to maintain chronological order in context string
                rich_context = "\n".join([t["text"] for t in reversed(last_4)])
                previous_context = rich_context
        except Exception as e:
            print(f"Error fetching rich context from DB: {e}")

    if text or is_final:
        # Trigger immediate chunk-based simulation (latency hiding)
        if text and not is_final:
             asyncio.create_task(run_chunk_simulation_background(
                websocket,
                simulation_service,
                text,
                lecture_id,
                chunk_id,
                previous_context
             ))

        # Get existing concepts for this lecture
        existing_concepts_map = {c.keyword: c.id for c in CONCEPTS.get(lecture_id, [])}
        
        # Run the pipeline (now returns concepts immediately, simulations are pending)
        result = await pipeline_service.process_chunk(text, previous_context, lecture_id, existing_concepts_map)
        
        # Logic: If this is the final commit, check if we have any quizzes.
        # If not, force one.
        if is_final:
            if not QUIZZES.get(lecture_id):
                print(f"DEBUG: Final commit received and no quizzes found for {lecture_id}. Forcing a summary quiz.")
                # Create a summary quiz request
                topic = "Lecture Summary"
                if CONCEPTS.get(lecture_id):
                    topic = f"Review of {', '.join([c.keyword for c in CONCEPTS[lecture_id][:3]])}"
                
                quiz_id = f"quiz_final_{int(time.time()*1000)}"
                forced_quiz = {
                    "id": quiz_id,
                    "topic": topic,
                    "status": "pending",
                    "questions": []
                }
                result.setdefault("quizzes", []).append(forced_quiz)

        # Send back the initial results
        try:
            await websocket.send_json({
                "type": "pipeline_result",
                "lecture_id": lecture_id,
                "results": {
                    "concepts": result.get("concepts", []),
                    "videos": [], # Video requests handled separately
                    "simulations": result.get("simulations", []),
                    "quizzes": result.get("quizzes", []),
                    "flashcards": result.get("flashcards", [])
                }
            })
        except Exception as e:
            print(f"Error sending initial pipeline results: {e}")
            return

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
        
        # Handle background quiz generation
        for quiz in result.get("quizzes", []):
            if quiz.get("status") == "pending":
                QUIZZES.setdefault(lecture_id, []).append(quiz)
                asyncio.create_task(run_quiz_background(
                    websocket,
                    quiz_service,
                    quiz,
                    lecture_id,
                    previous_context,
                    text
                ))
        
        # Handle background flashcard generation
        for fc in result.get("flashcards", []):
            if fc.get("status") == "pending":
                asyncio.create_task(run_flashcard_background(
                    websocket,
                    quiz_service,
                    fc,
                    lecture_id,
                    previous_context,
                    text
                ))

        # Handle background video search
        for vr in result.get("video_requests", []):
            asyncio.create_task(run_video_search_background(
                websocket,
                youtube_client,
                vr,
                lecture_id
            ))
        
        # Also update local store if needed (e.g., CONCEPTS)
        # Persist transcripts
        if db is not None:
            # Deduplication check: see if chunk_id already exists for this lecture
            existing_transcript = db.transcripts.find_one({"lecture_id": lecture_id, "chunk_id": message.get("chunk_id")})
            if existing_transcript:
                print(f"DEBUG: Skipping duplicate transcript chunk persistence: {message.get('chunk_id')}")
            else:
                transcript_doc = {
                    "lecture_id": lecture_id,
                    "chunk_id": message.get("chunk_id"), # Use message.get("chunk_id")
                    "text": text, # Use the 'text' variable already defined
                    "time": time.strftime("%H:%M:%S"), # Approximate server time, ideally client sends it
                    "type": "committed",
                    "timestamp": time.time()
                }
                db.transcripts.insert_one(transcript_doc)

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
        
            # Persist concepts
            if db is not None:
                concept_docs = []
                for c in new_concepts_data:
                    c_doc = c.copy()
                    c_doc["lecture_id"] = lecture_id
                    c_doc["timestamp"] = time.time()
                    concept_docs.append(c_doc)
                if concept_docs:
                    db.concepts.insert_many(concept_docs)
        
        # Persist simulation requests (pending state)
        new_sims = result.get("simulations", [])
        if new_sims and db is not None:
            sim_docs = []
            for s in new_sims:
                s_doc = s.copy()
                s_doc["lecture_id"] = lecture_id
                s_doc["status"] = "pending" # Initial state
                s_doc["timestamp"] = time.time()
                sim_docs.append(s_doc)
            if sim_docs:
                db.simulations.insert_many(sim_docs)


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    # Check for token in query params
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001) # Unauthorized
        return

    try:
        # Validate token
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001)
            return
    except Exception:
        await websocket.close(code=4001)
        return

    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                
                if msg_type == "transcript_commit":
                    # Process the committed transcript in background
                    asyncio.create_task(process_transcript_message(websocket, message))

            except json.JSONDecodeError:
                pass
            except Exception as e:
                print(f"Error processing message: {e}")
                # Only try to send error if we're not dealing with a disconnect
                try:
                    await websocket.send_json({"type": "error", "message": str(e)})
                except Exception:
                    pass

    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
    except Exception as e:
        print(f"WebSocket session error: {e}")


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
        # Fallback to in-memory if DB is down
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

    # For on-demand, we might not have full context
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


@app.post("/users/onboarding", response_model=OnboardingResponse)
def onboarding(payload: OnboardingRequest) -> OnboardingResponse:
    # This might need updating to use DB if needed, but for now it's just a placeholder
    return OnboardingResponse(user_id=payload.user_id, status="saved")


@app.post("/lectures/create", response_model=Lecture)
def create_lecture(payload: CreateLectureRequest) -> Lecture:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    lecture_id = f"lecture_{uuid.uuid4()}"
    
    new_lecture = {
        "id": lecture_id,
        "class_id": payload.class_id,
        "date": payload.date,
        "student_id": payload.student_id,
    }

    # Validate class exists
    class_doc = db.classes.find_one({"id": payload.class_id})
    if not class_doc:
        raise HTTPException(status_code=404, detail="Class not found")
    
    db.lectures.insert_one(new_lecture.copy())
    
    return Lecture(
        **new_lecture,
        class_name=class_doc["name"],
        professor=class_doc["professor"],
        school=class_doc["school"],
        class_time=class_doc["class_time"]
    )


@app.get("/lectures", response_model=LectureListResponse)
def get_lectures() -> LectureListResponse:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    classes_cursor = db.classes.find()
    classes_map = {c["id"]: c for c in classes_cursor}

    lectures_cursor = db.lectures.find()
    
    lectures = []
    for l in lectures_cursor:
        class_id = l.get("class_id")
        class_info = classes_map.get(class_id, {})
        
        lectures.append(Lecture(
            id=l["id"],
            class_id=l.get("class_id", ""),
            date=l.get("date", ""),
            student_id=l.get("student_id", ""),
            class_name=class_info.get("name"),
            professor=class_info.get("professor"),
            school=class_info.get("school"),
            class_time=class_info.get("class_time")
        ))
        
    return LectureListResponse(lectures=lectures)


@app.get("/lectures/search", response_model=LectureSearchResponse)
def search_lectures(query: str = Query("", min_length=1)) -> LectureSearchResponse:
    """
    Search lectures by simple word matching in:
    - Title (class name)
    - First transcript chunk (lecture transcription)
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    words = [w.strip() for w in query.split() if w.strip()]
    if not words:
        return LectureSearchResponse(results=[])

    found_lecture_ids: set[str] = set()

    # 1. Title: match words in class name (classes.name)
    and_name_regex = [{"name": {"$regex": w, "$options": "i"}} for w in words]
    class_matches = db.classes.find({"$and": and_name_regex}, {"id": 1})
    for class_match in class_matches:
        class_id = class_match["id"]
        for l in db.lectures.find({"class_id": class_id}, {"id": 1}):
            found_lecture_ids.add(l["id"])

    # 2. First transcript chunk: get first transcript per lecture, then word-match on its text
    and_text_regex = [{"first_text": {"$regex": w, "$options": "i"}} for w in words]
    pipeline = [
        {"$sort": {"lecture_id": 1, "timestamp": 1}},
        {"$group": {"_id": "$lecture_id", "first_text": {"$first": "$text"}}},
        {"$match": {"$and": and_text_regex}},
    ]
    for doc in db.transcripts.aggregate(pipeline):
        found_lecture_ids.add(doc["_id"])

    if not found_lecture_ids:
        return LectureSearchResponse(results=[])

    results_list: list[LectureDetailsResponse] = []
    for lecture_id in found_lecture_ids:
        try:
            lecture_details = get_lecture_details(lecture_id)
            results_list.append(lecture_details)
        except HTTPException as e:
            print(f"Warning: Could not retrieve details for lecture_id {lecture_id}: {e.detail}")
            continue

    return LectureSearchResponse(results=results_list)


@app.get("/lectures/{lecture_id}", response_model=LectureDetailsResponse)
def get_lecture_details(lecture_id: str) -> LectureDetailsResponse:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    
    # 1. Get Lecture
    lecture_doc = db.lectures.find_one({"id": lecture_id})
    if not lecture_doc:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    # Enrich with class info
    class_id = lecture_doc.get("class_id")
    class_doc = db.classes.find_one({"id": class_id}) if class_id else None
    
    lecture = Lecture(
        id=lecture_doc["id"],
        class_id=lecture_doc.get("class_id", ""),
        date=lecture_doc.get("date", ""),
        student_id=lecture_doc.get("student_id", ""),
        class_name=class_doc.get("name") if class_doc else None,
        professor=class_doc.get("professor") if class_doc else None,
        school=class_doc.get("school") if class_doc else None,
        class_time=class_doc.get("class_time") if class_doc else None
    )

    # 2. Get Concepts
    concepts_cursor = db.concepts.find({"lecture_id": lecture_id})
    concepts = [Concept(**c) for c in concepts_cursor]
    
    # 3. Get Videos
    videos_cursor = db.videos.find({"lecture_id": lecture_id})
    videos = [VideoResult(**v) for v in videos_cursor]

    # 4. Get Simulations
    sims_cursor = db.simulations.find({"lecture_id": lecture_id, "status": "ready"})
    simulations = [AnimationResponse(**s) for s in sims_cursor]

    # 5. Get Transcripts
    transcripts_cursor = db.transcripts.find({"lecture_id": lecture_id}).sort("timestamp", 1)
    transcripts = [TranscriptItem(**t) for t in transcripts_cursor]

    return LectureDetailsResponse(
        lecture=lecture,
        concepts=concepts,
        videos=videos,
        simulations=simulations,
        transcripts=transcripts
    )


@app.post("/classes", response_model=Class)
def create_class(payload: CreateClassRequest) -> Class:
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
    
    return Class(**new_class)


@app.get("/classes", response_model=ClassListResponse)
def get_classes() -> ClassListResponse:
    if db is None:
         return ClassListResponse(classes=[])
    
    classes_cursor = db.classes.find()
    classes = [Class(**c) for c in classes_cursor]
    return ClassListResponse(classes=classes)