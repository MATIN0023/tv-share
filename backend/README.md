# Watch Party

A real-time video watching application where users can create rooms, watch videos together, and chat.

## Features

- User registration and login (JWT authentication)
- Create public/private rooms
- Upload videos to rooms (MP4, WebM, OGG)
- Synchronized video playback (play, pause, seek) for all room members
- Real-time chat with message history
- Friend system (send/accept/reject requests)
- Watch history and video feed
- Scheduled videos
- Room invitations via shareable codes

## Tech Stack

- **Language**: Go (1.22+)
- **Web Framework**: Gorilla Mux (routing)
- **WebSocket**: Gorilla WebSocket
- **Database**: SQLite (via `github.com/mattn/go-sqlite3`)
- **Authentication**: JWT (github.com/golang-jwt/jwt/v5)
- **Password Hashing**: bcrypt (golang.org/x/crypto/bcrypt)
- **Static Files**: Served directly (HTML/JS/CSS)

## Project Structure

```
.
├── client.go          # WebSocket client handling
├── database.go        # DB initialization and all data access functions
├── hub.go             # WebSocket hub managing rooms and clients
├── main.go            # HTTP server, routes, middleware, entrypoint
├── models.go          # Data structs (User, Room, Message, etc.)
├── utils.go           # ID and invite code generation
├── static/            # Frontend assets (index.html, app.js, etc.)
├── videos/            # Uploaded video storage
└── watchparty.db      # SQLite database (created on first run)
```

## API Endpoints

All API routes require a valid JWT in the `Authorization: Bearer <token>` header unless noted.

### Auth
- `POST /auth/register` – register a new user
- `POST /auth/login` – login and receive a JWT

### Users
- `GET /me` – current user profile
- `PUT /profile` – update profile
- `GET /users` – list all users

### Rooms
- `POST /rooms` – create a room
- `GET /rooms` – list rooms (used by debug endpoint)
- `GET /rooms/{id}` – get room details
- `POST /rooms/{id}/video` – upload a video to room (owner only)
- `POST /rooms/{id}/invite` – generate an invite code
- `POST /invite/accept` – accept an invite (body: `{ "code": "..." }`)

### Playback (room owner only)
- `POST /rooms/{id}/play` – start video
- `POST /rooms/{id}/pause` – pause video
- `POST /rooms/{id}/seek` – seek to time (body: `{ "current_time": number }`)

### Messages
- `GET /rooms/{id}/messages` – get chat messages (latest 100)

### Friends
- `GET /friends` – list accepted friends
- `GET /friends/requests` – pending incoming requests
- `POST /friends/request` – send request (body: `{ "to_user_id": "..." }`)
- `POST /friends/accept` – accept request (body: `{ "from_user_id": "..." }`)
- `POST /friends/reject` – reject request (body: `{ "from_user_id": "..." }`)

### Watch History & Feed
- `GET /feed` – public video rooms (latest 50)
- `GET /rooms/{id}/history/watch` – user's watch history
- `GET /rooms/{id}/history/rooms` – distinct rooms user has watched

### Scheduled Videos
- `POST /schedule` – schedule a video
- `GET /schedule` – list user's scheduled videos
- `POST /schedule/{id}/play` – mark as played
- `POST /schedule/{id}/pause` – pause scheduled video
- `POST /schedule/{id}/seek` – seek scheduled video
- `POST /schedule/{id}/complete` – mark scheduled video complete
- `POST /schedule/{id}/end` – delete scheduled video

### WebSocket
- `GET /ws` – WebSocket endpoint (requires `user_id` query param)

## Running the Project

1. **Clone the repository** (if not already):
   ```bash
   git clone <repo-url>
   cd watch-party
   ```

2. **Install dependencies**:
   ```bash
   go mod tidy
   ```

3. **Run the server**:
   ```bash
   go run main.go
   ```
   The server will start on `:8090`. Open `http://localhost:8090` in your browser.

4. **First run**:
   - A default user is created: `admin / admin123` (you can change password after login).
   - The SQLite database `watchparty.db` will be created automatically.

## Environment

- No external services required; everything runs locally.
- Ensure you have Go 1.22+ installed.

## Notes

- Video files are stored under `./videos/`.
- The frontend is a single-page application served from `static/index.html` with bundled JavaScript (`static/app.js`).
- CORS is intentionally open (`CheckOrigin: return true`) for simplicity; adjust in production.

## License

This project is for educational purposes. Feel free to modify and extend.
