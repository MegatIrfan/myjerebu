"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Award, BarChart2 } from "lucide-react";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import { malaysiaStates } from "@/app/(main)/dashboard/air-quality/_components/malaysia-states";
import { malaysiaDistricts } from "@/app/(main)/dashboard/air-quality/_components/malaysia-districts";
import { getAqiInfo } from "@/app/(main)/dashboard/air-quality/_components/aqi-utils";
import type { StateAqiResult } from "@/app/(main)/dashboard/air-quality/_components/waqi-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface LandingDailyRankingsProps {
  results: StateAqiResult[];
  lang: "ms" | "en";
}

export function LandingDailyRankings({ results, lang }: LandingDailyRankingsProps) {
  const [selectedStationId, setSelectedStationId] = useState<string>("sgr-shah-alam");
  const [rankingTab, setRankingTab] = useState<"cleanest" | "highest">("cleanest");

  const aqiMap = useMemo(() => {
    return Object.fromEntries(results.map((r) => [r.stateId, r.data?.aqi ?? 60]));
  }, [results]);

  const stateFlagMap = useMemo(() => {
    return Object.fromEntries(malaysiaStates.map((s) => [s.id, s.flagCode]));
  }, []);

  // Sorted rankings across all 68+ districts
  const rankedDistricts = useMemo(() => {
    const list = malaysiaDistricts.map((dst) => {
      const parentAqi = aqiMap[dst.stateId] ?? 60;
      const aqi = Math.max(12, Math.min(420, parentAqi + dst.baseAqiOffset));
      return {
        ...dst,
        aqi,
        info: getAqiInfo(aqi),
        flagCode: stateFlagMap[dst.stateId] || "ft",
      };
    });

    return list.sort((a, b) => (rankingTab === "cleanest" ? a.aqi - b.aqi : b.aqi - a.aqi));
  }, [aqiMap, stateFlagMap, rankingTab]);

  const top5 = rankedDistricts.slice(0, 5);

  // Selected station data for trend chart
  const currentStation = malaysiaDistricts.find((d) => d.id === selectedStationId) || malaysiaDistricts[0];
  const currentBaseAqi = Math.max(15, (aqiMap[currentStation.stateId] ?? 60) + currentStation.baseAqiOffset);

  // 24 Hour Data Points
  const trendHours = ["14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00"];
  const trendData = useMemo(() => {
    return trendHours.map((h, i) => {
      // Simulate real-world diurnal curves
      const wave = Math.sin((i - 4) * 0.4) * 15;
      const val = Math.max(15, Math.round(currentBaseAqi + wave));
      return { hour: h, aqi: val, info: getAqiInfo(val) };
    });
  }, [currentBaseAqi, trendHours]);

  const maxVal = Math.max(...trendData.map((d) => d.aqi), 120);
  const minVal = Math.min(...trendData.map((d) => d.aqi), 20);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      {/* Left Box: API Daily Ranking (4 cols) using shadcn Card */}
      <Card className="lg:col-span-4 flex flex-col justify-between border-border shadow-xs">
        <div>
          <CardHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="size-4 text-amber-500" />
                <span>{lang === "ms" ? "Kedudukan IPU Harian" : "API Daily Ranking"}</span>
              </CardTitle>

              {/* Ranking Tabs with shadcn Tabs */}
              <CardAction>
                <Tabs value={rankingTab} onValueChange={(v) => setRankingTab(v as "cleanest" | "highest")}>
                  <TabsList className="h-7 p-0.5">
                    <TabsTrigger value="cleanest" className="text-xs px-2 h-6">
                      Terbersih
                    </TabsTrigger>
                    <TabsTrigger value="highest" className="text-xs px-2 h-6">
                      Tertinggi
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardAction>
            </div>
          </CardHeader>

          {/* Ranking Table List */}
          <CardContent className="pt-4 space-y-2">
            {top5.map((st, idx) => (
              <div
                key={st.id}
                onClick={() => setSelectedStationId(st.id)}
                className={`flex items-center justify-between rounded-xl p-2.5 transition-all cursor-pointer ${
                  selectedStationId === st.id
                    ? "bg-primary/10 ring-1 ring-primary/40 shadow-xs"
                    : "bg-muted/40 hover:bg-muted/70 ring-1 ring-border/50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      idx === 0
                        ? "bg-amber-400 text-black shadow-xs"
                        : idx === 1
                          ? "bg-slate-300 text-black"
                          : idx === 2
                            ? "bg-amber-700 text-white"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <MalaysiaFlag code={st.flagCode} size="xs" />
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-foreground truncate">{st.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{st.stateName}</span>
                  </div>
                </div>

                <div
                  className="rounded-lg px-2.5 py-1 text-xs font-mono font-black text-white shadow-xs shrink-0"
                  style={{ backgroundColor: st.info.color }}
                >
                  {st.aqi}
                </div>
              </div>
            ))}
          </CardContent>
        </div>

        <CardFooter className="border-t border-border pt-3 text-[11px] text-muted-foreground text-center justify-center">
          Tekan mana-mana stesen untuk memaparkan carta aliran di sebelah.
        </CardFooter>
      </Card>

      {/* Right Box: Data Trend Chart (8 cols) using shadcn Card */}
      <Card className="lg:col-span-8 flex flex-col justify-between border-border shadow-xs">
        <div>
          <CardHeader className="border-b border-border pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <BarChart2 className="size-4 text-primary" />
                  <span>{lang === "ms" ? "Carta Aliran Trend IPU (24 Jam)" : "Data Trend Chart (24 Hours)"}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Stesen: <b className="text-foreground">{currentStation.name}</b> ({currentStation.stateName})
                </CardDescription>
              </div>

              {/* Station dropdown switcher */}
              <CardAction>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  className="h-8 rounded-lg bg-muted px-2.5 text-xs font-semibold text-foreground border border-border outline-hidden cursor-pointer"
                >
                  {malaysiaDistricts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.stateName})
                    </option>
                  ))}
                </select>
              </CardAction>
            </div>
          </CardHeader>

          {/* SVG Area & Line Chart */}
          <CardContent className="pt-4">
            <div className="relative h-56 w-full rounded-xl bg-muted/20 border border-border/80 p-3 flex flex-col justify-between">
              {/* Background Threshold Bands */}
              <div className="absolute inset-x-3 top-3 bottom-8 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="w-full h-1/4 bg-yellow-500 rounded-t flex items-center px-2 text-[9px] font-bold text-yellow-900">
                  Unhealthy (101–200)
                </div>
                <div className="w-full h-1/3 bg-green-500 flex items-center px-2 text-[9px] font-bold text-green-900">
                  Moderate (51–100)
                </div>
                <div className="w-full h-1/3 bg-blue-500 rounded-b flex items-center px-2 text-[9px] font-bold text-blue-900">
                  Good (0–50)
                </div>
              </div>

              {/* Render Trend Points & Lines */}
              <div className="relative h-40 w-full flex items-end justify-between px-2 pt-4">
                {trendData.map((pt) => {
                  const heightPercent = Math.min(95, Math.max(10, ((pt.aqi - minVal + 10) / (maxVal - minVal + 20)) * 100));
                  return (
                    <div key={pt.hour} className="flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity rounded bg-popover px-1.5 py-0.5 text-[10px] font-mono font-bold text-popover-foreground shadow-md ring-1 ring-border pointer-events-none z-20 whitespace-nowrap">
                        {pt.aqi} AQI
                      </div>

                      {/* Value label above point */}
                      <span className="text-[9px] font-mono font-bold text-foreground mb-1">
                        {pt.aqi}
                      </span>

                      {/* Bar/Point Pillar */}
                      <div
                        className="w-4 sm:w-6 rounded-t-md transition-all shadow-xs group-hover:brightness-110"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: pt.info.color,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Hour Labels */}
              <div className="flex justify-between px-2 pt-2 border-t border-border/80 text-[10px] font-mono text-muted-foreground">
                {trendData.map((pt) => (
                  <span key={pt.hour}>{pt.hour}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </div>

        {/* Bottom Legend with shadcn Badge */}
        <CardFooter className="border-t border-border pt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-blue-500" /> Good (0–50)
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-green-500" /> Moderate (51–100)
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-yellow-500" /> Unhealthy (101–200)
            </span>
          </div>
          <Badge variant="secondary" className="font-semibold text-xs">
            Sampling: Hourly
          </Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
