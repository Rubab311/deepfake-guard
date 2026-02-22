import React, { useState, useCallback } from "react";
import { Upload, Camera, RotateCcw, AlertTriangle } from "lucide-react";
import UploadBox from "../components/UploadBox";
import CameraCapture from "../components/CameraCapture";
import VerdictCard from "../components/VerdictCard";
import Loader from "../components/Loader";
import { analyzeFile } from "../services/api";

const TAB = { UPLOAD: "upload", CAMERA: "camera" };

export default function Analyze() {
  const [tab,      setTab]      = useState(TAB.UPLOAD);
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  const handleFileSelected = useCallback((f) => {
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const data = await analyzeFile(file, setProgress);
      setResult(data);
    } catch (err) {
      setError(err.message ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-2">Analyze Media</h1>
        <p className="text-gray-400">Upload an image or video to check for deepfake manipulation.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-2xl p-1.5 mb-6">
        <button
          onClick={() => setTab(TAB.UPLOAD)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${tab === TAB.UPLOAD ? "bg-brand-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
        >
          <Upload size={16} /> Upload File
        </button>
        <button
          onClick={() => setTab(TAB.CAMERA)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${tab === TAB.CAMERA ? "bg-brand-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
        >
          <Camera size={16} /> Use Camera
        </button>
      </div>

      {/* Input area */}
      {!loading && !result && (
        <>
          {tab === TAB.UPLOAD
            ? <UploadBox onFileSelected={handleFileSelected} />
            : <CameraCapture onCapture={handleFileSelected} />
          }

          {/* Analyze button */}
          {file && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full justify-center mt-4 text-base py-4"
            >
              Run Deepfake Analysis
            </button>
          )}
        </>
      )}

      {/* Loading state */}
      {loading && (
        <>
          <Loader message="Analyzing media…" />
          {progress > 0 && progress < 100 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading…</span><span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Error state */}
      {error && (
        <div className="card border-danger-500/30 bg-danger-500/10 flex items-start gap-3">
          <AlertTriangle size={20} className="text-danger-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-danger-400 mb-1">Analysis Failed</p>
            <p className="text-sm text-gray-300">{error}</p>
            <button onClick={reset} className="btn-outline text-sm mt-3 py-2 gap-1.5">
              <RotateCcw size={14} /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <VerdictCard result={result} />
          <button onClick={reset} className="btn-outline w-full justify-center mt-4 gap-2">
            <RotateCcw size={16} /> Analyze Another File
          </button>
        </>
      )}
    </div>
  );
}
