import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, FileImage, FileVideo, X } from "lucide-react";

const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4,video/avi,video/quicktime";

export default function UploadBox({ onFileSelected }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setFileInfo({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2), type: file.type });

    // Show image preview (skip for video)
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
    onFileSelected(file);
  }, [onFileSelected]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setPreview(null);
    setFileInfo(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileSelected(null);
  };

  return (
    <div className="w-full">
      {!fileInfo ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4
                      cursor-pointer transition-all duration-200
                      ${dragging
                        ? "border-brand-500 bg-brand-500/10"
                        : "border-gray-700 bg-gray-900 hover:border-brand-600 hover:bg-gray-800/50"
                      }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-600/20 flex items-center justify-center">
            <UploadCloud size={32} className="text-brand-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white mb-1">Drop your file here</p>
            <p className="text-sm text-gray-500">or <span className="text-brand-400">click to browse</span></p>
          </div>
          <div className="flex gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1"><FileImage size={12} /> JPG, PNG, WEBP</span>
            <span className="flex items-center gap-1"><FileVideo size={12} /> MP4, AVI, MOV</span>
          </div>
          <p className="text-xs text-gray-600">Max file size: 50 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="card relative">
          <button
            onClick={clearFile}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-contain rounded-xl mb-4 bg-gray-950"
            />
          )}

          <div className="flex items-center gap-3">
            {fileInfo.type.startsWith("image/") ? (
              <FileImage size={20} className="text-brand-400 shrink-0" />
            ) : (
              <FileVideo size={20} className="text-brand-400 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{fileInfo.name}</p>
              <p className="text-xs text-gray-500">{fileInfo.size} MB · {fileInfo.type}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
