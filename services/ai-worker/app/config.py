from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str = ""
    whisper_backend: str = "openai"  # openai | local
    whisper_local_model: str = "base"
    whisper_language: str = "fa"

    host: str = "0.0.0.0"
    port: int = 8100

    max_upload_mb: int = 500
    job_ttl_hours: int = 24

    temp_dir: str = "./data/temp"
    output_dir: str = "./data/output"

    ffmpeg_path: str = "ffmpeg"
    api_key: str = ""


settings = Settings()
