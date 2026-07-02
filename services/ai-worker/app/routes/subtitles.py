from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.config import settings
from app.deps import verify_api_key
from app.models import JobStatus, SubtitleJobCreateUrl, SubtitleJobResponse
from app.services.audio import ffmpeg_available
from app.services.pipeline import job_store, run_subtitle_job

router = APIRouter(prefix="/api/v1/subtitles", tags=["subtitles"])


def _job_response(job_id: str, **kwargs) -> SubtitleJobResponse:
    download_url = None
    if kwargs.get("status") == JobStatus.completed:
        download_url = f"/api/v1/subtitles/{job_id}/download.srt"
    return SubtitleJobResponse(job_id=job_id, download_url=download_url, **kwargs)


@router.post(
    "/from-url",
    response_model=SubtitleJobResponse,
    status_code=202,
    dependencies=[Depends(verify_api_key)],
)
async def create_from_url(
    body: SubtitleJobCreateUrl,
    background_tasks: BackgroundTasks,
) -> SubtitleJobResponse:
    if not ffmpeg_available():
        raise HTTPException(503, "ffmpeg is not available on this server")

    job = await job_store.create()
    background_tasks.add_task(
        run_subtitle_job,
        job,
        source_url=str(body.url),
        language=body.language,
    )
    return _job_response(job.job_id, status=JobStatus.pending, message="Job queued")


@router.post(
    "/from-file",
    response_model=SubtitleJobResponse,
    status_code=202,
    dependencies=[Depends(verify_api_key)],
)
async def create_from_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Video or audio file"),
    language: str | None = Form(default=None),
) -> SubtitleJobResponse:
    if not ffmpeg_available():
        raise HTTPException(503, "ffmpeg is not available on this server")

    max_bytes = settings.max_upload_mb * 1024 * 1024
    job = await job_store.create()
    assert job.work_dir is not None

    suffix = Path(file.filename or "upload.bin").suffix or ".mp4"
    dest = job.work_dir / f"upload{suffix}"

    size = 0
    with dest.open("wb") as out:
        while chunk := await file.read(1024 * 256):
            size += len(chunk)
            if size > max_bytes:
                raise HTTPException(
                    413,
                    f"File exceeds MAX_UPLOAD_MB ({settings.max_upload_mb})",
                )
            out.write(chunk)

    background_tasks.add_task(
        run_subtitle_job,
        job,
        source_path=dest,
        language=language or None,
    )
    return _job_response(job.job_id, status=JobStatus.pending, message="Job queued")


@router.get(
    "/{job_id}",
    response_model=SubtitleJobResponse,
    dependencies=[Depends(verify_api_key)],
)
async def get_job(job_id: str) -> SubtitleJobResponse:
    job = await job_store.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return _job_response(
        job.job_id,
        status=job.status,
        message=job.message,
        language=job.language,
        segment_count=job.segment_count,
        error=job.error,
    )


@router.get(
    "/{job_id}/download.srt",
    dependencies=[Depends(verify_api_key)],
)
async def download_srt(job_id: str) -> FileResponse:
    job = await job_store.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    if job.status != JobStatus.completed or not job.srt_path or not job.srt_path.exists():
        raise HTTPException(409, "Subtitles not ready yet")
    return FileResponse(
        path=job.srt_path,
        media_type="application/x-subrip",
        filename=f"subtitles-{job_id}.srt",
    )
