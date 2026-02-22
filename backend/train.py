"""
train.py
Training script for DeepFake Guard CNN/ViT models.

Dataset layout expected (see datasets/README.md):
    datasets/
    ├── train/
    │   ├── real/   ← authentic face images
    │   └── fake/   ← deepfake face images
    └── val/
        ├── real/
        └── fake/

Popular public datasets to fill these folders:
  • FaceForensics++ : https://github.com/ondyari/FaceForensics
  • Celeb-DF v2     : https://github.com/yuezunli/celeb-deepfakeforensics
  • DFDC            : https://ai.facebook.com/datasets/dfdc/

Usage:
    python train.py --model efficientnet --epochs 20 --batch 32

Outputs:
    models/deepfake_efficientnet.pth   (or resnet/vit depending on --model)
"""

import argparse
import os
import logging
import time

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import roc_auc_score
import numpy as np

from models.deepfake_model import MODEL_REGISTRY

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
logger = logging.getLogger(__name__)


# ── Augmentation Transforms ───────────────────────────────────────────────────

TRAIN_TRANSFORM = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

VAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


# ── Training Loop ─────────────────────────────────────────────────────────────

def train_one_epoch(model, loader, optimizer, criterion, device):
    model.train()
    total_loss, correct, n = 0.0, 0, 0
    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.float().to(device)
        optimizer.zero_grad()
        preds = model(imgs).squeeze()
        loss = criterion(preds, labels)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * len(imgs)
        correct += ((preds >= 0.5).long() == labels.long()).sum().item()
        n += len(imgs)

    return total_loss / n, correct / n


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, n = 0.0, 0, 0
    all_probs, all_labels = [], []

    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.float().to(device)
        preds = model(imgs).squeeze()
        loss = criterion(preds, labels)

        total_loss += loss.item() * len(imgs)
        correct += ((preds >= 0.5).long() == labels.long()).sum().item()
        n += len(imgs)
        all_probs.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

    auc = roc_auc_score(all_labels, all_probs) if len(set(all_labels)) > 1 else 0.0
    return total_loss / n, correct / n, auc


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Train DeepFake Guard model")
    parser.add_argument("--model",      default="efficientnet", choices=list(MODEL_REGISTRY))
    parser.add_argument("--data_dir",   default="datasets")
    parser.add_argument("--epochs",     type=int, default=20)
    parser.add_argument("--batch",      type=int, default=32)
    parser.add_argument("--lr",         type=float, default=1e-4)
    parser.add_argument("--device",     default="cpu")
    parser.add_argument("--save_dir",   default="models")
    args = parser.parse_args()

    # Validate data directories
    train_dir = os.path.join(args.data_dir, "train")
    val_dir   = os.path.join(args.data_dir, "val")
    for d in [train_dir, val_dir]:
        if not os.path.isdir(d):
            raise FileNotFoundError(
                f"Dataset directory not found: {d}\n"
                "Please download a deepfake dataset and arrange it as:\n"
                "  datasets/train/real/  datasets/train/fake/\n"
                "  datasets/val/real/    datasets/val/fake/\n"
                "See datasets/README.md for dataset sources."
            )

    # Datasets & loaders
    train_ds = datasets.ImageFolder(train_dir, transform=TRAIN_TRANSFORM)
    val_ds   = datasets.ImageFolder(val_dir,   transform=VAL_TRANSFORM)
    logger.info("Train: %d images | Val: %d images | Classes: %s",
                len(train_ds), len(val_ds), train_ds.classes)

    train_loader = DataLoader(train_ds, batch_size=args.batch, shuffle=True,  num_workers=2, pin_memory=False)
    val_loader   = DataLoader(val_ds,   batch_size=args.batch, shuffle=False, num_workers=2, pin_memory=False)

    # Model
    device = torch.device(args.device)
    model  = MODEL_REGISTRY[args.model]().to(device)
    logger.info("Model: %s on %s", args.model, device)

    # Optimizer + LR scheduler + loss
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)
    criterion = nn.BCELoss()

    os.makedirs(args.save_dir, exist_ok=True)
    best_auc  = 0.0
    save_path = os.path.join(args.save_dir, f"deepfake_{args.model}.pth")

    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        tr_loss, tr_acc = train_one_epoch(model, train_loader, optimizer, criterion, device)
        vl_loss, vl_acc, vl_auc = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        elapsed = time.time() - t0
        logger.info(
            "Epoch %02d/%02d  |  "
            "train loss=%.4f acc=%.3f  |  "
            "val loss=%.4f acc=%.3f auc=%.4f  |  %.1fs",
            epoch, args.epochs, tr_loss, tr_acc, vl_loss, vl_acc, vl_auc, elapsed,
        )

        # Save best model (highest AUC on validation)
        if vl_auc > best_auc:
            best_auc = vl_auc
            torch.save(model.state_dict(), save_path)
            logger.info("  ✅ Saved best model → %s  (auc=%.4f)", save_path, best_auc)

    logger.info("Training complete. Best AUC: %.4f. Model saved to %s", best_auc, save_path)


if __name__ == "__main__":
    main()
