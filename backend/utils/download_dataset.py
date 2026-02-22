"""
utils/download_dataset.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-downloads real deepfake detection datasets from Hugging Face and
organises them into the folder layout that train.py expects:

    datasets/
    ├── train/
    │   ├── real/   ← authentic face images
    │   └── fake/   ← deepfake face images
    └── val/
        ├── real/
        └── fake/

Supported datasets (choose with --dataset flag):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ID                               HF Repo                                   Size
  ─────────────────────────────────────────────────────────────────────────────
  deepfake-vs-real      prithivMLmods/Deepfake-vs-Real               ~1-5 GB
  deepfake-vs-real-v2   prithivMLmods/Deepfake-vs-Real-v2            ~5-10 GB
  df40-classification   pujanpaudel/deepfake_face_classification      ~3 GB
  deepfake-v3           saakshigupta/deepfake-detection-dataset-v3   ~300 MB (small, good for testing)
  all                   Downloads ALL of the above and merges them
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage:
    # Quick start — small dataset, good for testing the pipeline
    python utils/download_dataset.py --dataset deepfake-v3

    # Recommended — best quality/size trade-off (10k+ images, 40 deepfake techniques)
    python utils/download_dataset.py --dataset df40-classification

    # Large — most diverse, best for production training
    python utils/download_dataset.py --dataset deepfake-vs-real-v2

    # Download everything and merge
    python utils/download_dataset.py --dataset all

    # Custom output directory
    python utils/download_dataset.py --dataset df40-classification --output_dir /data/deepfake

    # Custom train/val split ratio
    python utils/download_dataset.py --dataset deepfake-v3 --val_split 0.20

Requirements (added to requirements.txt automatically if missing):
    pip install datasets huggingface_hub Pillow tqdm
"""

import argparse
import logging
import os
import shutil
import sys
from pathlib import Path

from PIL import Image
from tqdm import tqdm

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# ── Dataset catalogue ─────────────────────────────────────────────────────────

DATASETS = {
    "deepfake-v3": {
        "repo":        "saakshigupta/deepfake-detection-dataset-v3",
        "description": "300 MB — 527 images, PNG, with technical explanations. Great for quick tests.",
        # label mapping: 0=fake, 1=real
        "fake_label":  0,
        "real_label":  1,
        "image_col":   "image",
        "label_col":   "label",
        "splits":      {"train": "train", "val": "test"},   # HF split → local split
    },
    "deepfake-vs-real": {
        "repo":        "prithivMLmods/Deepfake-vs-Real",
        "description": "1–5 GB — diverse high-quality deepfake vs real face images.",
        "fake_label":  0,
        "real_label":  1,
        "image_col":   "image",
        "label_col":   "label",
        "splits":      {"train": "train"},
    },
    "deepfake-vs-real-v2": {
        "repo":        "prithivMLmods/Deepfake-vs-Real-v2",
        "description": "5–10 GB — 10.8k images, expanded version with more variety.",
        "fake_label":  0,
        "real_label":  1,
        "image_col":   "image",
        "label_col":   "label",
        "splits":      {"train": "train"},
    },
    "df40-classification": {
        "repo":        "pujanpaudel/deepfake_face_classification",
        "description": "~3 GB — 32k images from DF40 dataset covering 40 deepfake techniques. Best for training.",
        "fake_label":  0,   # DF40: 0=fake, 1=real (verify on download)
        "real_label":  1,
        "image_col":   "image",
        "label_col":   "label",
        "splits":      {"train": "train", "val": "val", "test": "test"},
    },
}


# ── Core download logic ───────────────────────────────────────────────────────

def check_dependencies():
    """Ensure required packages are installed."""
    missing = []
    for pkg in ["datasets", "huggingface_hub"]:
        try:
            __import__(pkg.replace("-", "_"))
        except ImportError:
            missing.append(pkg)

    if missing:
        logger.error("Missing packages: %s", ", ".join(missing))
        logger.info("Installing now...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--quiet"] + missing)
        logger.info("Packages installed. Continuing...")


def make_dirs(output_dir: Path):
    """Create the required folder structure."""
    for split in ("train", "val"):
        for cls in ("real", "fake"):
            (output_dir / split / cls).mkdir(parents=True, exist_ok=True)
    logger.info("Created folder structure in: %s", output_dir)


def save_image(pil_img: Image.Image, dest: Path, idx: int, prefix: str = "img"):
    """Save a PIL image to disk as JPEG."""
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / f"{prefix}_{idx:06d}.jpg"
    if path.exists():
        return  # skip duplicates
    try:
        pil_img.convert("RGB").save(path, "JPEG", quality=92, optimize=True)
    except Exception as e:
        logger.warning("Could not save image %d: %s", idx, e)


def download_single_dataset(
    dataset_id: str,
    output_dir: Path,
    val_split: float = 0.15,
    max_per_class: int = 0,       # 0 = no limit
):
    """
    Download a single HuggingFace dataset and save to output_dir.

    Args:
        dataset_id:   Key from DATASETS dict
        output_dir:   Root output path (datasets/)
        val_split:    Fraction to use as validation if no val split exists in HF dataset
        max_per_class: Maximum images per class per split (0 = unlimited)
    """
    from datasets import load_dataset  # imported here after dependency check

    cfg = DATASETS[dataset_id]
    logger.info("━" * 60)
    logger.info("Downloading: %s", dataset_id)
    logger.info("Source:      %s", cfg["repo"])
    logger.info("Description: %s", cfg["description"])
    logger.info("━" * 60)

    # ── Load dataset ──────────────────────────────────────────────────────────
    try:
        ds = load_dataset(cfg["repo"], trust_remote_code=True)
    except Exception as e:
        logger.error("Failed to load dataset '%s': %s", cfg["repo"], e)
        logger.info("This dataset may require you to accept conditions on huggingface.co first.")
        logger.info("Visit: https://huggingface.co/datasets/%s", cfg["repo"])
        return False

    logger.info("Available splits: %s", list(ds.keys()))

    # ── Determine local split assignment ─────────────────────────────────────
    # Map HF split names → local split names (train/val)
    hf_splits  = cfg["splits"]       # e.g. {"train":"train", "val":"test"}
    local_data = {"train": [], "val": []}

    for local_split, hf_split in hf_splits.items():
        if hf_split in ds:
            local_data[local_split].extend(list(ds[hf_split]))
        else:
            logger.warning("Split '%s' not found in dataset — skipping.", hf_split)

    # If dataset has only a "train" split, carve out val manually
    if not local_data["val"] and local_data["train"]:
        logger.info("No val split found — carving out %.0f%% as validation.", val_split * 100)
        import random
        all_data = local_data["train"]
        random.shuffle(all_data)
        cut = int(len(all_data) * val_split)
        local_data["val"]   = all_data[:cut]
        local_data["train"] = all_data[cut:]

    # ── Save images ───────────────────────────────────────────────────────────
    fake_label = cfg["fake_label"]
    real_label = cfg["real_label"]
    img_col    = cfg["image_col"]
    lbl_col    = cfg["label_col"]

    total_saved = {"train": {"real": 0, "fake": 0}, "val": {"real": 0, "fake": 0}}

    for split_name, samples in local_data.items():
        if not samples:
            continue

        logger.info("\nProcessing %s split (%d samples)...", split_name, len(samples))

        counts = {"real": 0, "fake": 0}

        for sample in tqdm(samples, desc=f"  {split_name}", unit="img"):
            try:
                label = sample[lbl_col]
                img   = sample[img_col]

                # Determine class
                if label == real_label or str(label).lower() in ("real", "1"):
                    cls = "real"
                elif label == fake_label or str(label).lower() in ("fake", "deepfake", "0"):
                    cls = "fake"
                else:
                    continue   # unknown label — skip

                # Enforce max_per_class limit
                if max_per_class > 0 and counts[cls] >= max_per_class:
                    continue

                dest = output_dir / split_name / cls
                prefix = f"{dataset_id.replace('-', '_')}_{cls}"
                save_image(img, dest, counts[cls], prefix=prefix)
                counts[cls] += 1
                total_saved[split_name][cls] += 1

            except Exception as e:
                logger.debug("Skipping sample due to error: %s", e)
                continue

        logger.info("  Saved → real: %d, fake: %d", counts["real"], counts["fake"])

    logger.info("\n✅ Dataset '%s' downloaded successfully.", dataset_id)
    return True


def print_summary(output_dir: Path):
    """Print final dataset statistics."""
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
    logger.info("Output directory: %s", output_dir.resolve())


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Download deepfake detection datasets from Hugging Face",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python utils/download_dataset.py --dataset deepfake-v3
  python utils/download_dataset.py --dataset df40-classification
  python utils/download_dataset.py --dataset all --output_dir /data/deepfake
  python utils/download_dataset.py --dataset deepfake-vs-real --max_per_class 5000
        """,
    )
    parser.add_argument(
        "--dataset",
        default="deepfake-v3",
        choices=list(DATASETS.keys()) + ["all"],
        help="Which dataset to download (default: deepfake-v3 — smallest, great for testing)",
    )
    parser.add_argument(
        "--output_dir",
        default="datasets",
        help="Root output directory (default: datasets/)",
    )
    parser.add_argument(
        "--val_split",
        type=float,
        default=0.15,
        help="Fraction of training data to use as validation if no val split exists (default: 0.15)",
    )
    parser.add_argument(
        "--max_per_class",
        type=int,
        default=0,
        help="Max images per class per split. 0 = no limit. Use e.g. 3000 for quick experiments.",
    )
    args = parser.parse_args()

    # ── Pre-flight ────────────────────────────────────────────────────────────
    check_dependencies()

    output_dir = Path(args.output_dir)
    make_dirs(output_dir)

    # ── Download ──────────────────────────────────────────────────────────────
    to_download = list(DATASETS.keys()) if args.dataset == "all" else [args.dataset]

    success_count = 0
    for ds_id in to_download:
        ok = download_single_dataset(
            ds_id,
            output_dir,
            val_split=args.val_split,
            max_per_class=args.max_per_class,
        )
        if ok:
            success_count += 1

    # ── Summary ───────────────────────────────────────────────────────────────
    print_summary(output_dir)

    if success_count == len(to_download):
        logger.info("\n🚀 Ready to train! Run:")
        logger.info("   python train.py --model efficientnet --epochs 20 --batch 32")
    else:
        logger.warning("\n⚠️  Some datasets failed. Check errors above.")
        logger.info("You may need to accept dataset conditions at huggingface.co")


if __name__ == "__main__":
    main()
