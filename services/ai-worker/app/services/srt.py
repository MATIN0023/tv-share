from __future__ import annotations

from app.services.transcribe import TranscriptSegment


def _format_timestamp(seconds: float) -> str:
    if seconds < 0:
        seconds = 0
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds - int(seconds)) * 1000))
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def segments_to_srt(segments: list[TranscriptSegment]) -> str:
    lines: list[str] = []
    for i, seg in enumerate(segments, start=1):
        start = _format_timestamp(seg.start)
        end_ts = seg.end if seg.end > seg.start else seg.start + 2.0
        end = _format_timestamp(end_ts)
        text = seg.text.replace("\n", " ").strip()
        lines.append(str(i))
        lines.append(f"{start} --> {end}")
        lines.append(text)
        lines.append("")
    return "\n".join(lines).strip() + "\n"
