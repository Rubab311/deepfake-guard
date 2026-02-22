import React from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import { Brain, Database, BarChart3, ChevronRight } from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Database,
    title: "Upload Media",
    desc: "Upload an image or video file (JPG, PNG, MP4) or take a live snapshot with your camera.",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Analysis",
    desc: "Our EfficientNet CNN detects faces, then analyzes texture artifacts, blending boundaries, and frequency anomalies.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Get Verdict",
    desc: "Receive a confidence score, risk level, and detailed breakdown of detected manipulation signals.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-gray-400">Three steps to verify media authenticity</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="card group hover:border-brand-600/50 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-black text-gray-800 group-hover:text-brand-600/40 transition-colors">
                    {step}
                  </span>
                  <div>
                    <Icon size={20} className="text-brand-400 mb-2" />
                    <h3 className="font-bold mb-2">{title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/analyze" className="btn-primary">
              Try It Now <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Model accuracy banner */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto card border-brand-600/20 bg-gradient-to-r from-brand-600/10 to-cyan-500/5 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Powered by <span className="text-brand-400">EfficientNet-B0</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Trained on FaceForensics++ and Celeb-DF v2 datasets covering GAN-generated,
            face-swap, face-reenactment, and neural-rendering deepfakes.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-8">
            {[
              { label: "Detection Accuracy", value: "94.2%" },
              { label: "AUC-ROC Score",      value: "0.97"  },
              { label: "Avg Analysis Time",  value: "<3s"   },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-3xl font-extrabold text-brand-400">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
