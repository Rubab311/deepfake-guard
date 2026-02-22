"""
models/deepfake_model.py
Uses a pretrained HuggingFace ViT model for deepfake detection.
Model: dima806/deepfake_vs_real_image_detection
Trained on ~190k real vs fake face images — no local training needed.
"""

import logging
from PIL import Image
import cv2
import numpy as np
import torch
import torch.nn as nn

logger = logging.getLogger(__name__)

# Keep MODEL_REGISTRY so train.py and config.py don't break
MODEL_REGISTRY = {
    "efficientnet": None,
    "resnet": None,
    "vit": None,
}

HF_MODEL_ID = "dima806/deepfake_vs_real_image_detection"


class HFDeepfakeDetector(nn.Module):
    """
    Wrapper around a pretrained HuggingFace ViT deepfake detector.
    Input : PIL image (RGB)
    Output: fake probability in [0, 1]
    """

    def __init__(self):
        super().__init__()
        from transformers import AutoImageProcessor, AutoModelForImageClassification

        logger.info("Loading pretrained model from HuggingFace: %s", HF_MODEL_ID)
        self.processor = AutoImageProcessor.from_pretrained(HF_MODEL_ID)
        self.hf_model  = AutoModelForImageClassification.from_pretrained(HF_MODEL_ID)
        self.hf_model.eval()

        # Log label mapping so we know which index = fake
        logger.info("Model labels: %s", self.hf_model.config.id2label)

    def forward(self, pil_img: Image.Image) -> float:
        inputs = self.processor(images=pil_img, return_tensors="pt")
        with torch.no_grad():
            logits = self.hf_model(**inputs).logits          # shape: (1, 2)
        probs = torch.softmax(logits, dim=-1)[0]             # (2,)

        # dima806 model: label 0 = "Fake", label 1 = "Real"
        # Verify with: self.hf_model.config.id2label
        id2label = self.hf_model.config.id2label
        fake_idx = next(
            (i for i, l in id2label.items() if "fake" in l.lower()), 0
        )
        return float(probs[fake_idx].item())


def load_model(weights_path=None, model_type="efficientnet", device="cpu"):
    """
    Load the pretrained HuggingFace deepfake detector.
    weights_path and model_type are kept for API compatibility but ignored.
    """
    model = HFDeepfakeDetector()
    model.eval()
    logger.info("✅ Pretrained HuggingFace deepfake detector ready.")
    return model


def predict(model: HFDeepfakeDetector, face_bgr: np.ndarray, device: str = "cpu") -> float:
    """
    Run a single face crop through the model.

    Args:
        model:    Loaded HFDeepfakeDetector instance.
        face_bgr: OpenCV BGR numpy array of the face crop.
        device:   Unused (kept for API compatibility).

    Returns:
        Fake probability in [0, 1].
    """
    face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
    pil_img  = Image.fromarray(face_rgb)
    return model(pil_img)
