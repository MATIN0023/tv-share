from fastapi import APIRouter, HTTPException

from app.models import ChatRequest, ChatResponse
from app.services.llm import generate_reply

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    message = body.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="message is required")

    reply, source, suggestions = await generate_reply(
        message, body.history, body.locale
    )
    return ChatResponse(reply=reply, source=source, suggestions=suggestions)
