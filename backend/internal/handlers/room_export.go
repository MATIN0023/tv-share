package handlers

import (
	"archive/zip"
	"bytes"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"

	"watch-party/internal/models"
)

func (h *Handler) ExportRoomChat(w http.ResponseWriter, r *http.Request) {
	if !isAdminRequest(r) {
		WriteJSONError(w, http.StatusForbidden, "Only administrators can export chat")
		return
	}
	roomID := mux.Vars(r)["id"]

	room, err := h.Repo.GetRoom(r.Context(), roomID)
	if err != nil {
		WriteJSONError(w, http.StatusNotFound, "Room not found")
		return
	}

	format := strings.ToLower(r.URL.Query().Get("format"))
	if format == "" {
		format = "txt"
	}
	if format != "txt" && format != "csv" {
		WriteJSONError(w, http.StatusBadRequest, "format must be txt or csv")
		return
	}
	zipExport := r.URL.Query().Get("zip") == "1" || r.URL.Query().Get("zip") == "true"

	messages, err := h.Repo.GetAllMessagesForRoom(r.Context(), roomID)
	if err != nil {
		WriteJSONError(w, http.StatusInternalServerError, "Failed to load messages")
		return
	}

	var body []byte
	ext := format
	if format == "csv" {
		body = buildChatCSV(messages)
	} else {
		body = buildChatTXT(room.Title, messages)
		ext = "txt"
	}

	baseName := fmt.Sprintf("chat-%s-%s", sanitizeFilename(room.Title), time.Now().UTC().Format("20060102-150405"))

	if zipExport {
		var buf bytes.Buffer
		zw := zip.NewWriter(&buf)
		f, err := zw.Create(baseName + "." + ext)
		if err != nil {
			WriteJSONError(w, http.StatusInternalServerError, "Failed to create zip")
			return
		}
		if _, err := f.Write(body); err != nil {
			WriteJSONError(w, http.StatusInternalServerError, "Failed to write zip")
			return
		}
		if err := zw.Close(); err != nil {
			WriteJSONError(w, http.StatusInternalServerError, "Failed to finalize zip")
			return
		}
		w.Header().Set("Content-Type", "application/zip")
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.zip"`, baseName))
		w.Write(buf.Bytes())
		return
	}

	contentType := "text/plain; charset=utf-8"
	if format == "csv" {
		contentType = "text/csv; charset=utf-8"
	}
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.%s"`, baseName, ext))
	w.Write(body)
}

func buildChatTXT(roomTitle string, messages []models.Message) []byte {
	var b strings.Builder
	b.WriteString(fmt.Sprintf("تاریخچه چت اتاق: %s\n", roomTitle))
	b.WriteString(fmt.Sprintf("تعداد پیام: %d\n", len(messages)))
	b.WriteString(strings.Repeat("-", 48))
	b.WriteByte('\n')
	for _, m := range messages {
		b.WriteString(fmt.Sprintf("[%s] %s: %s\n",
			m.Timestamp.UTC().Format("2006-01-02 15:04:05"),
			m.SenderName,
			m.Content,
		))
	}
	return []byte(b.String())
}

func buildChatCSV(messages []models.Message) []byte {
	var b strings.Builder
	b.WriteString("timestamp,sender_id,sender_name,content\n")
	for _, m := range messages {
		content := strings.ReplaceAll(m.Content, "\"", "\"\"")
		b.WriteString(fmt.Sprintf("%s,%s,\"%s\",\"%s\"\n",
			m.Timestamp.UTC().Format(time.RFC3339),
			m.SenderID.Hex(),
			m.SenderName,
			content,
		))
	}
	return []byte(b.String())
}

func sanitizeFilename(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return "room"
	}
	var out strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			out.WriteRune(r)
		} else if r == ' ' {
			out.WriteRune('-')
		}
	}
	if out.Len() == 0 {
		return "room"
	}
	return out.String()
}
