from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    environment: str = "dev"
    gemini_api_key: str | None = None
    elevenlabs_api_key: str | None = None
    youtube_api_key: str | None = None
    vector_db_url: str | None = None
    credit_start_balance: int = 50


settings = Settings()
