"""
models/deepfake_model.py
CNN / ViT model definitions and loader for deepfake detection.

Architecture options (controlled by MODEL_TYPE in .env):
  - "efficientnet" : EfficientNet-B0  (default, best accuracy/size trade-off)
  - "resnet"       : ResNet-50        (heavier but well-studied for forgery detection)
  - "vit"          : ViT-B/16         (transformer-based, excellent on high-res inputs)

Training: run  python train.py  to produce deepfake_efficientnet.pth
"""

import os
import logging
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import cv2

logger = logging.getLogger(__name__)

# ── Image pre-processing (ImageNet stats) ────────────────────────────────────
TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


# ── Model Wrappers ────────────────────────────────────────────────────────────

class EfficientNetDetector(nn.Module):
    """EfficientNet-B0 fine-tuned as a binary classifier (real=0, fake=1)."""

    def __init__(self):
        super().__init__()
        base = models.efficientnet_b0(weights=None)
        in_features = base.classifier[1].in_features
        # Replace final classifier with binary head
        base.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 1),     # Single logit → sigmoid → fake probability
        )
        self.model = base

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.sigmoid(self.model(x))


class ResNetDetector(nn.Module):
    """ResNet-50 fine-tuned as a binary classifier."""

    def __init__(self):
        super().__init__()
        base = models.resnet50(weights=None)
        in_features = base.fc.in_features
        base.fc = nn.Sequential(
            nn.Dropout(0.4),
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Linear(512, 1),
        )
        self.model = base

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.sigmoid(self.model(x))


class ViTDetector(nn.Module):
    """
    Vision Transformer (ViT-B/16) fine-tuned for deepfake detection.
    Requires torchvision >= 0.13.
    """

    def __init__(self):
        super().__init__()
        base = models.vit_b_16(weights=None)
        in_features = base.heads.head.in_features
        base.heads = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1),
        )
        self.model = base

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.sigmoid(self.model(x))


# ── Factory ───────────────────────────────────────────────────────────────────

MODEL_REGISTRY = {
    "efficientnet": EfficientNetDetector,
    "resnet":       ResNetDetector,
    "vit":          ViTDetector,
}


def load_model(
    weights_path: Optional[str],
    model_type: str = "efficientnet",
    device: str = "cpu",
) -> nn.Module:
    """
    Instantiate model and optionally load trained weights.

    Args:
        weights_path: Path to .pth file produced by train.py.
                      Pass None to use random weights (for testing only).
        model_type:   One of 'efficientnet', 'resnet', 'vit'.
        device:       'cpu' or 'cuda'.

    Returns:
        Model in eval mode on the requested device.
    """
    model_cls = MODEL_REGISTRY.get(model_type.lower())
    if model_cls is None:
        raise ValueError(f"Unknown model type '{model_type}'. Choose from: {list(MODEL_REGISTRY)}")

    model = model_cls()

    if weights_path and os.path.isfile(weights_path):
        state = torch.load(weights_path, map_location=device, weights_only=True)
        model.load_state_dict(state)
        logger.info("Loaded weights from %s", weights_path)
    elif weights_path:
        raise FileNotFoundError(f"Model weights not found: {weights_path}")

    model.to(device)
    model.eval()
    return model


# ── Inference ─────────────────────────────────────────────────────────────────

def predict(model: nn.Module, face_bgr: np.ndarray, device: str = "cpu") -> float:
    """
    Run a single face crop through the model.

    Args:
        model:     Loaded model in eval mode.
        face_bgr:  OpenCV BGR numpy array of the face crop.
        device:    Compute device.

    Returns:
        Fake probability in [0, 1].
    """
    # BGR → RGB → PIL
    face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(face_rgb)

    tensor = TRANSFORM(pil_img).unsqueeze(0).to(device)   # (1, 3, 224, 224)

    with torch.no_grad():
        prob = model(tensor).squeeze().item()

    return float(prob)
