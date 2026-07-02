# Watch Party API

JSON API and WebSocket backend (Go modular monolith + MongoDB).

## Authentication

| Method | Endpoint | Body |
|--------|----------|------|
| Register | `POST /auth/register` | `{ "phone_number", "password", "display_name?" }` |
| Login | `POST /auth/login` | `{ "phone_number", "password" }` |
| Request OTP | `POST /auth/otp/request` | `{ "phone_number" }` |
| Verify OTP | `POST /auth/otp/verify` | `{ "phone_number", "code" }` |
| Google sign-in | `POST /auth/google` | `{ "id_token" }` — email/name from Google token (see [docs/GOOGLE_OAUTH.md](../docs/GOOGLE_OAUTH.md)) |

- **Primary identifier:** Iranian mobile `09XXXXXXXXX`
- **Password hashing:** bcrypt cost 10 (`golang.org/x/crypto/bcrypt`)
- **OTP:** 5-digit code, 5-minute TTL, logged to server console (simulated SMS)
- **JWT:** HS256, 24h expiry, `Authorization: Bearer <token>`
- **WebSocket:** connect with `?token=<JWT>` (no anonymous `user_id` query param)

### Environment variables

Copy `.env.example` to `.env` in the `backend/` folder (loaded automatically on startup). Required in production:

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Signs session tokens (required unless `DEV_MODE=true`) |
| `PAYMENT_WEBHOOK_SECRET` | HMAC key for `X-Payment-Signature` on payment webhooks |

Optional dev seeding (`DEV_SEED_USERS=true`):

| Variable | Purpose |
|----------|---------|
| `DEV_ADMIN_PHONE` / `DEV_ADMIN_PASSWORD` | Creates admin user on startup |
| `DEV_TEST_USER_PHONE` / `DEV_TEST_USER_PASSWORD` | Creates test user on startup |

### Rate limits

| Endpoint | Limit |
|----------|-------|
| `POST /auth/login` | 10 / minute / IP |
| `POST /auth/register` | 5 / minute / IP |
| `POST /auth/otp/request` | 3 / hour / phone, 20 / minute / IP |
| `POST /auth/otp/verify` | 15 / minute / IP |
| WebSocket chat | 20 / minute / user |

### Payment webhook

`POST /api/payment/webhook` requires header `X-Payment-Signature: <hex HMAC-SHA256 of raw body>` using `PAYMENT_WEBHOOK_SECRET`.

## User dashboard API

| Area | Endpoints |
|------|-----------|
| Profile | `GET/PUT /api/users/me`, `PUT /api/users/me/password`, `PUT /api/users/me/avatar` |
| Block users | `POST /api/users/{id}/block`, `GET /api/users/blocked` |
| Billing | `GET /api/subscription`, `GET /api/plans`, `GET /api/transactions`, `POST /api/subscription/upgrade` |
| Payment webhook | `POST /api/payment/webhook` (public) |
| Notifications | `GET /api/notifications`, `PUT /api/notifications/{id}/read`, `PUT /api/notifications/read-all` |
| Tickets | `GET/POST /api/tickets`, `GET /api/tickets/{id}`, `POST /api/tickets/{id}/messages` |
| Videos | `GET /api/videos`, `POST /api/videos/upload`, `DELETE /api/videos/{id}`, `GET /api/videos/{id}/status` |

## Admin API

Requires JWT with `role: admin` or `superadmin`.

| Area | Endpoints |
|------|-----------|
| Stats | `GET /api/admin/stats` |
| Users | `GET/POST/PUT/DELETE /api/admin/users`, `PUT .../ban`, `PUT .../subscription` |
| Plans | `GET/POST/PUT /api/admin/plans` |
| Transactions | `GET /api/admin/transactions` |
| Reports | `GET /api/admin/reports`, `PUT /api/admin/reports/{id}/resolve` |
| Live rooms | `GET /api/admin/rooms/live` |
| Videos | `DELETE /api/admin/videos/{id}` |
| Settings | `GET/PUT /api/admin/settings`, `PUT /api/admin/settings/maintenance` |

## Environment

| Variable | Default |
|----------|---------|
| `MONGO_URI` | `mongodb://localhost:27017` |
| `MONGO_DB` | `watchparty` |
| `SERVER_ADDR` | `:8090` |
| `JWT_SECRET` | dev default |
| `CORS_ORIGIN` | `http://localhost:3000` |

## Run

```bash
cd backend
go run ./cmd/server
```

Frontend: copy `frontend/.env.local.example` → `.env.local`, then `npm run dev`.

## MongoDB collections

`users`, `otps`, `rooms`, `videos`, `messages`, `invitations`, `friendships`, `watch_history`, `scheduled_videos`, `transactions`, `plans`, `reports`, `notifications`, `tickets`, `ticket_messages`, `settings`
