"use client";

import { MalaysiaMap } from "@/app/(main)/dashboard/air-quality/_components/malaysia-map";
import type { StateAqiResult } from "@/app/(main)/dashboard/air-quality/_components/waqi-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Activity } from "lucide-react";

interface LandingHeroMapProps {
  results: StateAqiResult[];
  lang: "ms" | "en";
  selectedStateId: string | null;
  onStateSelect: (stateId: string | null) => void;
}

export function LandingHeroMap({ results, lang, selectedStateId, onStateSelect }: LandingHeroMapProps) {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" });
  const formattedDate = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div id="map-section" className="flex flex-col gap-4 scroll-mt-20">
      {/* Title & Status Header using shadcn Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl sm:text-2xl font-black tracking-tight">
                Air Pollutant Index Management System (APIMS)
              </CardTitle>
              <Badge variant="secondary" className="gap-1.5 font-bold text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE TELEMETRY
              </Badge>
            </div>
            <CardDescription className="text-xs sm:text-sm mt-1">
              {lang === "ms"
                ? "Status Kualiti Udara Semasa & Indeks Pencemaran Udara (IPU) Malaysia — 68+ Stesen Pemantauan CAQM Beroperasi"
                : "Current Malaysia Air Quality Status & Air Pollutant Index (API) — 68+ Continuous Ambient Air Quality Monitoring Stations"}
            </CardDescription>
          </div>

          <CardAction className="self-start sm:self-auto">
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-end text-right">
                <span className="text-xs font-bold text-foreground font-mono">{formattedTime} MYT</span>
                <span className="text-[11px] text-muted-foreground">{formattedDate}</span>
              </div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30">
                <Radio className="size-4 animate-pulse" />
              </div>
            </div>
          </CardAction>
        </CardHeader>
      </Card>

      {/* Main Interactive Map Canvas */}
      <Card className="overflow-hidden border-border shadow-md p-0">
        <CardContent className="p-0">
          <MalaysiaMap
            results={results}
            selectedStateId={selectedStateId}
            onStateSelect={onStateSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}
