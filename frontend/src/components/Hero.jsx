import React from "react";
import { Link } from "react-router-dom";
import { Shield, ChevronRight, Zap, Eye, Lock } from "lucide-react";

const FEATURES = [
  { icon: Zap,  label: "Instant Analysis",   desc: "Results in under 5 seconds" },
  { icon: Eye,  label: "Face Detection",      desc: "OpenCV-powered face localisation" },
  { icon: Lock, label: "Privacy First",       desc: "Files never stored on our servers" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24 px-4 sm:px-6">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6
                        bg-brand-600/20 border border-brand-600/30 rounded-full text-brand-400 text-sm font-medium">
          <Shield size={14} />
          AI-Powered Deepfake Detection
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Detect Deepfakes{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">
            Instantly
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload any image or video and our CNN-based AI will analyze facial patterns,
          texture artifacts, and frequency anomalies to determine authenticity.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/analyze" className="btn-primary text-base px-8 py-4">
            Analyze Media <ChevronRight size={18} />
          </Link>
          <Link to="/about" className="btn-outline text-base px-8 py-4">
            How It Works
          </Link>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="card flex flex-col items-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                <Icon size={20} className="text-brand-400" />
              </div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
