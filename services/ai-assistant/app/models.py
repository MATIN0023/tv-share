from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default_factory=list)
    user_id: str | None = None
    locale: str = "fa"


class ChatResponse(BaseModel):
    reply: str
    source: Literal["mock", "openai", "anthropic"]
    suggestions: list[str] = Field(default_factory=list)
