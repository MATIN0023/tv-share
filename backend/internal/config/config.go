package config

import "os"

type Config struct {
	Addr       string
	DBPath     string
	JWTSecret  []byte
}

func Load() Config {
	addr := os.Getenv("SERVER_ADDR")
	if addr == "" {
		addr = ":8090"
	}
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./watchparty.db"
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "watch-party-secret-key-2026"
	}
	return Config{
		Addr:      addr,
		DBPath:    dbPath,
		JWTSecret: []byte(secret),
	}
}
