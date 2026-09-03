"use client";

import { useState, useMemo } from "react";
import { Award, BarChart2 } from "lucide-react";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import { malaysiaStates } from "@/app/(main)/dashboard/air-quality/_components/malaysia-states";
import { malaysiaDistricts } from "@/app/(main)/dashboard/air-quality/_components/malaysia-districts";
import { getAqiInfo } from "@/app/(main)/dashboard/air-quality/_components/aqi-utils";
import type { StateAqiResult } from "@/app/(main)/dashboard/air-quality/_components/waqi-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface LandingDailyRankingsProps {
  results: StateAqiResult[];
  lang: "ms" | "en";
}

const chartConfig: ChartConfig = {
  aqi: {
    label: "AQI / IPU",
    color: "var(--primary)",
  },
};

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
  const chartData = useMemo(() => {
    return trendHours.map((h, i) => {
      // Simulate real-world diurnal curves
      const wave = Math.sin((i - 4) * 0.4) * 15;
      const val = Math.max(15, Math.round(currentBaseAqi + wave));
      return { hour: h, aqi: val };
    });
  }, [currentBaseAqi, trendHours]);

  const currentInfo = getAqiInfo(currentBaseAqi);

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

      {/* Right Box: Data Trend Chart (8 cols) using shadcn ChartContainer & AreaChart */}
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
                  Stesen: <b className="text-foreground">{currentStation.name}</b> ({currentStation.stateName}) · Bacaan Semasa:{" "}
                  <b style={{ color: currentInfo.color }}>{currentBaseAqi} AQI</b>
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

          {/* Area Chart using shadcn ChartContainer */}
          <CardContent className="pt-4">
            <ChartContainer config={chartConfig} className="h-60 w-full">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentInfo.color} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={currentInfo.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground font-mono"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  className="fill-muted-foreground font-mono"
                  domain={[0, "auto"]}
                />
                <ChartTooltip
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `Masa: ${value}`}
                      formatter={(val) => [
                        <span key="val" className="font-mono font-bold" style={{ color: currentInfo.color }}>
                          {val} AQI ({getAqiInfo(Number(val)).label})
                        </span>,
                        "Bacaan",
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke={currentInfo.color}
                  strokeWidth={2.5}
                  fill="url(#fillAqi)"
                  dot={{ r: 3.5, fill: currentInfo.color, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: currentInfo.color, stroke: "var(--background)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ChartContainer>
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
            Powered by shadcn/ui Recharts
          </Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
