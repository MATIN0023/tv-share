package config

import "os"

type Config struct {
	Addr      string
	MongoURI  string
	MongoDB   string
	JWTSecret []byte
}

func Load() Config {
	addr := os.Getenv("SERVER_ADDR")
	if addr == "" {
		addr = ":8090"
	}
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}
	mongoDB := os.Getenv("MONGO_DB")
	if mongoDB == "" {
		mongoDB = "watchparty"
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "watch-party-secret-key-2026"
	}
	return Config{
		Addr:      addr,
		MongoURI:  mongoURI,
		MongoDB:   mongoDB,
		JWTSecret: []byte(secret),
	}
}
