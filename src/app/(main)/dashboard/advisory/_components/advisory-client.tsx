"use client";

import { useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Building,
  CheckCircle2,
  HeartPulse,
  Info,
  Layers,
  School,
  Shield,
  ShieldAlert,
  Smile,
  Users,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const IPU_LEVELS = [
  {
    range: "0 – 50",
    status: "Good",
    color: "#22c55e",
    bgClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    badgeClass: "bg-emerald-600 text-white",
    generalPublic: "Air quality is satisfactory. Little or no health risk. Outdoor activities may proceed as normal.",
    vulnerableGroup: "No health restrictions. Enjoy outdoor activities with family.",
    schools: "School sessions and outdoor sports proceed normally.",
    mask: "No face mask required.",
  },
  {
    range: "51 – 100",
    status: "Moderate",
    color: "#eab308",
    bgClass: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
    badgeClass: "bg-amber-600 text-white",
    generalPublic: "Air quality is acceptable. Healthy individuals may continue outdoor activities as usual.",
    vulnerableGroup: "Unusually sensitive people (chronic asthma) should consider reducing strenuous outdoor exertion.",
    schools: "Co-curricular activities and physical education may continue with monitoring of symptomatic students.",
    mask: "Optional for individuals experiencing mild respiratory sensitivity.",
  },
  {
    range: "101 – 200",
    status: "Unhealthy",
    color: "#f97316",
    bgClass: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300",
    badgeClass: "bg-orange-600 text-white",
    generalPublic: "Public advised to limit prolonged outdoor physical exertion and stay well hydrated.",
    vulnerableGroup: "Children, elderly, pregnant women, and patients with heart/lung disease should avoid outdoor activities.",
    schools: "Cancel all outdoor classroom and sports activities. Indoor learning continues with windows closed.",
    mask: "Recommended to wear N95 or particulate respirators if outdoor travel is necessary.",
  },
  {
    range: "201 – 300",
    status: "Very Unhealthy",
    color: "#ef4444",
    bgClass: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
    badgeClass: "bg-red-600 text-white",
    generalPublic: "Health alert: entire population is more likely to be affected. Avoid all outdoor activities.",
    vulnerableGroup: "High-risk groups must remain indoors. Operate HEPA air purifiers.",
    schools: "Ministry of Education issues automatic school closure orders across affected districts.",
    mask: "Mandatory N95 / KN95 particulate respirator when stepping outdoors.",
  },
  {
    range: "> 300",
    status: "Hazardous / Emergency",
    color: "#9333ea",
    bgClass: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
    badgeClass: "bg-purple-600 text-white",
    generalPublic: "Haze Emergency Declaration. All non-essential outdoor operations and work cease immediately.",
    vulnerableGroup: "Remain inside sealed rooms with active air purifiers. Seek emergency care if shortness of breath occurs.",
    schools: "All educational institutions, kindergartens, and daycare centres fully closed.",
    mask: "High-grade N95 / FFP2 respirators mandatory for all emergency and security personnel.",
  },
];

export function AdvisoryClient() {
  const [interactiveAqi, setInteractiveAqi] = useState<number>(85);

  const getMatchedLevel = (aqi: number) => {
    if (aqi <= 50) return IPU_LEVELS[0];
    if (aqi <= 100) return IPU_LEVELS[1];
    if (aqi <= 200) return IPU_LEVELS[2];
    if (aqi <= 300) return IPU_LEVELS[3];
    return IPU_LEVELS[4];
  };

  const activeLevel = getMatchedLevel(interactiveAqi);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl tracking-tight sm:text-3xl">Health Advisory &amp; Safety Matrix</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Official guidelines from the Ministry of Health (MOH) &amp; Department of Environment (DOE) for haze protection.
        </p>
      </div>

      {/* Interactive AQI Health Level Simulator */}
      <Card className="p-5 ring-1 ring-border bg-gradient-to-r from-card to-muted/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="size-5 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">Interactive AQI Health Simulator</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Drag the slider to test health action guidelines for any AQI value (0 to 350+):
            </CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block font-semibold uppercase">Simulated AQI</span>
              <span className="text-3xl font-black tabular-nums" style={{ color: activeLevel.color }}>
                {interactiveAqi}
              </span>
            </div>
            <Badge className={`${activeLevel.badgeClass} font-bold text-xs px-3 py-1`}>
              {activeLevel.status}
            </Badge>
          </div>
        </div>

        {/* Slider */}
        <div className="py-4">
          <input
            type="range"
            min={0}
            max={350}
            value={interactiveAqi}
            onChange={(e) => setInteractiveAqi(parseInt(e.target.value))}
            className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground font-mono mt-1">
            <span>0 (Good)</span>
            <span>100 (Moderate)</span>
            <span>200 (Unhealthy)</span>
            <span>300 (Very Unhealthy)</span>
            <span>350+ (Hazardous)</span>
          </div>
        </div>

        {/* Dynamic Action Matrix Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <Users className="size-4 text-blue-500" />
              <span>General Public</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{activeLevel.generalPublic}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <HeartPulse className="size-4 text-red-500" />
              <span>High-Risk Groups</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{activeLevel.vulnerableGroup}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <School className="size-4 text-amber-500" />
              <span>School Protocol</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{activeLevel.schools}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <ShieldAlert className="size-4 text-purple-500" />
              <span>Face Mask Advice</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{activeLevel.mask}</p>
          </div>
        </div>
      </Card>

      {/* Complete Matrix Table */}
      <Card className="p-5 ring-1 ring-border">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm font-bold text-foreground">Standard DOE / MOH Haze Action Matrix</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Official operational thresholds under the National Haze Action Plan
          </CardDescription>
        </CardHeader>

        <div className="space-y-3">
          {IPU_LEVELS.map((lvl) => (
            <div
              key={lvl.range}
              className={`p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${lvl.bgClass}`}
            >
              <div className="flex items-center gap-3 lg:w-1/4">
                <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: lvl.color }} />
                <div>
                  <span className="font-bold text-sm block leading-tight">{lvl.status}</span>
                  <span className="text-xs font-mono opacity-80">AQI Range: {lvl.range}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 text-xs">
                <div>
                  <span className="font-semibold block opacity-75">Public Action:</span>
                  <span>{lvl.generalPublic}</span>
                </div>
                <div>
                  <span className="font-semibold block opacity-75">Schools &amp; Children:</span>
                  <span>{lvl.schools}</span>
                </div>
                <div>
                  <span className="font-semibold block opacity-75">Protection &amp; Mask:</span>
                  <span>{lvl.mask}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
