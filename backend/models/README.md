# 🧠 Models

This folder stores trained model weight files (`.pth`).

---

## Model Files

| File | Architecture | Description |
|---|---|---|
| `deepfake_efficientnet.pth` | EfficientNet-B0 | Default model. Best accuracy/speed trade-off. |
| `deepfake_resnet.pth` | ResNet-50 | Heavier model, useful for ablation studies. |
| `deepfake_vit.pth` | ViT-B/16 | Transformer-based, excellent on high-res inputs. |

Model files are **NOT** committed to git because they can be 50–500 MB.

---

## Training a Model

```bash
cd backend

# Train EfficientNet (default, recommended)
python train.py --model efficientnet --epochs 20 --batch 32

# Train ResNet-50
python train.py --model resnet --epochs 25 --batch 16

# Train ViT (requires more RAM)
python train.py --model vit --epochs 15 --batch 16
```

The best checkpoint (by validation AUC) is saved automatically.

---

## Downloading Pre-trained Weights

Pre-trained weights are not included in this repo.
To use this project immediately:

1. Train using `python train.py` (requires dataset — see `datasets/README.md`)
2. **Or** download community-trained weights from model hubs like:
   - [Hugging Face Hub](https://huggingface.co/models?search=deepfake)
   - [Papers With Code](https://paperswithcode.com/task/deepfake-detection)

Then place the `.pth` file in this folder and update `MODEL_PATH` in your `.env`.

---

## Architecture Summary

```
Input face crop (224×224 RGB)
        │
   [ImageNet Normalize]
        │
   EfficientNet-B0 backbone
   (pre-trained on ImageNet)
        │
   Custom head:
     Dropout(0.3)
     Linear(1280 → 256)
     ReLU
     Dropout(0.2)
     Linear(256 → 1)
        │
     Sigmoid
        │
  fake_probability ∈ [0, 1]
```
