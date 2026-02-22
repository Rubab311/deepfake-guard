# DeepFake Guard

AI-powered deepfake detection for images and videos — built with FastAPI, PyTorch, React, and TailwindCSS.

[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## Features

- **Face detection** via OpenCV DNN (deep learning-based, with Haar cascade fallback)
- **CNN inference** with EfficientNet-B0, ResNet-50, or ViT-B/16 (custom trained)
- **Pretrained deepfake detector** via HuggingFace ViT — no training required
- **Detailed breakdown** — face consistency, texture artifacts, blending boundaries, frequency anomalies
- **Camera capture** — take a live snapshot directly in the browser
- **File upload** — images (JPG, PNG, WEBP) and videos (MP4, AVI, MOV)
- **Dark-mode UI** — React + Vite + TailwindCSS
- **Login/Signup forms** (frontend UI ready, backend auth TBD)
- **Cyber Laws page** — laws by country (PK, US, UK, IN, EU) with direct complaint links
- **Help & Support page** — step-by-step abuse response guide + crisis hotlines
- **Deploy-ready** for Railway (backend) + Vercel (frontend)

---

## AI Model

DeepFake Guard supports two modes for deepfake detection:

### Option A — Pretrained HuggingFace Model (default, recommended)

The default setup uses [`dima806/deepfake_vs_real_image_detection`](https://huggingface.co/dima806/deepfake_vs_real_image_detection), a Vision Transformer (ViT) trained on ~190,000 real and fake face images.

**Advantages:**
- No training required — works immediately after deployment
- High accuracy out of the box
- Automatically downloaded from HuggingFace on first request and cached to `/tmp/hf_cache`

**How it works:**
- `models/deepfake_model.py` loads the ViT model via the `transformers` library
- `start.py` sets up the HuggingFace cache directory and starts the server — no `.pth` download needed
- First inference request after deployment takes ~15 seconds to download and cache the model

### Option B — Custom Trained Model

You can train your own EfficientNet-B0, ResNet-50, or ViT-B/16 model on a deepfake dataset and use those weights instead.

**When to use this:**
- You want to fine-tune on a specific type of deepfake
- You have domain-specific training data
- You want full control over the model architecture

**How it works:**
- Run `train.py` to produce `models/deepfake_efficientnet.pth`
- Upload the `.pth` file to your Hugging Face model repo (`Rubab311/deepfake-guard-weights`)
- `start.py` downloads it automatically on Railway startup
- Set `MODEL_TYPE=efficientnet` (or `resnet` / `vit`) in your Railway environment variables

> **Note:** Custom-trained models require a sufficiently large and balanced dataset (we recommend DF40 or FaceForensics++, ~10,000+ images minimum) and enough training epochs to avoid overfitting. An AUC of 1.0 during training is a sign of overfitting — aim for 0.85–0.95 on validation.

---

## Project Structure

```
deepfake-guard/
├── backend/
│   ├── main.py                   # FastAPI app + /api/analyze endpoint
│   ├── train.py                  # Model training script (Option B)
│   ├── start.py                  # Railway startup script
│   ├── nixpacks.toml             # Railway Nixpacks build config
│   ├── services/
│   │   └── analyzer.py           # Full detection pipeline
│   ├── models/
│   │   ├── deepfake_model.py     # Pretrained HF model + EfficientNet / ResNet / ViT definitions
│   │   └── README.md             # Model weights guide
│   ├── utils/
│   │   ├── config.py             # Env-based configuration
│   │   ├── prompts.py            # Label templates
│   │   └── download_dataset.py   # Auto-download datasets from Hugging Face
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── vercel.json               # Vercel deployment config
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── Hero.jsx
│       │   ├── UploadBox.jsx
│       │   ├── CameraCapture.jsx
│       │   ├── VerdictCard.jsx
│       │   ├── RiskMeter.jsx
│       │   └── Loader.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Analyze.jsx
│       │   ├── About.jsx
│       │   ├── FAQ.jsx
│       │   ├── CyberLaws.jsx
│       │   ├── Help.jsx
│       │   ├── Login.jsx
│       │   └── Signup.jsx
│       └── services/
│           └── api.js            # API client with progress tracking
│
├── datasets/
│   ├── README.md                 # Dataset sources + setup guide
│   └── sample_data/              # Placeholder images for testing
│
└── .gitignore
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+

### 1 — Clone the repository

```bash
git clone https://github.com/Rubab311/deepfake-guard.git
cd deepfake-guard
```

### 2 — Backend setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies (CPU-only PyTorch)
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env as needed

# Start the API server
uvicorn main:app --reload --port 8080
```

API docs available at: http://localhost:8080/docs

### 3 — Frontend setup

```bash
cd frontend

npm install

# Copy and configure env
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8080

npm run dev
```

Frontend available at: http://localhost:5173

---

## Dataset Download & Model Training

> This section applies to **Option B (custom trained model)** only. Skip if using the default pretrained HuggingFace model.

### Download datasets (auto from Hugging Face)

```bash
cd backend

# Quick test (~300 MB)
python utils/download_dataset.py --dataset deepfake-v3

# Recommended for proper training (~3 GB, 32k images, 40 techniques)
python utils/download_dataset.py --dataset df40-classification

# Download everything and merge
python utils/download_dataset.py --dataset all
```

### Train the model

```bash
# Basic training (EfficientNet, recommended)
python train.py --model efficientnet --epochs 20 --batch 32

# Train longer for better accuracy
python train.py --model efficientnet --epochs 50 --batch 32

# Try ViT transformer model
python train.py --model vit --epochs 25 --batch 16

# See all options
python train.py --help
```

Trained weights are saved to `backend/models/deepfake_efficientnet.pth`.

> **Tip:** After training, upload the `.pth` file to your Hugging Face model repo. The backend will auto-download it on startup via `start.py`.

---

## Deployment

This project is deployed as two separate services:

| Service | Platform | Purpose |
|---|---|---|
| Backend (FastAPI) | Railway | REST API + AI inference |
| Frontend (React) | Vercel | Static site + CDN |
| Pretrained Model | Hugging Face Hub | Auto-downloaded on first request (Option A) |
| Custom Weights | Hugging Face Hub | Auto-downloaded on Railway boot (Option B) |

### Backend — Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select your repo
4. Set **Root Directory** to `backend`
5. Leave Build and Start commands empty — Railway reads `nixpacks.toml` automatically
6. Add environment variables in the Railway dashboard:

```
PORT=8080
MODEL_TYPE=efficientnet
MODEL_PATH=/tmp/models/deepfake_efficientnet.pth
DEVICE=cpu
MAX_FILE_SIZE_MB=50
DEEPFAKE_THRESHOLD=0.35
CORS_ORIGINS=https://your-app.vercel.app
```

7. Go to **Settings → Networking → Generate Domain** to get your backend URL
8. Deploy!

> **Model on first request:** The pretrained HuggingFace model downloads and caches automatically on the first analyze request (~15 seconds). Subsequent requests are fast.

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable before deploying:

```
VITE_API_URL=https://your-railway-url.up.railway.app
```

4. Click **Deploy** — done in ~2 minutes!

> Every time you push to GitHub, both Railway and Vercel automatically redeploy. No manual steps needed.

---

## API Reference

### `POST /api/analyze`

Upload an image or video for deepfake detection.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | `UploadFile` | Image (jpg/png/webp) or video (mp4/avi/mov), max 50 MB |

**Response** `200 OK`:

```json
{
  "filename": "photo.jpg",
  "verdict": "DEEPFAKE DETECTED",
  "color": "red",
  "description": "High probability that this media has been AI-generated or manipulated.",
  "score": 87.3,
  "fake_probability": 0.873,
  "faces_detected": 1,
  "frames_analyzed": 1,
  "breakdown": {
    "face_consistency":    { "label": "Face Consistency",    "score": 82.1, "flag": true },
    "texture_artifacts":   { "label": "Texture Artifacts",   "score": 91.4, "flag": true },
    "blending_boundaries": { "label": "Blending Boundaries", "score": 78.9, "flag": true },
    "frequency_anomalies": { "label": "Frequency Anomalies", "score": 88.0, "flag": true },
    "temporal_coherence":  { "label": "Temporal Coherence",  "score": 85.5, "flag": true }
  },
  "model_loaded": true
}
```

### `GET /api/health`

```json
{ "status": "ok", "model_loaded": true }
```

---

## Configuration

All settings managed via environment variables in `.env` (local) or Railway dashboard (production):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server port |
| `DEBUG` | `false` | Enable debug mode |
| `MODEL_PATH` | `/tmp/models/deepfake_efficientnet.pth` | Path to custom trained weights (Option B only) |
| `MODEL_TYPE` | `efficientnet` | `efficientnet` \| `resnet` \| `vit` |
| `DEVICE` | `cpu` | `cpu` or `cuda` |
| `MAX_FILE_SIZE_MB` | `50` | Upload size limit |
| `DEEPFAKE_THRESHOLD` | `0.35` | Score threshold for FAKE verdict |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins (set to Vercel URL in production) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, TailwindCSS 3, React Router 6, Lucide Icons |
| Backend | FastAPI, Uvicorn, Python 3.13 |
| AI/ML (Pretrained) | HuggingFace Transformers, ViT (`dima806/deepfake_vs_real_image_detection`) |
| AI/ML (Custom) | PyTorch (CPU), torchvision, EfficientNet / ResNet / ViT |
| Vision | OpenCV DNN face detector, Pillow |
| Datasets | Hugging Face Hub (DF40, Celeb-DF v2, FaceForensics++) |
| Backend Hosting | Railway (Nixpacks, free tier) |
| Frontend Hosting | Vercel (global CDN, auto-deploy) |
| Model Storage | Hugging Face Hub |

---

## Improving Model Accuracy

### Using the pretrained model (Option A)

The pretrained model works well for most deepfakes. To improve results you can adjust the detection thresholds in `utils/config.py`:

```python
DEEPFAKE_THRESHOLD: float = 0.35   # lower = stricter (flags more as fake)
```

And in `services/analyzer.py`:
```python
def _score_to_verdict(self, score):
    if score < 0.3:    # REAL
    elif score < 0.45: # UNCERTAIN
    else:              # FAKE
```

### Training a custom model (Option B)

```bash
# Download more data
python utils/download_dataset.py --dataset all

# Train with more epochs
python train.py --model efficientnet --epochs 50 --batch 32

# Try a more powerful model
python train.py --model vit --epochs 25 --batch 16
```

For fastest training, use **Google Colab** with a free T4 GPU:
1. Go to [colab.research.google.com](https://colab.research.google.com)
2. Runtime → Change Runtime → **T4 GPU**
3. Upload `train.py` and `requirements.txt`
4. Run training with `--device cuda --batch 64`
5. Download the `.pth` file and upload to Hugging Face Hub

Railway will automatically use the new weights on next restart.

---

## Known Limitations

- Faces covered by a niqab, mask, or heavy occlusion cannot be analyzed — a "No Face Detected" result will be returned
- Side-profile or very small faces may not be detected
- Highly realistic deepfakes may score in the "Uncertain" range rather than "Fake" — this is expected behavior for any deepfake detector
- Detection accuracy is not 100% — always combine AI analysis with critical thinking

---

## Disclaimer

DeepFake Guard is an educational and research tool. Detection accuracy is not 100%. Do not use as the sole basis for legal, forensic, or journalistic decisions. Always combine AI analysis with critical thinking and additional evidence.

---

## License

MIT — see [LICENSE](LICENSE).
