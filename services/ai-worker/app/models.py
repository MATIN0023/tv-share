from enum import Enum

from pydantic import BaseModel, Field, HttpUrl


class JobStatus(str, Enum):
    pending = "pending"
    downloading = "downloading"
    extracting_audio = "extracting_audio"
    transcribing = "transcribing"
    completed = "completed"
    failed = "failed"


class SubtitleJobCreateUrl(BaseModel):
    url: HttpUrl
    language: str | None = Field(
        default=None, description="ISO 639-1 code; omit for auto-detect"
    )


class SubtitleSegment(BaseModel):
    index: int
    start: float
    end: float
    text: str


class SubtitleJobResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str | None = None
    language: str | None = None
    segment_count: int | None = None
    download_url: str | None = None
    error: str | None = None


class HealthResponse(BaseModel):
    status: str
    whisper_backend: str
    ffmpeg_available: bool
