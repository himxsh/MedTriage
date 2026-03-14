from pydantic_settings import BaseSettings
from typing import Optional
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

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
