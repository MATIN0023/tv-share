package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

type Config struct {
	Addr                 string
	MongoURI             string
	MongoDB              string
	JWTSecret            []byte
	PaymentWebhookSecret string
	GoogleClientID       string
	AssistantServiceURL  string
	RedisURL             string
	DevSeedUsers         bool
	DevAdminPhone        string
	DevAdminPassword     string
	DevTestUserPhone     string
	DevTestUserPassword  string
}

func Load() Config {
	loadDotEnv()

	addr := envOr("SERVER_ADDR", ":8090")
	mongoURI := envOr("MONGO_URI", "mongodb://localhost:27017")
	mongoDB := envOr("MONGO_DB", "watchparty")

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		if os.Getenv("DEV_MODE") == "true" {
			log.Println("WARNING: JWT_SECRET not set — using insecure dev default. Never use DEV_MODE in production.")
			secret = "dev-only-insecure-jwt-secret"
		} else {
			log.Fatal("JWT_SECRET environment variable is required")
		}
	}

	paymentSecret := os.Getenv("PAYMENT_WEBHOOK_SECRET")
	if paymentSecret == "" && os.Getenv("DEV_MODE") != "true" {
		log.Println("WARNING: PAYMENT_WEBHOOK_SECRET not set — payment webhooks will be rejected")
	}

	return Config{
		Addr:                 addr,
		MongoURI:             mongoURI,
		MongoDB:              mongoDB,
		JWTSecret:            []byte(secret),
		PaymentWebhookSecret: paymentSecret,
		GoogleClientID:       os.Getenv("GOOGLE_CLIENT_ID"),
		AssistantServiceURL:  envOr("ASSISTANT_SERVICE_URL", "http://localhost:8200"),
		RedisURL:             os.Getenv("REDIS_URL"),
		DevSeedUsers:         os.Getenv("DEV_SEED_USERS") == "true",
		DevAdminPhone:        os.Getenv("DEV_ADMIN_PHONE"),
		DevAdminPassword:     os.Getenv("DEV_ADMIN_PASSWORD"),
		DevTestUserPhone:     os.Getenv("DEV_TEST_USER_PHONE"),
		DevTestUserPassword:  os.Getenv("DEV_TEST_USER_PASSWORD"),
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// loadDotEnv loads the first .env found (supports `go run` from backend/ or cmd/server/).
func loadDotEnv() {
	for _, p := range []string{".env", filepath.Join("..", ".env"), filepath.Join("..", "..", ".env")} {
		if _, err := os.Stat(p); err != nil {
			continue
		}
		if err := godotenv.Load(p); err != nil {
			log.Printf("WARNING: failed to load %s: %v", p, err)
			continue
		}
		log.Printf("Loaded environment from %s", p)
		return
	}
}
