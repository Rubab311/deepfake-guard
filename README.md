# 🛡️ DeepFake Guard

> AI-powered deepfake detection for images and videos — built with FastAPI, PyTorch, React, and TailwindCSS.

![DeepFake Guard](https://img.shields.io/badge/stack-FastAPI%20%7C%20PyTorch%20%7C%20React%20%7C%20Tailwind-blue)
![Python](https://img.shields.io/badge/python-3.11%2B-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ Features

- 🔍 **Face detection** via OpenCV Haar cascade
- 🧠 **CNN inference** with EfficientNet-B0, ResNet-50, or ViT-B/16
- 📊 **Detailed breakdown** — face consistency, texture artifacts, blending boundaries, frequency anomalies
- 📷 **Camera capture** — take a live snapshot directly in the browser
- 📁 **File upload** — images (JPG, PNG, WEBP) and videos (MP4, AVI, MOV)
- 🎨 **Dark-mode UI** — React + Vite + TailwindCSS
- 🔐 **Login/Signup forms** (frontend UI ready, backend auth TBD)
- ⚖️ **Cyber Laws page** — laws by country (PK, US, UK, IN, EU) with direct complaint links
- 🆘 **Help & Support page** — step-by-step abuse response guide + crisis hotlines
- ☁️ **Deploy-ready** for Render (backend) + Vercel (frontend)

---

## 📁 Project Structure

```
deepfake-guard/
├── backend/
│   ├── main.py                   # FastAPI app + /api/analyze endpoint
│   ├── train.py                  # Model training script
│   ├── services/
│   │   └── analyzer.py           # Full detection pipeline
│   ├── models/
│   │   ├── deepfake_model.py     # EfficientNet / ResNet / ViT definitions
│   │   └── README.md             # Model weights guide
│   ├── utils/
│   │   ├── config.py             # Env-based configuration
│   │   └── prompts.py            # Label templates
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
│       │   ├── Login.jsx
│       │   └── Signup.jsx
│       └── services/
│           └── api.js            # Axios-based API client
│
├── datasets/
│   ├── README.md                 # Dataset sources + setup guide
│   └── sample_data/              # Tiny placeholder images for CI
│
├── Dockerfile                    # Multi-stage build
├── .dockerignore
├── render.yaml                   # Render deployment config
└── .gitignore
```

---

## 🚀 Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- (Optional) Docker Desktop

### 1 — Clone and set up environment

```bash
git clone https://github.com/yourname/deepfake-guard.git
cd deepfake-guard
```

### 2 — Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies (CPU-only PyTorch)
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env as needed

# Start the API server
uvicorn main:app --reload --port 8080
```

API docs available at: http://localhost:8080/docs

### 3 — Frontend

```bash
cd frontend

npm install

# Copy and edit env
cp .env.example .env.local
# VITE_API_URL=http://localhost:8080

npm run dev
```

Frontend available at: http://localhost:5173

---

## 🧠 Training the Model

Download a dataset first (see `datasets/README.md`), then:

```bash
cd backend

# Basic training (EfficientNet, 20 epochs)
python train.py --model efficientnet --epochs 20 --batch 32

# With custom data directory
python train.py --model efficientnet --data_dir /path/to/dataset --epochs 30

# All options
python train.py --help
```

Trained weights are saved to `backend/models/deepfake_efficientnet.pth`.

---

## 🐳 Docker

```bash
# Build
docker build -t deepfake-guard .

# Run
docker run -p 8080:8080 \
  -e CORS_ORIGINS="http://localhost:5173" \
  deepfake-guard

# With model weights mounted
docker run -p 8080:8080 \
  -v $(pwd)/backend/models:/app/models \
  deepfake-guard
```

---

## ☁️ Deployment

### Option A — Full-stack on Render (backend serves frontend)

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Select your repo → Render detects `render.yaml` automatically
4. Set environment variables in the Render dashboard:
   - `CORS_ORIGINS` → your Vercel URL (if using Option B) or `*`
   - `MODEL_PATH` → path to mounted model weights
5. Deploy!

> **Note**: Mount model weights via a Render Disk or download them in a start script.

### Option B — Split deploy (Vercel frontend + Render backend)

1. **Backend**: Follow Option A above
2. **Frontend**: Push the `frontend/` folder to a new GitHub repo (or monorepo)
3. Import into [Vercel](https://vercel.com) → Framework: Vite
4. Set `VITE_API_URL` = your Render backend URL
5. Deploy!

This gives the fastest cold starts because the static frontend is served from Vercel's CDN.

---

## 🔌 API Reference

### `POST /api/analyze`

Upload an image or video for deepfake detection.

**Request**: `multipart/form-data`
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

## 🔧 Configuration

All settings are managed via environment variables (`.env`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server port |
| `DEBUG` | `false` | Enable debug mode |
| `MODEL_PATH` | `models/deepfake_efficientnet.pth` | Path to trained weights |
| `MODEL_TYPE` | `efficientnet` | `efficientnet` \| `resnet` \| `vit` |
| `DEVICE` | `cpu` | `cpu` or `cuda` |
| `MAX_FILE_SIZE_MB` | `50` | Upload size limit |
| `DEEPFAKE_THRESHOLD` | `0.5` | Score threshold for FAKE verdict |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |

---

## 📚 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, TailwindCSS 3, React Router 6, Lucide Icons |
| Backend | FastAPI, Uvicorn, Python 3.11 |
| AI/ML | PyTorch (CPU), torchvision, EfficientNet/ResNet/ViT |
| Vision | OpenCV (headless), Pillow |
| Deployment | Docker, Render (backend), Vercel (frontend) |

---

## ⚠️ Disclaimer

DeepFake Guard is an educational and research tool.
Detection accuracy is not 100%. Do not use as the sole basis for legal, forensic, or journalistic decisions.
Always combine AI analysis with critical thinking and additional evidence.

---

## 📄 License

MIT — see [LICENSE](LICENSE).
