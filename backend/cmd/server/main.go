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
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"watch-party/internal/auth"
	"watch-party/internal/config"
	"watch-party/internal/handlers"
	"watch-party/internal/repository"
	"watch-party/internal/routes"
	"watch-party/internal/ws"
)

func main() {
	cfg := config.Load()
	ctx := context.Background()

	repo, err := repository.New(ctx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	if err := repo.EnsureDefaultUser(ctx); err != nil {
		log.Printf("Default user setup: %v", err)
	}
	if err := repo.EnsureDefaultPlans(ctx); err != nil {
		log.Printf("Default plans setup: %v", err)
	}

	jwtAuth := auth.NewJWT(cfg.JWTSecret)
	authHandler := auth.NewHandler(repo, jwtAuth)
	hub := ws.NewHub(repo)
	go hub.Run()

	h := handlers.New(repo, hub, jwtAuth)
	router := routes.New(h, authHandler, hub, jwtAuth, repo)

	srv := &http.Server{Addr: cfg.Addr, Handler: router}
	go func() {
		log.Printf("API server listening on %s (MongoDB: %s)", cfg.Addr, cfg.MongoDB)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
	_ = repo.Close(shutdownCtx)
}
