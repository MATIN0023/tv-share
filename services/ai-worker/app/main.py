from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import HealthResponse
from app.routes.subtitles import router as subtitles_router
from app.services.audio import ffmpeg_available

app = FastAPI(
    title="TV Share AI Worker",
    description=(
        "Standalone microservice for AI features. "
        "Generates SRT subtitles from video/audio via OpenAI Whisper or local faster-whisper."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subtitles_router)


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        whisper_backend=settings.whisper_backend,
        ffmpeg_available=ffmpeg_available(),
    )


@app.get("/", tags=["health"])
def root() -> dict:
    return {
        "service": "tv-share-ai-worker",
        "docs": "/docs",
        "health": "/health",
    }
