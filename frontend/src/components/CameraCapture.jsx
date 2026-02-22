import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Circle, StopCircle, X } from "lucide-react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [error, setError] = useState(null);

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      setStream(s);
      setActive(true);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions and try again.");
    }
  }, []);

  // Attach stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Stop stream
  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setActive(false);
  }, [stream]);

  // Capture snapshot
  const capture = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const url  = URL.createObjectURL(blob);
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setCapturedUrl(url);
      onCapture(file);
      stopCamera();
    }, "image/jpeg", 0.92);
  }, [onCapture, stopCamera]);

  return (
    <div className="w-full">
      {error && (
        <p className="text-sm text-danger-400 bg-danger-500/10 border border-danger-500/20 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {!active && !capturedUrl && (
        <button onClick={startCamera} className="btn-outline w-full justify-center gap-2">
          <Camera size={18} /> Open Camera
        </button>
      )}

      {active && (
        <div className="relative rounded-2xl overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-2xl" />
          {/* Scan overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 h-8 scan-line opacity-60" />
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button onClick={capture} className="btn-primary rounded-full w-14 h-14 flex items-center justify-center p-0">
              <Circle size={22} />
            </button>
            <button onClick={stopCamera} className="p-3 rounded-full bg-gray-800/80 text-gray-400 hover:text-white">
              <StopCircle size={22} />
            </button>
          </div>
        </div>
      )}

      {capturedUrl && (
        <div className="relative card">
          <button
            onClick={() => { setCapturedUrl(null); onCapture(null); }}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400"
          >
            <X size={16} />
          </button>
          <img src={capturedUrl} alt="Captured" className="w-full rounded-xl max-h-64 object-contain" />
          <p className="text-xs text-gray-500 mt-2 text-center">Snapshot captured — click Analyze</p>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
