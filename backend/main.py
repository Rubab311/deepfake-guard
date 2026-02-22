"""
DeepFake Guard - FastAPI Backend
Main entry point: serves REST API and static frontend build
"""

import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

from services.analyzer import DeepfakeAnalyzer
from utils.config import settings

# ── App init ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="DeepFake Guard API",
    description="AI-powered deepfake detection for images and videos",
    version="1.0.0",
)

# ── CORS (allow Vite dev server + Vercel preview URLs) ───────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lazy-load analyzer (loads model once) ────────────────────────────────────
analyzer = DeepfakeAnalyzer()


# ── API Routes ────────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    """Health check endpoint for Render uptime monitoring."""
    return {"status": "ok", "model_loaded": analyzer.model_loaded}


@app.post("/api/analyze")
async def analyze_media(file: UploadFile = File(...)):
    """
    Accepts an image or video upload, runs deepfake detection,
    and returns a JSON verdict with score and breakdown.
    """
    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "video/mp4", "video/avi", "video/quicktime"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Allowed: images (jpeg/png/webp) and videos (mp4/avi/mov).",
        )

    # Read file bytes
    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max allowed: {settings.MAX_FILE_SIZE_MB} MB.",
        )

    # Run analysis
    try:
        result = await analyzer.analyze(file_bytes, file.content_type, file.filename)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── Serve Frontend (React Build) ──────────────────────────────────────────────
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Catch-all: serve React SPA for any non-API route."""
        index = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index):
            return FileResponse(index)
        return JSONResponse({"detail": "Frontend not built yet."}, status_code=404)


# ── Dev entry ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8080)), reload=True)
