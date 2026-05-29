package repository

import (
	"database/sql"
	"log"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

type Repository struct {
	db *sql.DB
}

func New(dbPath string) (*Repository, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}
	r := &Repository{db: db}
	if err := r.migrate(); err != nil {
		return nil, err
	}
	return r, nil
}

func (r *Repository) Close() error {
	return r.db.Close()
}

func (r *Repository) DB() *sql.DB {
	return r.db
}

func (r *Repository) migrate() error {
	schema := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			display_name TEXT,
			email TEXT,
			family_name TEXT,
			birthday DATE,
			gender TEXT,
			phone TEXT,
			country TEXT,
			city TEXT,
			bio TEXT,
			avatar_url TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS rooms (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			video_path TEXT,
			owner_id TEXT NOT NULL,
			visibility TEXT NOT NULL DEFAULT 'public',
			background TEXT NOT NULL DEFAULT 'default',
			is_playing INTEGER NOT NULL DEFAULT 0,
			current_time REAL NOT NULL DEFAULT 0,
			is_paused INTEGER NOT NULL DEFAULT 0,
			duration REAL NOT NULL DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
		`ALTER TABLE rooms ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'`,
		`ALTER TABLE rooms ADD COLUMN is_playing INTEGER NOT NULL DEFAULT 0`,
		`ALTER TABLE rooms ADD COLUMN current_time REAL NOT NULL DEFAULT 0`,
		`ALTER TABLE rooms ADD COLUMN is_paused INTEGER NOT NULL DEFAULT 0`,
		`ALTER TABLE rooms ADD COLUMN duration REAL NOT NULL DEFAULT 0`,
		`ALTER TABLE rooms ADD COLUMN background TEXT NOT NULL DEFAULT 'default'`,
		`ALTER TABLE users ADD COLUMN email TEXT`,
		`ALTER TABLE users ADD COLUMN family_name TEXT`,
		`ALTER TABLE users ADD COLUMN birthday DATE`,
		`ALTER TABLE users ADD COLUMN gender TEXT`,
		`ALTER TABLE users ADD COLUMN phone TEXT`,
		`ALTER TABLE users ADD COLUMN country TEXT`,
		`ALTER TABLE users ADD COLUMN city TEXT`,
		`ALTER TABLE users ADD COLUMN bio TEXT`,
		`CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			room_id TEXT NOT NULL,
			sender_id TEXT NOT NULL,
			sender_name TEXT NOT NULL,
			content TEXT NOT NULL,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
			FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS invitations (
			id TEXT PRIMARY KEY,
			room_id TEXT NOT NULL,
			code TEXT UNIQUE NOT NULL,
			expires_at DATETIME NOT NULL,
			max_uses INTEGER DEFAULT 1,
			used_count INTEGER DEFAULT 0,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS friendships (
			id TEXT PRIMARY KEY,
			from_user_id TEXT NOT NULL,
			to_user_id TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
			UNIQUE(from_user_id, to_user_id)
		)`,
		`CREATE TABLE IF NOT EXISTS watch_history (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			room_id TEXT NOT NULL,
			room_name TEXT NOT NULL,
			video_path TEXT,
			watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			duration INTEGER DEFAULT 0,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS scheduled_videos (
			id TEXT PRIMARY KEY,
			room_id TEXT NOT NULL,
			title TEXT NOT NULL,
			description TEXT,
			video_url TEXT NOT NULL,
			scheduled_for DATETIME NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			created_by TEXT NOT NULL,
			is_played INTEGER NOT NULL DEFAULT 0,
			FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
			FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)`,
	}

	for _, stmt := range schema {
		if _, err := r.db.Exec(stmt); err != nil {
			if !strings.Contains(err.Error(), "duplicate column name") {
				log.Println("Schema warning:", err)
			}
		}
	}
	return nil
}
