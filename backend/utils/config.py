"""
utils/config.py
Environment-based configuration using Pydantic Settings.
All secrets loaded from .env — never hard-coded.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── API ───────────────────────────────────────────────────────────────────
    APP_NAME: str = "DeepFake Guard"
    DEBUG: bool = False
    PORT: int = 8080

    # ── CORS (comma-separated list in .env) ──────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",   # Vite dev
        "http://localhost:3000",
        "https://deepfake-guard-flax.vercel.app",
        "https://*.vercel.app",    # Vercel preview
    ]

    # ── File Upload Limits ────────────────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 50

    # ── Model ─────────────────────────────────────────────────────────────────
    MODEL_PATH: str = "/tmp/models/deepfake_efficientnet.pth"
    MODEL_TYPE: str = "efficientnet"   # "efficientnet" | "resnet" | "vit"
    DEVICE: str = "cpu"                # CPU-only for Docker/Render

    # ── Detection ─────────────────────────────────────────────────────────────
    FACE_DETECTION_CONFIDENCE: float = 0.5
    DEEPFAKE_THRESHOLD: float = 0.35    # Score > 0.35 → FAKE

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
