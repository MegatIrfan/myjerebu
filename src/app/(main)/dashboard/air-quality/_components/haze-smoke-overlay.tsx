"use client";

import React from "react";
import type { SimulationDay } from "./haze-simulation-data";

interface HazeSmokeOverlayProps {
  simulationDay: SimulationDay | null;
  isSimulationActive: boolean;
}

export function HazeSmokeOverlay({
  simulationDay,
  isSimulationActive,
}: HazeSmokeOverlayProps) {
  if (!isSimulationActive || !simulationDay) return null;

  const intensity = simulationDay.hazeIntensity; // 0 to 1

  return (
    <div className="pointer-events-none absolute inset-0 z-[350] overflow-hidden rounded-2xl transition-all duration-700">
      {/* Dynamic Atmospheric Smoke / Haze Shader Plume */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: Math.min(0.85, intensity * 0.95),
          background: `
            radial-gradient(ellipse 65% 55% at 28% 58%, rgba(180, 115, 30, ${0.45 * intensity}) 0%, rgba(140, 85, 20, ${0.3 * intensity}) 40%, transparent 80%),
            radial-gradient(ellipse 55% 45% at 75% 68%, rgba(195, 100, 25, ${0.5 * intensity}) 0%, rgba(130, 65, 15, ${0.35 * intensity}) 45%, transparent 80%),
            radial-gradient(ellipse 45% 40% at 20% 45%, rgba(160, 110, 40, ${0.35 * intensity}) 0%, transparent 75%),
            linear-gradient(to top right, rgba(160, 95, 30, ${0.2 * intensity}) 0%, rgba(120, 80, 20, ${0.12 * intensity}) 50%, transparent 100%)
          `,
          filter: "blur(22px)",
          animation: "haze-organic-drift 12s ease-in-out infinite alternate",
        }}
      />

      {/* Floating Animated Smoke Clouds (West Coast & Sarawak) */}
      {intensity > 0.3 && (
        <>
          {/* Cloud 1: Straits of Malacca / Klang Valley */}
          <div
            className="absolute rounded-full transition-all duration-1000"
            style={{
              left: "14%",
              top: "35%",
              width: "35%",
              height: "45%",
              background: `radial-gradient(circle, rgba(175, 110, 35, ${0.45 * intensity}) 0%, rgba(140, 80, 20, ${0.25 * intensity}) 50%, transparent 80%)`,
              filter: "blur(28px)",
              animation: "haze-swirl-west 9s linear infinite",
            }}
          />

          {/* Cloud 2: Sarawak / West Borneo Border */}
          <div
            className="absolute rounded-full transition-all duration-1000"
            style={{
              left: "58%",
              top: "48%",
              width: "38%",
              height: "45%",
              background: `radial-gradient(circle, rgba(200, 90, 25, ${0.55 * intensity}) 0%, rgba(150, 60, 15, ${0.3 * intensity}) 55%, transparent 80%)`,
              filter: "blur(30px)",
              animation: "haze-swirl-east 11s linear infinite",
            }}
          />
        </>
      )}

      {/* Wind Flow Streamlines (Visual Particle Vector Indicators) */}
      <svg className="absolute inset-0 size-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="windGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6 * intensity} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1 * intensity} />
          </linearGradient>
        </defs>
        {intensity > 0.25 && (
          <>
            {/* Wind Trajectory Path 1 (Sumatra -> West Coast) */}
            <path
              d="M 120 480 Q 220 380 290 260"
              fill="none"
              stroke="url(#windGrad)"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              style={{ animation: "wind-dash 1.8s linear infinite" }}
            />
            {/* Wind Trajectory Path 2 (Kalimantan -> Kuching) */}
            <path
              d="M 520 540 Q 640 440 710 350"
              fill="none"
              stroke="url(#windGrad)"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              style={{ animation: "wind-dash 1.4s linear infinite" }}
            />
          </>
        )}
      </svg>
    </div>
  );
}
