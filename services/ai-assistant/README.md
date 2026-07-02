# MovieSync AI Assistant

Platform chatbot microservice. Works **without API keys** (rule-based mock). Connect OpenAI or Claude when ready.

## Run locally

```bash
cd services/ai-assistant
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8200
```

## Configure LLM

```env
AI_PROVIDER=openai    # mock | openai | anthropic
OPENAI_API_KEY=sk-...
```

## API

- `GET /health`
- `POST /chat` — `{ "message": "...", "history": [], "locale": "fa" }`

Backend proxies authenticated requests at `POST /api/assistant/chat`.
