from app.config import settings
from app.models import ChatMessage
from app.services.mock import mock_reply


async def generate_reply(
    message: str,
    history: list[ChatMessage],
    locale: str,
) -> tuple[str, str, list[str]]:
    provider = settings.ai_provider.lower()

    if provider == "openai" and settings.openai_api_key:
        reply = await _openai(message, history)
        return reply, "openai", []

    if provider == "anthropic" and settings.anthropic_api_key:
        reply = await _anthropic(message, history)
        return reply, "anthropic", []

    reply, suggestions = mock_reply(message, history, locale)
    return reply, "mock", suggestions


async def _openai(message: str, history: list[ChatMessage]) -> str:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    messages = [{"role": "system", "content": settings.system_prompt}]
    for item in history[-10:]:
        messages.append({"role": item.role, "content": item.content})
    messages.append({"role": "user", "content": message})

    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        max_tokens=600,
        temperature=0.4,
    )
    return resp.choices[0].message.content or ""


async def _anthropic(message: str, history: list[ChatMessage]) -> str:
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    system = settings.system_prompt
    parts: list[dict] = []
    for item in history[-10:]:
        if item.role in ("user", "assistant"):
            parts.append({"role": item.role, "content": item.content})

    resp = await client.messages.create(
        model=settings.anthropic_model,
        max_tokens=600,
        system=system,
        messages=[*parts, {"role": "user", "content": message}],
    )
    return resp.content[0].text if resp.content else ""
