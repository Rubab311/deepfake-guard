"""
start.py
Railway startup script for DeepFake Guard backend.
No .pth download needed — model is loaded directly from HuggingFace at runtime.
"""

import os
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Set HuggingFace cache to /tmp so Railway can write to it ──────────────────
os.environ.setdefault("HF_HOME",           "/tmp/hf_cache")
os.environ.setdefault("TRANSFORMERS_CACHE", "/tmp/hf_cache")
os.environ.setdefault("HF_DATASETS_CACHE", "/tmp/hf_cache")


# ── Start server ──────────────────────────────────────────────────────────────
def start_server():
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    logger.info("Starting DeepFake Guard API on port %d...", port)
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logger.info("=" * 50)
    logger.info("DeepFake Guard — Starting up")
    logger.info("Using pretrained HuggingFace deepfake detector")
    logger.info("Model will download on first request (~15s)")
    logger.info("=" * 50)
    start_server()
