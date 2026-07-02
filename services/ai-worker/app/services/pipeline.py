from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

from app.config import settings
from app.models import JobStatus
from app.services.audio import FFmpegError, extract_audio, probe_has_audio, safe_remove
from app.services.srt import segments_to_srt
from app.services.transcribe import transcribe


@dataclass
class JobRecord:
    job_id: str
    status: JobStatus = JobStatus.pending
    message: str | None = None
    language: str | None = None
    segment_count: int | None = None
    error: str | None = None
    srt_path: Path | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    work_dir: Path | None = None


class JobStore:
    def __init__(self) -> None:
        self._jobs: dict[str, JobRecord] = {}
        self._lock = asyncio.Lock()

    async def create(self) -> JobRecord:
        job_id = uuid.uuid4().hex
        work_dir = Path(settings.temp_dir) / job_id
        work_dir.mkdir(parents=True, exist_ok=True)
        job = JobRecord(job_id=job_id, work_dir=work_dir)
        async with self._lock:
            self._jobs[job_id] = job
        return job

    async def get(self, job_id: str) -> JobRecord | None:
        async with self._lock:
            job = self._jobs.get(job_id)
        if job:
            self._maybe_expire(job)
        return job

    def _maybe_expire(self, job: JobRecord) -> None:
        ttl = timedelta(hours=settings.job_ttl_hours)
        if datetime.now(timezone.utc) - job.created_at > ttl:
            self._cleanup_job_files(job)
            job.status = JobStatus.failed
            job.error = "Job expired"

    async def update(self, job: JobRecord, **kwargs) -> None:
        for k, v in kwargs.items():
            setattr(job, k, v)
        async with self._lock:
            self._jobs[job.job_id] = job

    def _cleanup_job_files(self, job: JobRecord) -> None:
        if job.work_dir:
            safe_remove(job.work_dir)


job_store = JobStore()


async def _download_url(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    async with httpx.AsyncClient(follow_redirects=True, timeout=120.0) as client:
        async with client.stream("GET", url) as response:
            response.raise_for_status()
            with dest.open("wb") as f:
                async for chunk in response.aiter_bytes(chunk_size=1024 * 256):
                    f.write(chunk)


async def run_subtitle_job(
    job: JobRecord,
    *,
    source_path: Path | None = None,
    source_url: str | None = None,
    language: str | None = None,
) -> None:
    assert job.work_dir is not None
    input_path = job.work_dir / "input"
    audio_path = job.work_dir / "audio.wav"
    output_dir = Path(settings.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    srt_path = output_dir / f"{job.job_id}.srt"

    try:
        if source_path:
            input_path = source_path
        elif source_url:
            await job_store.update(job, status=JobStatus.downloading, message="Downloading media")
            ext = ".mp4"
            input_path = job.work_dir / f"download{ext}"
            await _download_url(source_url, input_path)
        else:
            raise ValueError("No source provided")

        await job_store.update(
            job, status=JobStatus.extracting_audio, message="Extracting audio with ffmpeg"
        )
        if not probe_has_audio(input_path):
            raise FFmpegError("No audio track found in input file")

        await asyncio.to_thread(extract_audio, input_path, audio_path)

        await job_store.update(
            job, status=JobStatus.transcribing, message="Transcribing with Whisper"
        )
        segments, detected = await asyncio.to_thread(transcribe, audio_path, language)
        srt_content = segments_to_srt(segments)
        srt_path.write_text(srt_content, encoding="utf-8")

        await job_store.update(
            job,
            status=JobStatus.completed,
            message="Subtitles ready",
            language=detected or language,
            segment_count=len(segments),
            srt_path=srt_path,
        )
    except Exception as e:
        await job_store.update(
            job,
            status=JobStatus.failed,
            error=str(e),
            message="Job failed",
        )
    finally:
        if job.work_dir and source_path is None:
            safe_remove(job.work_dir / "download.mp4")
