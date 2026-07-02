from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = 8200
    ai_provider: str = "mock"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-3-5-haiku-20241022"
    redis_url: str = ""
    system_prompt: str = (
        "You are MovieSync assistant — a helpful guide for a watch-party platform. "
        "Answer briefly about: creating rooms, joining with invite codes, OTP login, "
        "uploading videos by URL, subscriptions, and troubleshooting playback sync. "
        "Reply in the same language the user writes in (Persian or English)."
    )


settings = Settings()
