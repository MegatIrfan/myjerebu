"use client";

import { useState } from "react";
import {
  Calendar,
  CloudRain,
  Compass,
  Flame,
  LineChart,
  Navigation,
  Sun,
  TrendingDown,
  TrendingUp,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import { AqiForecastChart } from "../../air-quality/_components/aqi-forecast-chart";
import type { StateAqiResult } from "../../air-quality/_components/waqi-service";
import type { MalaysiaState } from "../../air-quality/_components/malaysia-states";
import { getAqiInfo } from "../../air-quality/_components/aqi-utils";

interface ForecastClientProps {
  initialResults: StateAqiResult[];
  states: MalaysiaState[];
}

export function ForecastClient({ initialResults, states }: ForecastClientProps) {
  const [selectedStateId, setSelectedStateId] = useState<string>("kuala-lumpur");

  const selectedState = states.find((s) => s.id === selectedStateId) || states[0];
  const selectedResult = initialResults.find((r) => r.stateId === selectedStateId);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-heading font-bold text-2xl tracking-tight sm:text-3xl">7-Day Air Quality Forecast</h1>
          <Badge variant="secondary" className="font-bold">
            ECMWF / CAMS Atmospheric Model
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Particulate trajectory projections and expected 7-day Air Quality Index (AQI) forecasts across Malaysia.
        </p>
      </div>

      {/* Meteorological Haze Risk Synopsis */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Compass className="size-4" />
            <span>Active Monsoon</span>
          </div>
          <span className="text-lg font-extrabold text-foreground mt-2 block">Southwest Monsoon</span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block leading-snug">
            Prevailing winds from Southwest channel potential transboundary haze plumes towards the West Coast.
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
            <Flame className="size-4" />
            <span>Regional Fire Hotspots</span>
          </div>
          <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-2 block">14 Hotspots Detected</span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block leading-snug">
            NOAA-20 satellite telemetry detects moderate fire clusters in southern Sumatra and western Kalimantan.
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
            <CloudRain className="size-4" />
            <span>Precipitation &amp; Rainfall</span>
          </div>
          <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400 mt-2 block">Late Afternoon Showers</span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block leading-snug">
            Convective thunderstorms expected to naturally wash out atmospheric PM2.5 particulates across most states.
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
            <TrendingDown className="size-4" />
            <span>Weekly Outlook Trend</span>
          </div>
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 block">Stable / Moderate</span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block leading-snug">
            AQI values projected to remain below 100 for majority of regions over the next 72 hours.
          </span>
        </Card>
      </div>

      {/* State Selector Bar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-foreground uppercase tracking-wider">
            Select State for Detailed 7-Day Forecast:
          </span>
          <span className="text-xs text-muted-foreground font-mono">16 State Stations Available</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {states.map((st) => {
            const isSelected = selectedStateId === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStateId(st.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <MalaysiaFlag code={st.flagCode} size="xs" />
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Forecast Chart for Selected State */}
      <div className="w-full">
        <AqiForecastChart
          data={selectedResult?.data ?? null}
          stateName={selectedState?.name ?? ""}
        />
      </div>
    </div>
  );
}
