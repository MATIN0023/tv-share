package handlers

import (
	"watch-party/internal/auth"
	"watch-party/internal/repository"
	"watch-party/internal/ws"
)

type Handler struct {
	Repo    *repository.Repository
	Hub     *ws.Hub
	JWT     *auth.JWT
}

func New(repo *repository.Repository, hub *ws.Hub, jwtAuth *auth.JWT) *Handler {
	return &Handler{Repo: repo, Hub: hub, JWT: jwtAuth}
}
