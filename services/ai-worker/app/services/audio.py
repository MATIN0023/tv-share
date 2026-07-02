import shutil
import subprocess
from pathlib import Path

from app.config import settings


class FFmpegError(RuntimeError):
    pass


def ffmpeg_available() -> bool:
    try:
        subprocess.run(
            [settings.ffmpeg_path, "-version"],
            capture_output=True,
            check=True,
            timeout=10,
        )
        return True
    except (subprocess.SubprocessError, FileNotFoundError, OSError):
        return False


def extract_audio(input_path: Path, output_path: Path) -> Path:
    """Extract mono 16 kHz WAV from video/audio for Whisper."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        settings.ffmpeg_path,
        "-y",
        "-i",
        str(input_path),
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if result.returncode != 0:
        raise FFmpegError(result.stderr.strip() or "ffmpeg failed")
    if not output_path.exists():
        raise FFmpegError("Audio output file was not created")
    return output_path


def probe_has_audio(input_path: Path) -> bool:
    cmd = [
        settings.ffmpeg_path,
        "-i",
        str(input_path),
        "-hide_banner",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    combined = (result.stderr or "") + (result.stdout or "")
    return "Audio:" in combined


def safe_remove(path: Path) -> None:
    try:
        if path.is_file():
            path.unlink(missing_ok=True)
        elif path.is_dir():
            shutil.rmtree(path, ignore_errors=True)
    except OSError:
        pass
