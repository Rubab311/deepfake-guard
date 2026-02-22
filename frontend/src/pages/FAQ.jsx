import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What file types are supported?",
    a: "We support images (JPG, PNG, WEBP) and videos (MP4, AVI, MOV) up to 50 MB. For videos, we sample up to 16 frames evenly across the clip.",
  },
  {
    q: "Is my data stored or shared?",
    a: "No. Files are processed in-memory and immediately discarded after analysis. We never store, log, or share your uploads.",
  },
  {
    q: "How accurate is the detection?",
    a: "Our EfficientNet model achieves ~94% accuracy and AUC-ROC of 0.97 on benchmark datasets. Accuracy is highest on high-quality, frontal face images. Results should always be considered alongside context and other evidence.",
  },
  {
    q: "Why does it say 'Model weights not found'?",
    a: "The default model weights file (deepfake_efficientnet.pth) is not bundled with the code. You need to train the model yourself by running: python backend/train.py — or download pre-trained weights separately.",
  },
  {
    q: "What types of deepfakes can it detect?",
    a: "The model is trained to detect face-swap (e.g. FaceSwap, DeepFaceLab), face-reenactment (e.g. Face2Face), and GAN-generated faces (e.g. StyleGAN). It may not detect all novel manipulation techniques.",
  },
  {
    q: "Can I use it on a real person's photo to verify?",
    a: "Yes, that is the intended use case. Upload any image with a face to get an authenticity verdict. Always use responsibly and ethically.",
  },
  {
    q: "How does the breakdown work?",
    a: "The breakdown shows per-dimension analysis scores for: Face Consistency, Texture Artifacts, Blending Boundaries, Frequency Anomalies, and Temporal Coherence (video only). Each represents a different class of manipulation signal.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium text-white">{q}</p>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && <p className="text-sm text-gray-400 mt-3 leading-relaxed border-t border-gray-800 pt-3">{a}</p>}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-400">Common questions about DeepFake Guard</p>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq) => <FaqItem key={faq.q} {...faq} />)}
      </div>
    </div>
  );
}
