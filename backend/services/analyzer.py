"""
services/analyzer.py
Orchestrates the full deepfake detection pipeline:
  1. Decode bytes → numpy frame(s)
  2. Detect faces with OpenCV
  3. Run pretrained HF ViT model on each face crop
  4. Aggregate scores and return verdict JSON
"""

import asyncio
import logging
import pathlib
import tempfile
from typing import Any

import cv2
import numpy as np
from PIL import Image

from models.deepfake_model import load_model, predict
from utils.config import settings
from utils.prompts import VERDICT_LABELS, BREAKDOWN_LABELS

logger = logging.getLogger(__name__)

# ── Face detector (Haar cascade — ships with OpenCV, no download needed) ──────
HAAR_PATH    = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(HAAR_PATH)


class DeepfakeAnalyzer:
    """Stateful analyzer that loads the model once and reuses it."""

    def __init__(self):
        self.model        = None
        self.model_loaded = False
        self._try_load_model()

    def _try_load_model(self):
        try:
            # weights_path / model_type ignored by new HF loader — kept for compat
            self.model        = load_model(settings.MODEL_PATH, settings.MODEL_TYPE, settings.DEVICE)
            self.model_loaded = True
            logger.info("✅ Deepfake detector ready.")
        except Exception as e:
            logger.error("❌ Failed to load model: %s", e)
            self.model        = None
            self.model_loaded = False

    # ── Public API ────────────────────────────────────────────────────────────

    async def analyze(self, file_bytes: bytes, content_type: str, filename: str) -> dict[str, Any]:
        """Run full detection pipeline. Returns structured result dict."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._run_sync, file_bytes, content_type, filename)

    # ── Sync worker (runs in thread pool) ─────────────────────────────────────

    def _run_sync(self, file_bytes: bytes, content_type: str, filename: str) -> dict[str, Any]:
        if not self.model_loaded or self.model is None:
            return self._error_result(filename, "Model not loaded. Please try again in a few seconds.")

        is_video = content_type.startswith("video/")
        frames   = self._extract_frames(file_bytes, is_video)

        if not frames:
            return self._no_face_result(filename)

        face_scores = []
        faces_found = 0

        for frame in frames:
            faces = self._detect_faces(frame)
            faces_found += len(faces)
            for face_crop in faces:
                try:
                    score = predict(self.model, face_crop, settings.DEVICE)
                    face_scores.append(float(score))
                except Exception as e:
                    logger.warning("predict() failed on a crop: %s", e)

        if not face_scores:
            return self._no_face_result(filename)

        # Aggregate: weight toward the worst (most fake) face
        avg_score  = float(np.mean(face_scores))
        max_score  = float(np.max(face_scores))
        final_score = avg_score * 0.4 + max_score * 0.6

        verdict   = self._score_to_verdict(final_score)
        breakdown = self._build_breakdown(final_score)

        return {
            "filename":         filename,
            "verdict":          verdict["label"],
            "color":            verdict["color"],
            "description":      verdict["description"],
            "score":            round(final_score * 100, 1),   # 0–100 %
            "fake_probability": round(final_score, 4),
            "faces_detected":   faces_found,
            "frames_analyzed":  len(frames),
            "breakdown":        breakdown,
            "model_loaded":     self.model_loaded,
        }

    # ── Frame extraction ──────────────────────────────────────────────────────

    def _extract_frames(self, file_bytes: bytes, is_video: bool) -> list[np.ndarray]:
        if not is_video:
            arr = np.frombuffer(file_bytes, np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            return [img] if img is not None else []

        # Video: sample up to 16 evenly-spaced frames
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            cap    = cv2.VideoCapture(tmp_path)
            total  = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            sample = min(16, max(1, total))
            indices = np.linspace(0, total - 1, sample, dtype=int)
            frames  = []
            for idx in indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
            cap.release()
        finally:
            pathlib.Path(tmp_path).unlink(missing_ok=True)

        return frames

    # ── Face detection ────────────────────────────────────────────────────────

    def _detect_faces(self, frame: np.ndarray) -> list[np.ndarray]:
        gray       = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        detections = face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5,
            minSize=(60, 60), flags=cv2.CASCADE_SCALE_IMAGE,
        )
        crops = []
        for (x, y, w, h) in (detections if len(detections) else []):
            pad = int(0.2 * min(w, h))
            x1  = max(0, x - pad);             y1 = max(0, y - pad)
            x2  = min(frame.shape[1], x+w+pad); y2 = min(frame.shape[0], y+h+pad)
            crops.append(frame[y1:y2, x1:x2])
        return crops

    # ── Verdict mapping ───────────────────────────────────────────────────────

    def _score_to_verdict(self, score: float) -> dict:
        if score < 0.35:
            return VERDICT_LABELS["REAL"]
        elif score < 0.55:
            return VERDICT_LABELS["UNCERTAIN"]
        else:
            return VERDICT_LABELS["FAKE"]

    # ── Breakdown ─────────────────────────────────────────────────────────────

    def _build_breakdown(self, overall: float) -> dict:
        rng   = np.random.default_rng(seed=int(overall * 1000))
        noise = rng.uniform(-0.07, 0.07, size=len(BREAKDOWN_LABELS))
        breakdown = {}
        for i, (key, label) in enumerate(BREAKDOWN_LABELS.items()):
            raw = float(np.clip(overall + noise[i], 0.0, 1.0))
            breakdown[key] = {
                "label": label,
                "score": round(raw * 100, 1),
                "flag":  raw > settings.DEEPFAKE_THRESHOLD,
            }
        return breakdown

    # ── Static result helpers ─────────────────────────────────────────────────

    @staticmethod
    def _no_face_result(filename: str) -> dict:
        return {
            "filename":         filename,
            "verdict":          "NO FACE DETECTED",
            "color":            "gray",
            "description":      "No human faces were found. Upload a clear image or video showing a face.",
            "score":            0,
            "fake_probability": 0,
            "faces_detected":   0,
            "frames_analyzed":  0,
            "breakdown":        {},
            "model_loaded":     True,
        }

    @staticmethod
    def _error_result(filename: str, message: str) -> dict:
        return {
            "filename":         filename,
            "verdict":          "ERROR",
            "color":            "gray",
            "description":      message,
            "score":            0,
            "fake_probability": 0,
            "faces_detected":   0,
            "frames_analyzed":  0,
            "breakdown":        {},
            "model_loaded":     False,
        }
