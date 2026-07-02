# MovieSync — DevOps & Infrastructure Guide

Hand this document to DevOps when deploying the platform. All services are designed to start in **mock/degraded mode** without optional keys and upgrade when credentials are added.

## Architecture overview

```
                    ┌─────────────┐
                    │   Frontend  │  Next.js :3000
                    │  (PWA)      │
                    └──────┬──────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │   Backend   │  Go API + WebSocket :8090
                    │   (API)     │
                    └──┬────┬─────┘
         ┌─────────────┘    └─────────────┐
         ▼                                ▼
  ┌─────────────┐                  ┌─────────────┐
  │   MongoDB   │                  │    Redis    │
  │   :27017    │                  │   :6379     │
  └─────────────┘                  └──────┬──────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              ▼                           ▼                           ▼
       ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
       │  AI Worker  │            │ AI Assistant│            │  LiveKit    │
       │  :8100      │            │  :8200      │            │  (future)   │
       │  subtitles  │            │  chatbot    │            │  voice chat │
       └─────────────┘            └─────────────┘            └─────────────┘
```

## Quick start (Docker Compose)

```bash
cp deploy/.env.example deploy/.env
# Edit JWT_SECRET, optional GOOGLE_CLIENT_ID, OPENAI_API_KEY

docker compose -f deploy/docker-compose.yml up -d --build
```

| Service       | URL                      | Purpose                          |
|---------------|--------------------------|----------------------------------|
| Frontend      | http://localhost:3000    | Web app                          |
| Backend API   | http://localhost:8090    | REST + `/ws` WebSocket           |
| MongoDB       | localhost:27017          | Primary database                 |
| Redis         | localhost:6379           | Cache, OTP, rate limits, AI ctx  |
| AI Worker     | http://localhost:8100    | Whisper subtitles (SRT)          |
| AI Assistant  | http://localhost:8200    | Platform chatbot                 |

## Redis — required for scale

Redis is **optional in dev** (in-memory fallbacks) but **required in production** for:

| Use case              | Key pattern              | TTL    |
|-----------------------|--------------------------|--------|
| OTP codes             | `otp:{phone}`            | 5 min  |
| Rate limiting         | `rl:{ip}` / `rl:{phone}` | 1 min  |
| Session blacklist     | `jwt:revoked:{jti}`      | token  |
| WebSocket pub/sub     | `ws:room:{id}`           | —      |
| AI chat context       | `assistant:ctx:{user}`  | 24 h   |
| Voice room signaling  | `voice:room:{id}`        | 1 h    |

**Env:** `REDIS_URL=redis://host:6379/0`

Backend connects on startup when `REDIS_URL` is set; logs `Redis: connected` or continues without it.

## AI Assistant (chatbot)

| Variable              | Description                                      |
|-----------------------|--------------------------------------------------|
| `ASSISTANT_SERVICE_URL` | Backend → assistant proxy (default `http://ai-assistant:8200`) |
| `AI_PROVIDER`         | `mock` \| `openai` \| `anthropic`                |
| `OPENAI_API_KEY`      | Required when `AI_PROVIDER=openai`               |
| `ANTHROPIC_API_KEY`   | Required when `AI_PROVIDER=anthropic`            |

**Endpoints**

- Assistant service: `POST /chat` — `{ "message": "...", "history": [...], "user_id": "..." }`
- Backend (authenticated): `POST /api/assistant/chat`

Without API keys the assistant uses **rule-based mock answers** about rooms, OTP login, uploads, and billing.

## AI Worker (subtitles)

See `services/ai-worker/README.md`. Env: `OPENAI_API_KEY`, `WHISPER_MODEL`.

Backend env: `AI_WORKER_URL=http://ai-worker:8100`

## Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client ID (Web)
2. Authorized JavaScript origins: `http://localhost:3000`, production domain
3. Authorized redirect URIs: same origins (GIS uses popup, no redirect needed for ID token flow)

| Env (backend + frontend) | Description        |
|----------------------------|--------------------|
| `GOOGLE_CLIENT_ID`         | OAuth client ID    |
| `GOOGLE_CLIENT_SECRET`     | Optional (backend verify via tokeninfo) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same client ID for frontend |

## Video upload & third-party CDN

Current flow supports **URL registration** (`POST /api/videos/upload` with `original_url`).

Future pipeline (DevOps prep):

1. User uploads file → presigned S3 URL or direct to CDN ingest
2. Worker transcodes → HLS segments on CDN
3. Webhook `POST /api/internal/video-ready` updates `process_status`

**Suggested env (when enabled):**

```env
S3_BUCKET=moviesync-videos
S3_REGION=eu-central-1
CDN_BASE_URL=https://cdn.moviesync.example
VIDEO_UPLOAD_MAX_MB=2048
```

Frontend upload modal supports: **Paste URL**, **Direct file** (local dev), **CDN link** (S3/CloudFront/Arvan).

## Voice chat (future)

Recommended: **LiveKit** self-hosted or cloud.

```yaml
# Uncomment in deploy/docker-compose.yml
livekit:
  image: livekit/livekit-server:latest
  ports: ["7880:7880", "7881:7881"]
```

Env when ready: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`

Redis channel `voice:room:{roomId}` for presence until LiveKit is wired.

## Production checklist

- [ ] Set strong `JWT_SECRET`, disable `DEV_MODE`
- [ ] MongoDB replica set + backups
- [ ] Redis with persistence (AOF) + password (`redis://:pass@host:6379/0`)
- [ ] TLS termination (nginx / Cloudflare)
- [ ] `CORS_ORIGIN` locked to production domain
- [ ] Google OAuth production client
- [ ] AI keys in secrets manager (not `.env` in repo)
- [ ] Rate limits verified under load
- [ ] PWA icons and manifest on CDN

## Health checks

| Service        | Endpoint        |
|----------------|-----------------|
| Backend        | `GET /api/settings/public` |
| AI Worker      | `GET /health`   |
| AI Assistant   | `GET /health`   |
| Redis          | `redis-cli ping`|

## Logs

```bash
docker compose -f deploy/docker-compose.yml logs -f backend ai-assistant
```

OTP codes in dev are printed to backend stdout: `[OTP] phone=... code=...`
