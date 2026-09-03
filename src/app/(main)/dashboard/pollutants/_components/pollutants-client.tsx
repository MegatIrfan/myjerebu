"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Flame,
  Info,
  Layers,
  ShieldAlert,
  Wind,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import type { StateAqiResult } from "../../air-quality/_components/waqi-service";
import type { MalaysiaState } from "../../air-quality/_components/malaysia-states";
import { getAqiInfo } from "../../air-quality/_components/aqi-utils";

interface PollutantsClientProps {
  initialResults: StateAqiResult[];
  states: MalaysiaState[];
}

type PollutantKey = "pm25" | "pm10" | "o3" | "no2" | "so2" | "co";

interface PollutantMeta {
  name: string;
  chemical: string;
  unit: string;
  source: string;
  safeThreshold: number;
  whoLimit: number;
  description: string;
  healthRisk: string;
  color: string;
}

const POLLUTANT_SPECS: Record<PollutantKey, PollutantMeta> = {
  pm25: {
    name: "Fine Particulate Matter",
    chemical: "PM2.5",
    unit: "µg/m³",
    source: "Wildfire smoke, transboundary peatland fires, vehicle exhaust & factory emissions",
    safeThreshold: 35,
    whoLimit: 15,
    description: "Microscopic particles with diameter of 2.5 micrometers or less. The primary driver of dense haze episodes across Malaysia.",
    healthRisk: "Deeply penetrates respiratory tract into lung alveoli and blood circulation, triggering asthma exacerbations, cardiovascular inflammation, and respiratory distress.",
    color: "#f97316",
  },
  pm10: {
    name: "Coarse Particulate Matter",
    chemical: "PM10",
    unit: "µg/m³",
    source: "Road dust, quarry operations, construction sites, and open burning",
    safeThreshold: 50,
    whoLimit: 45,
    description: "Inhalable particles with diameter under 10 micrometers including dust, pollen, and fly ash.",
    healthRisk: "Causes irritation to eyes, nose, throat, persistent coughing, and breathing discomfort among sensitive individuals.",
    color: "#3b82f6",
  },
  o3: {
    name: "Ground-Level Ozone",
    chemical: "O₃",
    unit: "ppb",
    source: "Photochemical reaction between NOx and VOCs under intense solar radiation",
    safeThreshold: 70,
    whoLimit: 50,
    description: "Secondary reactive gas formed near ground level through sunlight-driven chemical reactions.",
    healthRisk: "Irritates the respiratory system, reduces lung capacity, and aggravates asthma and chronic bronchitis.",
    color: "#8b5cf6",
  },
  no2: {
    name: "Nitrogen Dioxide",
    chemical: "NO₂",
    unit: "ppb",
    source: "Combustion emissions from motor vehicles and thermal power plants",
    safeThreshold: 53,
    whoLimit: 25,
    description: "Reddish-brown toxic gas with pungent odor, precursor to photochemical smog and acid rain.",
    healthRisk: "Increases risk of respiratory infections and diminishes lung resistance, especially in children.",
    color: "#ec4899",
  },
  so2: {
    name: "Sulfur Dioxide",
    chemical: "SO₂",
    unit: "ppb",
    source: "Heavy coal fuel combustion and oil refining facilities",
    safeThreshold: 35,
    whoLimit: 20,
    description: "Colorless gas with sharp suffocating odor produced from industrial sulfur combustion.",
    healthRisk: "Rapidly constricts airways during short exposure periods and irritates ocular mucous membranes.",
    color: "#eab308",
  },
  co: {
    name: "Carbon Monoxide",
    chemical: "CO",
    unit: "ppm",
    source: "Incomplete combustion in motor vehicle engines and biomass fires",
    safeThreshold: 9,
    whoLimit: 4,
    description: "Colorless, odorless and tasteless toxic gas that readily binds with blood hemoglobin.",
    healthRisk: "Reduces oxygen-carrying capacity of bloodstream to vital organs, causing headaches, dizziness, and fatigue.",
    color: "#10b981",
  },
};

export function PollutantsClient({ initialResults, states }: PollutantsClientProps) {
  const [activePollutant, setActivePollutant] = useState<PollutantKey>("pm25");

  const currentMeta = POLLUTANT_SPECS[activePollutant];

  // Extract readings for active pollutant across states
  const stateReadings = states.map((state) => {
    const res = initialResults.find((r) => r.stateId === state.id);
    const val = res?.data?.iaqi?.[activePollutant]?.v;
    return {
      state,
      value: val !== undefined ? val : null,
      aqi: res?.data?.aqi ?? null,
    };
  });

  const validReadings = stateReadings.filter((s) => s.value !== null) as {
    state: MalaysiaState;
    value: number;
    aqi: number | null;
  }[];

  const highestState = validReadings.length > 0 ? validReadings.reduce((a, b) => (a.value > b.value ? a : b)) : null;
  const averageVal = validReadings.length > 0 ? (validReadings.reduce((sum, s) => sum + s.value, 0) / validReadings.length).toFixed(1) : "N/A";
  const exceedingSafe = validReadings.filter((s) => s.value > currentMeta.safeThreshold).length;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading font-bold text-2xl tracking-tight sm:text-3xl">Comprehensive Pollutant Analysis</h1>
          <Badge variant="secondary" className="font-bold">
            DOE &amp; WHO Standards
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          In-depth breakdown of 6 critical atmospheric pollutants: PM2.5, PM10, O₃, NO₂, SO₂, and CO.
        </p>
      </div>

      {/* Pollutant Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {(Object.keys(POLLUTANT_SPECS) as PollutantKey[]).map((key) => {
          const spec = POLLUTANT_SPECS[key];
          const isActive = activePollutant === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActivePollutant(key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm scale-105"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <span>{spec.chemical}</span>
              <span className={`text-[11px] font-normal ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                ({spec.name})
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Pollutant Overview Banner */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Spec Card */}
        <Card className="lg:col-span-2 p-5 ring-1 ring-border flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ backgroundColor: currentMeta.color }} />
                <h2 className="text-xl font-bold text-foreground">
                  {currentMeta.chemical} — {currentMeta.name}
                </h2>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                Unit: {currentMeta.unit}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentMeta.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 text-xs">
            <div>
              <span className="text-[11px] text-muted-foreground font-semibold block">Primary Emissions Source:</span>
              <span className="text-foreground font-medium">{currentMeta.source}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground font-semibold block">Health Risk &amp; Toxicity:</span>
              <span className="text-foreground font-medium">{currentMeta.healthRisk}</span>
            </div>
          </div>
        </Card>

        {/* Right: National Benchmark KPI */}
        <Card className="p-5 ring-1 ring-border flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">National Average Level</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-foreground">{averageVal}</span>
              <span className="text-xs font-semibold text-muted-foreground">{currentMeta.unit}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">National Safe Threshold:</span>
              <span className="font-bold text-foreground">{currentMeta.safeThreshold} {currentMeta.unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">WHO Guideline (24-hr):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentMeta.whoLimit} {currentMeta.unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stations Exceeding Limit:</span>
              <span className={`font-bold ${exceedingSafe > 0 ? "text-red-500" : "text-emerald-500"}`}>
                {exceedingSafe} / {validReadings.length} States
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 16 State Comparative Concentration Bars */}
      <Card className="p-5 ring-1 ring-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              16 State Comparative Concentrations ({currentMeta.chemical})
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Comparison against DOE National Safe Limit ({currentMeta.safeThreshold} {currentMeta.unit})
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Sorted by Concentration
          </Badge>
        </div>

        <div className="space-y-3">
          {validReadings
            .sort((a, b) => b.value - a.value)
            .map((item) => {
              const pct = Math.min((item.value / (currentMeta.safeThreshold * 1.8)) * 100, 100);
              const isExceeded = item.value > currentMeta.safeThreshold;

              return (
                <div key={item.state.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <MalaysiaFlag code={item.state.flagCode} size="xs" />
                      <span className="font-bold text-foreground truncate">{item.state.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-foreground">
                        {item.value} {currentMeta.unit}
                      </span>
                      {isExceeded && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.2 rounded">
                          Exceeds Limit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
