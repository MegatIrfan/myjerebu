"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import type { WaqiData, WaqiForecastDay } from "./waqi-service";

interface AqiForecastChartProps {
  data: WaqiData | null;
  stateName: string;
}

interface ChartEntry {
  day: string;
  pm25: number | null;
  pm10: number | null;
}

const chartConfig: ChartConfig = {
  pm25: {
    label: "PM2.5",
    color: "#f97316",
  },
  pm10: {
    label: "PM10",
    color: "#3b82f6",
  },
};

function buildChartData(data: WaqiData | null): ChartEntry[] {
  if (!data?.forecast?.daily) return [];

  const pm25Map: Record<string, WaqiForecastDay> = {};
  const pm10Map: Record<string, WaqiForecastDay> = {};

  if (Array.isArray(data.forecast.daily.pm25)) {
    data.forecast.daily.pm25.forEach((d) => {
      pm25Map[d.day] = d;
    });
  }
  if (Array.isArray(data.forecast.daily.pm10)) {
    data.forecast.daily.pm10.forEach((d) => {
      pm10Map[d.day] = d;
    });
  }

  const allDays = new Set([...Object.keys(pm25Map), ...Object.keys(pm10Map)]);
  const sorted = Array.from(allDays).sort().slice(0, 7);

  return sorted.map((day) => ({
    day: new Date(day).toLocaleDateString("ms-MY", { weekday: "short", day: "numeric", month: "short" }),
    pm25: pm25Map[day]?.avg ?? null,
    pm10: pm10Map[day]?.avg ?? null,
  }));
}

export function AqiForecastChart({ data, stateName }: AqiForecastChartProps) {
  const chartData = buildChartData(data);

  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ramalan 7 Hari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
            Tiada data ramalan untuk {stateName || "negeri ini"}.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Ramalan AQI 7 Hari —{" "}
          <span className="font-normal text-muted-foreground">{stateName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-52 w-full">
          <BarChart data={chartData} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="pm25" name="PM2.5" fill="var(--color-pm25)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pm10" name="PM10" fill="var(--color-pm10)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>

        <div className="mt-2 flex justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-orange-500" />
            <span className="text-muted-foreground text-xs">PM2.5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground text-xs">PM10</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
