# MovieSync (tv-share)

Watch-party platform: synchronized video rooms, real-time chat, subscriptions, and admin tooling.

## Repository layout

| Path | Stack | Description |
|------|-------|-------------|
| [`frontend/`](frontend/) | Next.js 15, React, Tailwind | Web app (PWA), dashboard, admin panel |
| [`backend/`](backend/) | Go, MongoDB, WebSocket | REST API, auth, billing, rooms |
| [`services/ai-worker/`](services/ai-worker/) | Python, FastAPI | Subtitle transcription (Whisper) |
| [`services/ai-assistant/`](services/ai-assistant/) | Python, FastAPI | In-app AI assistant |
| [`deploy/`](deploy/) | Docker Compose | Full local / staging stack |
| [`docs/`](docs/) | — | DevOps, Google OAuth, and ops guides |

## Quick start (Docker)

```bash
cp deploy/.env.example deploy/.env
# Set JWT_SECRET and other values in deploy/.env

docker compose -f deploy/docker-compose.yml up -d --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8090 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

See [docs/DEVOPS.md](docs/DEVOPS.md) for production deployment details.

## Local development

### Backend

```bash
cd backend
cp .env.example .env   # set JWT_SECRET (or DEV_MODE=true for local dev)
go run ./cmd/server
```

API listens on `:8090` by default. See [backend/README.md](backend/README.md) for endpoints and auth.

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App runs at http://localhost:3000.

## What not to commit

- `.env` files with secrets (use `.env.example` templates)
- Compiled binaries (`*.exe`, `backend/bin/`)
- `node_modules/`, `.next/`, Python virtualenvs

Root and per-service `.gitignore` files enforce this.

## Documentation

- [DevOps & infrastructure](docs/DEVOPS.md)
- [Google OAuth setup](docs/GOOGLE_OAUTH.md)
- [Backend API](backend/README.md)

## License

Private project — all rights reserved.
