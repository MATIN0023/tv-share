# TV Share AI Worker

Standalone **FastAPI** microservice for AI features. Currently supports:

- Upload a **video/audio file** or pass a **media URL**
- Extract audio with **ffmpeg**
- Transcribe with **OpenAI Whisper API** or local **faster-whisper**
- Download generated **SRT** subtitles

Designed to integrate later with the main Go/Next.js platform.

## Requirements

- Python 3.11+
- [ffmpeg](https://ffmpeg.org/) on `PATH`
- For `WHISPER_BACKEND=openai`: `OPENAI_API_KEY`
- For `WHISPER_BACKEND=local`: `pip install faster-whisper` (+ optional GPU)

## Quick start

```bash
cd services/ai-worker
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # set OPENAI_API_KEY

uvicorn app.main:app --reload --port 8100
```

Open **http://localhost:8100/docs** for Swagger UI.

## Docker

```bash
docker build -t tv-share-ai-worker .
docker run --env-file .env -p 8100:8100 tv-share-ai-worker
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health + ffmpeg status |
| POST | `/api/v1/subtitles/from-file` | Upload video/audio (multipart) |
| POST | `/api/v1/subtitles/from-url` | JSON `{ "url": "https://...", "language": "fa" }` |
| GET | `/api/v1/subtitles/{job_id}` | Job status |
| GET | `/api/v1/subtitles/{job_id}/download.srt` | Download SRT |

If `API_KEY` is set in `.env`, send header: `X-API-Key: your-key`

### Example: URL → SRT

```bash
# 1. Start job
curl -X POST http://localhost:8100/api/v1/subtitles/from-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/video.mp4","language":"fa"}'

# 2. Poll status
curl http://localhost:8100/api/v1/subtitles/{job_id}

# 3. Download
curl -O http://localhost:8100/api/v1/subtitles/{job_id}/download.srt
```

### Example: file upload

```bash
curl -X POST http://localhost:8100/api/v1/subtitles/from-file \
  -F "file=@sample.mp4" \
  -F "language=fa"
```

## Configuration

See `.env.example`:

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | OpenAI API key |
| `WHISPER_BACKEND` | `openai` | `openai` or `local` |
| `WHISPER_LOCAL_MODEL` | `base` | faster-whisper model |
| `WHISPER_LANGUAGE` | `fa` | Default language (empty = auto) |
| `MAX_UPLOAD_MB` | `500` | Upload limit |
| `API_KEY` | — | Optional service auth |

## Integration with main app (future)

```
Next.js / Go API  ──HTTP──►  ai-worker:8100
                              POST /from-file or /from-url
                              poll GET /{job_id}
                              fetch SRT → room subtitles
```

## Project layout

```
services/ai-worker/
├── app/
│   ├── main.py           # FastAPI app
│   ├── config.py
│   ├── models.py
│   ├── deps.py
│   ├── routes/subtitles.py
│   └── services/
│       ├── audio.py      # ffmpeg extract
│       ├── transcribe.py # Whisper
│       ├── srt.py        # SRT formatter
│       └── pipeline.py   # async jobs
├── main.py
├── requirements.txt
├── Dockerfile
└── .env.example
```
