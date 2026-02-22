"""
utils/download_dataset.py
Auto-downloads deepfake detection datasets from Hugging Face (no auth required)
and organises them into the folder layout that train.py expects:

    datasets/
    ├── train/
    │   ├── real/
    │   └── fake/
    └── val/
        ├── real/
        └── fake/

Usage:
    python utils/download_dataset.py --dataset deepfake-faces
    python utils/download_dataset.py --dataset real-vs-fake-faces
    python utils/download_dataset.py --dataset all
"""

import argparse
import logging
import os
import random
from pathlib import Path

from PIL import Image
from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)-8s  %(message)s", datefmt="%H:%M:%S")
logger = logging.getLogger(__name__)

# ── Dataset catalogue (all open access, no login required) ───────────────────

DATASETS = {
    "deepfake-v3": {
        "repo":        "saakshigupta/deepfake-detection-dataset-v3",
        "description": "~300 MB — 527 images. Good for quick pipeline testing.",
        "fake_label":  0,
        "real_label":  1,
        "image_col":   "image",
        "label_col":   "label",
        "splits":      {"train": "train", "val": "test"},
    },
    "deepfake-faces": {
        "repo":        "Hemg/deepfake-Not_deepfake",
        "description": "~1 GB — deepfake vs real faces. No authentication required.",
        "fake_label":  1,
        "real_label":  0,
        "image_col":   "image",
        "label_col":   "label",
        "splits":      {"train": "train"},
    },
    "real-vs-fake-faces": {
        "repo":        "cmudrc/real-vs-fake-faces",
        "description": "~500 MB — GAN-generated vs real faces. No authentication required.",
        "fake_label":  0,
        "real_label":  1,
        "image_col":   "image",
        "label_col":   "label",
        "splits":      {"train": "train"},
    },
    "cifake": {
        "repo":        "datasets/cifake-real-and-ai-generated-synthetic-images",
        "description": "~2 GB — 120k images. Real photos vs AI-generated images.",
        "fake_label":  1,
        "real_label":  0,
        "image_col":   "image",
        "label_col":   "label",
        "splits":      {"train": "train", "val": "test"},
    },
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def check_dependencies():
    missing = []
    for pkg in ["datasets", "huggingface_hub"]:
        try:
            __import__(pkg.replace("-", "_"))
        except ImportError:
            missing.append(pkg)
    if missing:
        import subprocess, sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--quiet"] + missing)


def make_dirs(output_dir: Path):
    for split in ("train", "val"):
        for cls in ("real", "fake"):
            (output_dir / split / cls).mkdir(parents=True, exist_ok=True)
    logger.info("Folder structure ready in: %s", output_dir)


def save_image(pil_img: Image.Image, dest: Path, idx: int, prefix: str = "img"):
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / f"{prefix}_{idx:06d}.jpg"
    if path.exists():
        return
    try:
        pil_img.convert("RGB").save(path, "JPEG", quality=92, optimize=True)
    except Exception as e:
        logger.debug("Could not save image %d: %s", idx, e)


def download_single_dataset(dataset_id, output_dir, val_split=0.15, max_per_class=0):
    from datasets import load_dataset

    cfg = DATASETS[dataset_id]
    logger.info("━" * 60)
    logger.info("Dataset:     %s", dataset_id)
    logger.info("Source:      %s", cfg["repo"])
    logger.info("Description: %s", cfg["description"])
    logger.info("━" * 60)

    try:
        ds = load_dataset(cfg["repo"], trust_remote_code=True)
    except Exception as e:
        logger.error("Failed to load '%s': %s", cfg["repo"], e)
        logger.info("Try a different dataset or check huggingface.co/datasets/%s", cfg["repo"])
        return False

    logger.info("Available splits: %s", list(ds.keys()))

    local_data = {"train": [], "val": []}
    for local_split, hf_split in cfg["splits"].items():
        if hf_split in ds:
            local_data[local_split].extend(list(ds[hf_split]))

    # Carve out val from train if no val split exists
    if not local_data["val"] and local_data["train"]:
        logger.info("Carving out %.0f%% as validation set...", val_split * 100)
        all_data = local_data["train"]
        random.shuffle(all_data)
        cut = int(len(all_data) * val_split)
        local_data["val"]   = all_data[:cut]
        local_data["train"] = all_data[cut:]

    fake_label = cfg["fake_label"]
    real_label = cfg["real_label"]
    img_col    = cfg["image_col"]
    lbl_col    = cfg["label_col"]

    for split_name, samples in local_data.items():
        if not samples:
            continue
        logger.info("Processing %s split (%d samples)...", split_name, len(samples))
        counts = {"real": 0, "fake": 0}

        for sample in tqdm(samples, desc=f"  {split_name}", unit="img"):
            try:
                label = sample[lbl_col]
                img   = sample[img_col]

                if label == real_label or str(label).lower() in ("real", "1"):
                    cls = "real"
                elif label == fake_label or str(label).lower() in ("fake", "deepfake", "0"):
                    cls = "fake"
                else:
                    continue

                if max_per_class > 0 and counts[cls] >= max_per_class:
                    continue

                prefix = f"{dataset_id.replace('-', '_')}_{cls}"
                save_image(img, output_dir / split_name / cls, counts[cls], prefix=prefix)
                counts[cls] += 1

            except Exception as e:
                logger.debug("Skipping sample: %s", e)

        logger.info("  Saved → real: %d, fake: %d", counts["real"], counts["fake"])

    logger.info("✅ Dataset '%s' downloaded.", dataset_id)
    return True


def print_summary(output_dir: Path):
    logger.info("\n" + "━" * 60)
    logger.info("DATASET SUMMARY")
    logger.info("━" * 60)
    total = 0
    for split in ("train", "val"):
        for cls in ("real", "fake"):
            folder = output_dir / split / cls
            if folder.exists():
                count = len(list(folder.glob("*.jpg"))) + len(list(folder.glob("*.png")))
                total += count
                logger.info("  %-10s %-6s  %6d images", split, cls, count)
    logger.info("  ─────────────────────────────────")
    logger.info("  TOTAL              %6d images", total)
    logger.info("━" * 60)


def main():
    parser = argparse.ArgumentParser(description="Download deepfake datasets from Hugging Face")
    parser.add_argument("--dataset", default="deepfake-faces",
                        choices=list(DATASETS.keys()) + ["all"],
                        help="Dataset to download (default: deepfake-faces)")
    parser.add_argument("--output_dir", default="datasets")
    parser.add_argument("--val_split",  type=float, default=0.15)
    parser.add_argument("--max_per_class", type=int, default=0,
                        help="Max images per class (0 = no limit)")
    args = parser.parse_args()

    check_dependencies()
    output_dir = Path(args.output_dir)
    make_dirs(output_dir)

    to_download = list(DATASETS.keys()) if args.dataset == "all" else [args.dataset]

    success = 0
    for ds_id in to_download:
        ok = download_single_dataset(ds_id, output_dir, args.val_split, args.max_per_class)
        if ok:
            success += 1

    print_summary(output_dir)

    if success > 0:
        logger.info("\n🚀 Ready to train! Run:")
        logger.info("   python train.py --model efficientnet --epochs 20 --batch 32")
    else:
        logger.error("\n❌ No datasets downloaded successfully.")
        logger.info("Try: python utils/download_dataset.py --dataset deepfake-v3")


if __name__ == "__main__":
    main()
