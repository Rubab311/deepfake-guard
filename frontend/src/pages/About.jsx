import React from "react";
import { Brain, Cpu, Database, Award } from "lucide-react";

const SECTIONS = [
  {
    icon: Brain,
    title: "The Technology",
    body: `DeepFake Guard uses EfficientNet-B0, a highly efficient convolutional neural network, 
    fine-tuned specifically for deepfake detection. The model analyzes facial regions for subtle 
    artifacts introduced during the generation or manipulation process — including texture inconsistencies, 
    unnatural blending boundaries, and frequency-domain anomalies that are invisible to the human eye.`,
  },
  {
    icon: Database,
    title: "Training Data",
    body: `The model is trained on FaceForensics++ (4 manipulation methods) and Celeb-DF v2 
    (high-quality celebrity deepfakes). Both datasets contain thousands of real and fake video 
    sequences, providing balanced and diverse training signal. Data augmentation (flipping, 
    color jitter, random crops) is applied to improve generalization.`,
  },
  {
    icon: Cpu,
    title: "Architecture",
    body: `Three model variants are available: EfficientNet-B0 (default), ResNet-50, and 
    Vision Transformer (ViT-B/16). All are fine-tuned as binary classifiers outputting a 
    fake probability score. Face detection uses OpenCV's Haar cascade for speed and 
    compatibility with CPU-only inference.`,
  },
  {
    icon: Award,
    title: "Limitations",
    body: `No deepfake detector is perfect. Our system is most reliable on frontal, 
    well-lit images with clearly visible faces. Extremely low-resolution inputs, heavy 
    compression, or non-face media may reduce accuracy. Always combine AI detection 
    with critical thinking and context.`,
  },
];

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold mb-3">About DeepFake Guard</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          An open-source AI tool for detecting AI-generated and manipulated faces in digital media.
        </p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-brand-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2">{title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 card border-brand-600/20 bg-brand-600/5 text-center">
        <p className="text-sm text-gray-400">
          Built with <span className="text-white font-medium">FastAPI + PyTorch + React + Vite + TailwindCSS</span>.
          For educational and research use. Not for law enforcement purposes.
        </p>
      </div>
    </div>
  );
}
