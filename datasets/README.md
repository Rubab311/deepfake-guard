# 📦 Datasets

Training data for DeepFake Guard — auto-downloaded from Hugging Face.
Dataset image files are **NOT** committed to git (too large), but the download script is included.

---

## ⚡ Quick Start — Download in One Command

```bash
cd backend

# Smallest dataset (~300 MB) — great for testing the pipeline quickly
python utils/download_dataset.py --dataset deepfake-v3

# Best for training (~3 GB, 32k images, 40 deepfake techniques) ← RECOMMENDED
python utils/download_dataset.py --dataset df40-classification

# Large, diverse dataset (~5-10 GB, 10k+ images)
python utils/download_dataset.py --dataset deepfake-vs-real-v2

# Download ALL datasets and merge them together
python utils/download_dataset.py --dataset all
```

After downloading, immediately start training:
```bash
python train.py --model efficientnet --epochs 20 --batch 32
```

---

## 📊 Available Datasets

| ID | Hugging Face Repo | Size | Images | Best For |
|---|---|---|---|---|
| `deepfake-v3` | saakshigupta/deepfake-detection-dataset-v3 | ~300 MB | 527 | Quick testing |
| `deepfake-vs-real` | prithivMLmods/Deepfake-vs-Real | ~1-5 GB | ~5k | Balanced training |
| `deepfake-vs-real-v2` | prithivMLmods/Deepfake-vs-Real-v2 | ~5-10 GB | 10.8k | Production training |
| `df40-classification` | pujanpaudel/deepfake_face_classification | ~3 GB | 32k | Best coverage (40 techniques) |

All datasets are publicly available on Hugging Face with no sign-up required.

---

## 📁 Output Folder Structure

The script automatically creates this layout (required by `train.py`):

```
datasets/
├── train/
│   ├── real/        ← authentic face images (label = 1)
│   └── fake/        ← deepfake face images  (label = 0)
└── val/
    ├── real/
    └── fake/
```

---

## ⚙️ Advanced Options

```bash
# Limit images per class (good for quick experiments on limited hardware)
python utils/download_dataset.py --dataset df40-classification --max_per_class 2000

# Custom output directory
python utils/download_dataset.py --dataset deepfake-v3 --output_dir /data/myproject

# Custom validation split size (default 15%)
python utils/download_dataset.py --dataset deepfake-vs-real --val_split 0.20

# See all options
python utils/download_dataset.py --help
```

---

## 🔬 Dataset Details

### df40-classification (Recommended)
- Derived from DF40 — a state-of-the-art academic benchmark
- Covers 40 distinct deepfake techniques including DeepFaceLab, StyleGAN, StarGAN, HeyGen, FaceSwap
- 32,134 total images (16,060 real + 16,060 fake)
- Pre-split into train/val/test
- License: CC BY-NC 4.0

### deepfake-vs-real-v2
- Composite dataset built from multiple sources
- 10,800 images balanced between real and deepfake
- High visual quality suitable for EfficientNet fine-tuning
- License: Apache 2.0

### deepfake-v3
- Small curated dataset with technical and non-technical explanations per image
- Includes CAM (Class Activation Map) visualisations
- Ideal for testing the full pipeline without a long download
- License: MIT

---

## 📌 Notes

- Images are saved as JPEG (quality 92) to save disk space
- Duplicate filenames are automatically skipped on re-run
- If a dataset requires account verification on Hugging Face, the script will print the URL to accept conditions
- The sample_data/ folder contains placeholder images for CI tests only

---

## 🔗 Additional Manual Datasets (require registration)

These larger academic datasets need manual download due to licensing:

| Dataset | Size | Link |
|---|---|---|
| FaceForensics++ | ~50 GB | https://github.com/ondyari/FaceForensics |
| Celeb-DF v2 | ~2.4 GB | https://github.com/yuezunli/celeb-deepfakeforensics |
| DFDC (Facebook) | ~470 GB | https://www.kaggle.com/c/deepfake-detection-challenge |

Place these manually in datasets/train/real/ and datasets/train/fake/ and they will merge with any HF-downloaded data.
