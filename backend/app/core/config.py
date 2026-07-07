"""Application configuration using Pydantic Settings.

All values are read from environment variables or .env file.
No hardcoded secrets or environment-specific values.
"""
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Application ─────────────────────────────────────────────────
    PROJECT_NAME: str = "AI Crop Doctor"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    API_V1_PREFIX: str = "/api/v1"

    # ── Database ─────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── Firebase ─────────────────────────────────────────────────────
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "./firebase-service-account.json"
    FIREBASE_STORAGE_BUCKET: str

    # ── AI Service ───────────────────────────────────────────────────
    GEMINI_API_KEY: str
    AI_CONFIDENCE_THRESHOLD: float = 0.80

    # ── Weather Service ──────────────────────────────────────────────
    OPENWEATHER_API_KEY: str

    # ── Security / CORS ──────────────────────────────────────────────
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


settings = Settings()
