"""
utils/prompts.py
Prompt/label templates used for result formatting.
"""

VERDICT_LABELS = {
    "FAKE": {
        "label": "DEEPFAKE DETECTED",
        "color": "red",
        "description": "High probability that this media has been AI-generated or manipulated.",
    },
    "REAL": {
        "label": "AUTHENTIC",
        "color": "green",
        "description": "No significant deepfake artifacts detected. Media appears authentic.",
    },
    "UNCERTAIN": {
        "label": "INCONCLUSIVE",
        "color": "yellow",
        "description": "Confidence is low. Manual review recommended.",
    },
}

BREAKDOWN_LABELS = {
    "face_consistency": "Face Consistency",
    "texture_artifacts": "Texture Artifacts",
    "blending_boundaries": "Blending Boundaries",
    "frequency_anomalies": "Frequency Anomalies",
    "temporal_coherence": "Temporal Coherence (video only)",
}
