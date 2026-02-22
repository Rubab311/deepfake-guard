import React from "react";

/**
 * RiskMeter – horizontal bar showing fake probability.
 * score: 0–100 (higher = more likely fake)
 */
export default function RiskMeter({ score }) {
  const pct = Math.min(100, Math.max(0, score));

  // Color based on score
  const color =
    pct < 35 ? "bg-safe-500"
    : pct < 55 ? "bg-warn-500"
    : "bg-danger-500";

  const label =
    pct < 35 ? "Low Risk"
    : pct < 55 ? "Uncertain"
    : "High Risk";

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400 font-medium">Risk Level</span>
        <span className={`font-bold ${pct < 35 ? "text-safe-400" : pct < 55 ? "text-warn-400" : "text-danger-400"}`}>
          {label} — {pct.toFixed(1)}%
        </span>
      </div>

      {/* Track */}
      <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">
        {/* Gradient fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>Real (0%)</span>
        <span>Uncertain (50%)</span>
        <span>Fake (100%)</span>
      </div>
    </div>
  );
}
