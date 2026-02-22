/**
 * services/api.js
 * Centralized API client for DeepFake Guard backend.
 * Base URL is read from the VITE_API_URL env variable (set in .env)
 * or falls back to the same origin (works when FastAPI serves the frontend).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Upload a file for deepfake analysis.
 * @param {File} file
 * @param {(progress: number) => void} [onProgress] - 0–100 upload progress
 * @returns {Promise<object>} Analysis result from backend
 */
export async function analyzeFile(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid JSON response from server"));
        }
      } else {
        let msg = `Server error (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText);
          msg = err.detail ?? msg;
        } catch {}
        reject(new Error(msg));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error — is the backend running?")));
    xhr.addEventListener("timeout", () => reject(new Error("Request timed out")));

    xhr.open("POST", `${BASE_URL}/api/analyze`);
    xhr.timeout = 120_000; // 2-minute timeout for large videos
    xhr.send(formData);
  });
}

/**
 * Health check — confirms backend is up.
 */
export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error("Backend health check failed");
  return res.json();
}
