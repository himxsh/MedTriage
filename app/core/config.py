from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "MedTriage AI"
    API_V1_STR: str = "/api/v1"
    
    # --- AI API Keys ---
    GOOGLE_API_KEY: Optional[str] = os.getenv("GOOGLE_API_KEY")
    
    # --- Database ---
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://himeshjain@localhost:5432/medtriage"
    )
    
    # --- Redis ---
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # --- Model Paths ---
    WHISPER_MODEL_PATH: str = "models/whisper/small.pt"
    SCISPACY_MODEL_PATH: str = "models/scispacy/en_ner_bc5cdr_md-0.5.4"
    CLINICAL_BERT_PATH: str = "models/relations"
    DEBUG: bool = False
    # STT: whisper | gemini | auto (Whisper then Gemini if empty/short)
    STT_BACKEND: str = "auto"
    # Default Whisper language when intake omits language= (empty = auto-detect)
    WHISPER_LANGUAGE: str = ""
    WHISPER_MODEL_SIZE: str = "small"  # spike: try medium if Hindi WER high

    # --- Auth / tenancy ---
    COOKIE_SECURE: bool = False  # True behind HTTPS in production
    ENABLE_HSTS: bool = False  # set True only when TLS terminates in front of the app
    ALLOW_PUBLIC_REGISTER: bool = False  # invite-only when False
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    MAX_AUDIO_BYTES: int = 25 * 1024 * 1024  # 25 MB
    MAX_TEXT_CHARS: int = 20_000
    DEMO_ADMIN_EMAIL: str = "admin@demo.local"
    DEMO_ADMIN_PASSWORD: str = "demo-change-me"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
