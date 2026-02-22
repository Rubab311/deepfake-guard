import React from "react";
import { Shield } from "lucide-react";

export default function Loader({ message = "Analyzing media..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* Pulsing rings */}
      <div className="relative w-20 h-20">
        <span className="absolute inset-0 rounded-full border-2 border-brand-500/30 animate-ping" />
        <span className="absolute inset-2 rounded-full border-2 border-brand-500/50 animate-ping [animation-delay:0.2s]" />
        <span className="absolute inset-4 rounded-full border-2 border-brand-400 animate-spin-slow" />
        <Shield className="absolute inset-0 m-auto text-brand-400" size={24} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-white">{message}</p>
        <p className="text-sm text-gray-500 mt-1">Running AI analysis on detected faces…</p>
      </div>

      {/* Progress steps */}
      <div className="flex flex-col gap-2 w-48">
        {["Detecting faces", "Running CNN model", "Computing verdict"].map((step, i) => (
          <div key={step} className="flex items-center gap-2 text-sm">
            <span
              className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            <span className="text-gray-400">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
