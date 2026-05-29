// @title Watch Party API
// @version 1.0
// @description JSON API and WebSocket backend for TV Share watch parties.
// @host localhost:8090
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
package main

import (
	"log"
	"net/http"

	"watch-party/internal/auth"
	"watch-party/internal/config"
	"watch-party/internal/handlers"
	"watch-party/internal/repository"
	"watch-party/internal/routes"
	"watch-party/internal/ws"
)

func main() {
	cfg := config.Load()

	repo, err := repository.New(cfg.DBPath)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	defer repo.Close()

	if err := repo.EnsureDefaultUser(); err != nil {
		log.Printf("Default user setup: %v", err)
	}

	jwtAuth := auth.NewJWT(cfg.JWTSecret)
	hub := ws.NewHub(repo)
	go hub.Run()

	h := handlers.New(repo, hub, jwtAuth)
	router := routes.New(h, hub, jwtAuth)

	log.Printf("API server listening on %s", cfg.Addr)
	log.Fatal(http.ListenAndServe(cfg.Addr, router))
}
