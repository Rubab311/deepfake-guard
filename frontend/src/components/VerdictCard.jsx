import React from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Users, Film } from "lucide-react";
import RiskMeter from "./RiskMeter";

const ICONS = {
  green:  { icon: ShieldCheck,    bg: "bg-safe-500/20",   border: "border-safe-500/30",   text: "text-safe-400"   },
  red:    { icon: ShieldAlert,    bg: "bg-danger-500/20", border: "border-danger-500/30", text: "text-danger-400" },
  yellow: { icon: ShieldQuestion, bg: "bg-warn-500/20",   border: "border-warn-500/30",   text: "text-warn-400"   },
  gray:   { icon: ShieldQuestion, bg: "bg-gray-700/30",   border: "border-gray-600/30",   text: "text-gray-400"   },
};

export default function VerdictCard({ result }) {
  if (!result) return null;

  const config = ICONS[result.color] ?? ICONS.gray;
  const Icon   = config.icon;

  return (
    <div className={`card border ${config.border} ${config.bg}`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-14 h-14 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center`}>
          <Icon size={28} className={config.text} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Verdict</p>
          <h2 className={`text-2xl font-extrabold ${config.text}`}>{result.verdict}</h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-6 leading-relaxed">{result.description}</p>

      {/* Risk meter */}
      <div className="mb-6">
        <RiskMeter score={result.score} />
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-800/60 rounded-xl px-4 py-3 flex items-center gap-2">
          <Users size={16} className="text-brand-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Faces Detected</p>
            <p className="font-bold">{result.faces_detected}</p>
          </div>
        </div>
        <div className="bg-gray-800/60 rounded-xl px-4 py-3 flex items-center gap-2">
          <Film size={16} className="text-brand-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Frames Analyzed</p>
            <p className="font-bold">{result.frames_analyzed}</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {Object.keys(result.breakdown || {}).length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Detection Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(result.breakdown).map(([key, dim]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{dim.label}</span>
                  <span className={`font-semibold ${dim.flag ? "text-danger-400" : "text-safe-400"}`}>
                    {dim.score.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${dim.flag ? "bg-danger-500" : "bg-safe-500"}`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result.model_loaded && (
        <div className="mt-4 text-xs text-warn-400 bg-warn-500/10 border border-warn-500/20 rounded-xl px-4 py-3">
          ⚠️ Model weights not found. Run <code className="font-mono">python train.py</code> to train the model first.
        </div>
      )}
    </div>
  );
}
