"use client";

import React from "react";
import {
  Compass,
  FastForward,
  Flame,
  Gauge,
  Info,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sparkles,
  Wind,
  Power,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HAZE_SIMULATION_DAYS, type SimulationDay } from "./haze-simulation-data";

interface HazeSimulationTimelineProps {
  isSimulationActive: boolean;
  onToggleSimulation: (active: boolean) => void;
  currentDayIndex: number;
  onSelectDayIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function HazeSimulationTimeline({
  isSimulationActive,
  onToggleSimulation,
  currentDayIndex,
  onSelectDayIndex,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
}: HazeSimulationTimelineProps) {
  const currentDay = HAZE_SIMULATION_DAYS[currentDayIndex] || HAZE_SIMULATION_DAYS[0];

  const handlePrev = () => {
    onSelectDayIndex((currentDayIndex - 1 + HAZE_SIMULATION_DAYS.length) % HAZE_SIMULATION_DAYS.length);
  };

  const handleNext = () => {
    onSelectDayIndex((currentDayIndex + 1) % HAZE_SIMULATION_DAYS.length);
  };

  const handleReset = () => {
    onSelectDayIndex(0);
  };

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 transition-all duration-300 shadow-sm ${
        isSimulationActive
          ? "ring-amber-500/40 bg-gradient-to-b from-amber-500/5 to-card"
          : "ring-border"
      }`}
    >
      {/* Top Bar: Mode Switcher (Live vs Simulation) & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        {/* Title & Mode Switch */}
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-xl transition-colors ${
              isSimulationActive
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            {isSimulationActive ? <Flame className="size-5 animate-pulse" /> : <Sparkles className="size-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-heading font-bold text-sm text-foreground">
                {isSimulationActive ? "Dynamic Haze Simulation (7 Days)" : "Air Quality Monitoring"}
              </span>

              {/* Segmented Mode Pill Switcher */}
              <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border">
                <button
                  type="button"
                  onClick={() => onToggleSimulation(false)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                    !isSimulationActive
                      ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Live Stream</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleSimulation(true)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                    isSimulationActive
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Flame className="size-3" />
                  <span>Simulation Mode</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isSimulationActive
                ? "Simulating smoke drift trajectories & active peatland fire hotspots. Click 'Live Stream' to resume real-time data."
                : "Displaying real-time monitoring station feeds. Switch to Simulation Mode to play 7-day projection."}
            </p>
          </div>
        </div>

        {/* Player Controls (Visible when Simulation is Active) */}
        {isSimulationActive ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Step Back */}
            <Button
              size="icon-sm"
              variant="outline"
              onClick={handlePrev}
              title="Previous Day"
              className="h-8 w-8"
            >
              <SkipBack className="size-3.5" />
            </Button>

            {/* Play / Pause Main Button */}
            <Button
              size="sm"
              variant="default"
              onClick={onTogglePlay}
              className={`gap-1.5 h-8 px-3 font-bold text-xs ${
                isPlaying ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="size-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="size-3.5 fill-current" />
                  <span>Play</span>
                </>
              )}
            </Button>

            {/* Step Next */}
            <Button
              size="icon-sm"
              variant="outline"
              onClick={handleNext}
              title="Next Day"
              className="h-8 w-8"
            >
              <SkipForward className="size-3.5" />
            </Button>

            {/* Reset */}
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleReset}
              title="Reset to Day 1"
              className="h-8 w-8"
            >
              <RotateCcw className="size-3.5" />
            </Button>

            {/* Speed Selector */}
            <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border ml-1">
              {[
                { val: 1, label: "1x" },
                { val: 2, label: "2x" },
                { val: 3, label: "3x" },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => onSpeedChange(s.val)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                    speed === s.val
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Turn Off Switch Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleSimulation(false)}
              className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground ml-1"
            >
              <Power className="size-3 text-red-500" />
              <span className="hidden sm:inline">Exit Simulation</span>
            </Button>
          </div>
        ) : (
          /* When OFF: Quick CTA to turn ON */
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleSimulation(true)}
            className="gap-1.5 text-xs font-semibold hover:border-amber-500/50 hover:bg-amber-500/10"
          >
            <Flame className="size-3.5 text-amber-500" />
            <span>Enable 7-Day Simulation</span>
          </Button>
        )}
      </div>

      {/* Expanded Interactive 7-Day Timeline (Only shown when Simulation is Active) */}
      {isSimulationActive && (
        <>
          {/* 7-Day Interactive Timeline Nodes */}
          <div className="relative pt-2 pb-1">
            {/* Progress connector line */}
            <div className="absolute top-[28px] left-6 right-6 h-1 bg-muted rounded-full" />
            <div
              className="absolute top-[28px] left-6 h-1 bg-amber-500 rounded-full transition-all duration-300"
              style={{
                width: `${(currentDayIndex / (HAZE_SIMULATION_DAYS.length - 1)) * 90}%`,
              }}
            />

            {/* 7 Day Nodes */}
            <div className="relative grid grid-cols-7 gap-1">
              {HAZE_SIMULATION_DAYS.map((day, idx) => {
                const isSelected = currentDayIndex === idx;
                const isPast = idx <= currentDayIndex;

                let dotColor = "bg-emerald-500";
                if (day.summaryLevel === "Moderate") dotColor = "bg-amber-500";
                if (day.summaryLevel === "Unhealthy") dotColor = "bg-orange-500";
                if (day.summaryLevel === "Very Unhealthy") dotColor = "bg-red-500";

                return (
                  <button
                    key={day.dayIndex}
                    type="button"
                    onClick={() => onSelectDayIndex(idx)}
                    className={`group flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all text-center cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/15 ring-1 ring-amber-500/50 font-bold scale-105"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {/* Node Pill */}
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isSelected
                          ? "bg-amber-500 text-white ring-4 ring-amber-500/20 shadow-xs"
                          : isPast
                          ? "bg-amber-500/80 text-white"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex flex-col items-center">
                      <span
                        className={`text-[11px] leading-tight truncate w-full ${
                          isSelected ? "text-amber-600 dark:text-amber-400 font-bold" : "text-foreground font-medium"
                        }`}
                      >
                        {day.dayName.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{day.dateStr.slice(0, 6)}</span>
                      <span className={`size-1.5 rounded-full mt-0.5 ${dotColor}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Simulation Meteorological Status HUD */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-border/80">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <Flame className="size-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Active Fire Hotspots</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {currentDay.hotspotCount} Hotspots Detected
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                <Wind className="size-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Monsoon Wind Vector</span>
                <span className="text-xs font-bold text-foreground">
                  {currentDay.windDirection} · {currentDay.windSpeed}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border">
              <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500 shrink-0">
                <Gauge className="size-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Daily Impact Level</span>
                <span className="text-xs font-bold text-foreground">
                  {currentDay.summaryLevel} (Density {(currentDay.hazeIntensity * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/40 border border-border">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <Info className="size-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Primary Affected Zone</span>
                <span className="text-xs font-bold text-foreground truncate block">
                  {currentDay.affectedRegion}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
