"""
start.py
Railway startup script for DeepFake Guard backend.
Downloads model weights from Hugging Face BEFORE starting the server.
"""

import os
import sys
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
HF_USERNAME  = "Rubab311"
HF_REPO      = "deepfake-guard-weights"
MODEL_FILE   = "deepfake_efficientnet.pth"
MODELS_DIR   = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH   = os.path.join(MODELS_DIR, MODEL_FILE)
HF_REPO_ID   = f"{HF_USERNAME}/{HF_REPO}"


# ── Download weights ──────────────────────────────────────────────────────────
def download_weights():
    os.makedirs(MODELS_DIR, exist_ok=True)

    if os.path.isfile(MODEL_PATH):
        size_mb = os.path.getsize(MODEL_PATH) / 1024 / 1024
        logger.info("Model weights already exist (%.1f MB) — skipping download.", size_mb)
        return True

    logger.info("Downloading model weights from Hugging Face...")
    logger.info("Repo: %s  File: %s", HF_REPO_ID, MODEL_FILE)

    # Method 1 — huggingface_hub
    try:
        from huggingface_hub import hf_hub_download
        logger.info("Using huggingface_hub...")

        path = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=MODEL_FILE,
            local_dir=MODELS_DIR,
        )

        import shutil
        if os.path.abspath(path) != os.path.abspath(MODEL_PATH):
            shutil.copy2(path, MODEL_PATH)

        size_mb = os.path.getsize(MODEL_PATH) / 1024 / 1024
        logger.info("Downloaded successfully (%.1f MB)", size_mb)
        return True

    except Exception as e:
        logger.warning("huggingface_hub failed: %s — trying urllib...", e)

    # Method 2 — urllib fallback
    try:
        import urllib.request
        url = f"https://huggingface.co/{HF_REPO_ID}/resolve/main/{MODEL_FILE}"
        logger.info("Downloading via urllib from: %s", url)

        start = time.time()
        urllib.request.urlretrieve(url, MODEL_PATH)
        elapsed = time.time() - start

        size_mb = os.path.getsize(MODEL_PATH) / 1024 / 1024
        logger.info("Downloaded via urllib (%.1f MB in %.1fs)", size_mb, elapsed)
        return True

    except Exception as e:
        logger.error("urllib download failed: %s", e)
        return False


# ── Verify file ───────────────────────────────────────────────────────────────
def verify_weights():
    if not os.path.isfile(MODEL_PATH):
        return False
    size = os.path.getsize(MODEL_PATH)
    if size < 1024 * 1024:
        logger.error("Downloaded file too small (%d bytes) — likely corrupt.", size)
        os.remove(MODEL_PATH)
        return False
    logger.info("Weights file verified (%.1f MB)", size / 1024 / 1024)
    return True


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
    logger.info("=" * 50)

    success = download_weights()
    if success:
        success = verify_weights()

    if not success:
        logger.warning("Model weights could not be loaded.")
        logger.warning("Server will start but analysis will return errors.")
    else:
        logger.info("Model weights ready — starting server now.")

    logger.info("=" * 50)
    start_server()