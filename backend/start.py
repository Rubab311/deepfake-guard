"""
start.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Render startup script for DeepFake Guard backend.

What it does:
  1. Checks if model weights (.pth) already exist
  2. If not, downloads them from Hugging Face Hub
  3. Starts the FastAPI server

Run by Render via: python start.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import os
import sys
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────

HF_USERNAME   = "Rubab311"
HF_REPO       = "deepfake-guard-weights"
MODEL_FILE    = "deepfake_efficientnet.pth"
MODELS_DIR    = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH    = os.path.join(MODELS_DIR, MODEL_FILE)

# Direct download URL from Hugging Face
HF_DOWNLOAD_URL = (
    f"https://huggingface.co/{HF_USERNAME}/{HF_REPO}"
    f"/resolve/main/{MODEL_FILE}"
)


# ── Download weights if missing ───────────────────────────────────────────────

def download_weights():
    """Download model weights from Hugging Face if not already present."""
    os.makedirs(MODELS_DIR, exist_ok=True)

    if os.path.isfile(MODEL_PATH):
        size_mb = os.path.getsize(MODEL_PATH) / 1024 / 1024
        logger.info("✅ Model weights already exist (%.1f MB) — skipping download.", size_mb)
        return

    logger.info("⬇️  Model weights not found. Downloading from Hugging Face...")
    logger.info("    URL: %s", HF_DOWNLOAD_URL)

    try:
        # Try huggingface_hub first (most reliable)
        from huggingface_hub import hf_hub_download
        hf_hub_download(
            repo_id=f"{HF_USERNAME}/{HF_REPO}",
            filename=MODEL_FILE,
            local_dir=MODELS_DIR,
            local_dir_use_symlinks=False,
        )
        logger.info("✅ Downloaded via huggingface_hub.")

    except Exception as e:
        logger.warning("huggingface_hub failed (%s) — trying urllib fallback...", e)

        # Fallback: plain urllib download with progress
        import urllib.request

        def _progress(block_num, block_size, total_size):
            if total_size > 0:
                pct = block_num * block_size * 100 / total_size
                print(f"\r    Progress: {min(pct, 100):.1f}%", end="", flush=True)

        urllib.request.urlretrieve(HF_DOWNLOAD_URL, MODEL_PATH, _progress)
        print()  # newline after progress

        size_mb = os.path.getsize(MODEL_PATH) / 1024 / 1024
        logger.info("✅ Downloaded via urllib (%.1f MB).", size_mb)


# ── Start server ──────────────────────────────────────────────────────────────

def start_server():
    """Launch uvicorn programmatically."""
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    logger.info("🚀 Starting DeepFake Guard API on port %d...", port)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
    )


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    try:
        download_weights()
    except Exception as e:
        logger.error("❌ Failed to download model weights: %s", e)
        logger.warning("Server will start but model will not be loaded.")
        logger.warning("Check your Hugging Face repo: https://huggingface.co/%s/%s", HF_USERNAME, HF_REPO)

    start_server()