from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    environment: str = "dev"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    gemini_simulation_model: str = "gemini-3-flash-preview"
    google_api_key: str = ""
    google_search_cx: str = ""
    elevenlabs_api_key: str | None = None
    elevenlabs_voice_id: str | None = None
    elevenlabs_tts_model_id: str = "eleven_multilingual_v2"
    vector_db_url: str | None = None
    credit_start_balance: int = 50
    mongo_connection_string: str | None = None
    transcript_embeddings_key: str | None = None


settings = Settings()
