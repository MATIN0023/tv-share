from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from app.config import settings


@dataclass
class TranscriptSegment:
    start: float
    end: float
    text: str


def transcribe(audio_path: Path, language: str | None = None) -> tuple[list[TranscriptSegment], str | None]:
    backend = settings.whisper_backend.lower()
    lang = language or settings.whisper_language or None
    if lang == "":
        lang = None

    if backend == "local":
        return _transcribe_local(audio_path, lang)
    if not settings.openai_api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is required when WHISPER_BACKEND=openai. "
            "Set WHISPER_BACKEND=local and install faster-whisper for offline mode."
        )
    return _transcribe_openai(audio_path, lang)


def _transcribe_openai(
    audio_path: Path, language: str | None
) -> tuple[list[TranscriptSegment], str | None]:
    from openai import OpenAI

    client = OpenAI(api_key=settings.openai_api_key)
    with audio_path.open("rb") as f:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            language=language,
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )

    detected = getattr(response, "language", None)
    segments: list[TranscriptSegment] = []
    raw_segments = getattr(response, "segments", None) or []

    if raw_segments:
        for seg in raw_segments:
            text = (getattr(seg, "text", None) or "").strip()
            if not text:
                continue
            segments.append(
                TranscriptSegment(
                    start=float(getattr(seg, "start", 0)),
                    end=float(getattr(seg, "end", 0)),
                    text=text,
                )
            )
    else:
        text = (getattr(response, "text", None) or "").strip()
        if text:
            segments.append(TranscriptSegment(start=0.0, end=0.0, text=text))

    return segments, detected


def _transcribe_local(
    audio_path: Path, language: str | None
) -> tuple[list[TranscriptSegment], str | None]:
    try:
        from faster_whisper import WhisperModel
    except ImportError as e:
        raise RuntimeError(
            "faster-whisper is not installed. Run: pip install faster-whisper"
        ) from e

    model = WhisperModel(
        settings.whisper_local_model,
        device="cpu",
        compute_type="int8",
    )
    seg_iter, info = model.transcribe(
        str(audio_path),
        language=language,
        vad_filter=True,
    )
    segments = [
        TranscriptSegment(start=s.start, end=s.end, text=s.text.strip())
        for s in seg_iter
        if s.text.strip()
    ]
    detected = info.language if info else language
    return segments, detected
