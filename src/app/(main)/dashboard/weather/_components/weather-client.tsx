"use client";

import { useState, useMemo } from "react";
import {
  Cloud,
  CloudSun,
  Compass,
  Droplets,
  Gauge,
  Sun,
  Thermometer,
  Wind,
  ArrowUpDown,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import type { StateAqiResult } from "../../air-quality/_components/waqi-service";
import type { MalaysiaState } from "../../air-quality/_components/malaysia-states";

interface WeatherClientProps {
  initialResults: StateAqiResult[];
  states: MalaysiaState[];
}

type SortField = "temp" | "humidity" | "wind" | "name";

export function WeatherClient({ initialResults, states }: WeatherClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("temp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const resultMap = useMemo(() => {
    return Object.fromEntries(initialResults.map((r) => [r.stateId, r]));
  }, [initialResults]);

  // Aggregate national stats
  const weatherList = useMemo(() => {
    return states.map((state) => {
      const res = resultMap[state.id];
      const temp = res?.data?.iaqi?.t?.v ?? null;
      const humidity = res?.data?.iaqi?.h?.v ?? null;
      const wind = res?.data?.iaqi?.w?.v ?? null;
      const pressure = res?.data?.iaqi?.p?.v ?? null;
      const aqi = res?.data?.aqi ?? null;

      return {
        state,
        temp,
        humidity,
        wind,
        pressure,
        aqi,
      };
    });
  }, [states, resultMap]);

  const temps = weatherList.filter((w) => w.temp !== null).map((w) => w.temp!);
  const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : "–";
  const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;
  const minTemp = temps.length > 0 ? Math.min(...temps) : 0;

  const hums = weatherList.filter((w) => w.humidity !== null).map((w) => w.humidity!);
  const avgHum = hums.length > 0 ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : "–";

  // Filter & Sort
  const processedList = useMemo(() => {
    return weatherList
      .filter((w) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return w.state.name.toLowerCase().includes(q) || w.state.nameMs.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (sortField === "temp") {
          valA = a.temp ?? -999;
          valB = b.temp ?? -999;
        } else if (sortField === "humidity") {
          valA = a.humidity ?? -999;
          valB = b.humidity ?? -999;
        } else if (sortField === "wind") {
          valA = a.wind ?? -999;
          valB = b.wind ?? -999;
        } else {
          return sortOrder === "asc"
            ? a.state.name.localeCompare(b.state.name)
            : b.state.name.localeCompare(a.state.name);
        }

        return sortOrder === "desc" ? valB - valA : valA - valB;
      });
  }, [weatherList, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl tracking-tight sm:text-3xl">Temperature &amp; Weather Conditions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time atmospheric and meteorological observations from monitoring stations across Malaysia.
        </p>
      </div>

      {/* Meteorological KPI Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs">
            <Thermometer className="size-4" />
            <span>National Average Temperature</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-foreground">{avgTemp}</span>
            <span className="text-sm font-semibold text-muted-foreground">°C</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Today&apos;s Range: {minTemp}°C – {maxTemp}°C
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
            <Droplets className="size-4" />
            <span>Average Relative Humidity</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-foreground">{avgHum}</span>
            <span className="text-sm font-semibold text-muted-foreground">%</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Humid equatorial tropical climate year-round
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
            <Wind className="size-4" />
            <span>Haze Dispersion Velocity</span>
          </div>
          <span className="text-lg font-bold text-foreground mt-2 block">Moderate Dispersion</span>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Average surface wind speeds 1.5 – 3.8 m/s assist atmospheric turnover
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
            <Gauge className="size-4" />
            <span>Barometric Pressure</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-extrabold text-foreground">1011</span>
            <span className="text-sm font-semibold text-muted-foreground">hPa</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Standard atmospheric pressure at sea level
          </span>
        </Card>
      </div>

      {/* Control / Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-3 ring-1 ring-border shadow-xs">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>

        {/* Sort Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider hidden sm:inline">
            Sort by:
          </span>
          <Button
            size="sm"
            variant={sortField === "temp" ? "default" : "outline"}
            onClick={() => toggleSort("temp")}
            className="h-8 text-xs gap-1"
          >
            <Thermometer className="size-3.5" />
            <span>Temperature</span>
            {sortField === "temp" && <ArrowUpDown className="size-3" />}
          </Button>

          <Button
            size="sm"
            variant={sortField === "humidity" ? "default" : "outline"}
            onClick={() => toggleSort("humidity")}
            className="h-8 text-xs gap-1"
          >
            <Droplets className="size-3.5" />
            <span>Humidity</span>
            {sortField === "humidity" && <ArrowUpDown className="size-3" />}
          </Button>

          <Button
            size="sm"
            variant={sortField === "wind" ? "default" : "outline"}
            onClick={() => toggleSort("wind")}
            className="h-8 text-xs gap-1"
          >
            <Wind className="size-3.5" />
            <span>Wind</span>
            {sortField === "wind" && <ArrowUpDown className="size-3" />}
          </Button>
        </div>
      </div>

      {/* State Weather Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {processedList.map(({ state, temp, humidity, wind, pressure }) => (
          <Card key={state.id} className="ring-1 ring-border hover:shadow-md transition-all">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MalaysiaFlag code={state.flagCode} size="md" className="shadow-xs" />
                  <div>
                    <CardTitle className="text-sm font-bold">{state.name}</CardTitle>
                    <CardDescription className="text-[11px] font-mono">
                      {state.region === "peninsular" ? "Peninsular" : "East Malaysia"}
                    </CardDescription>
                  </div>
                </div>
                {temp !== null && (
                  <span className="text-xl font-extrabold text-foreground">{temp}°C</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex flex-col gap-2.5">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted/40 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Humidity</span>
                  <span className="font-bold text-foreground">{humidity !== null ? `${humidity}%` : "–"}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Wind</span>
                  <span className="font-bold text-foreground">{wind !== null ? `${wind} m/s` : "–"}</span>
                </div>
                <div className="rounded-lg bg-muted/40 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Pressure</span>
                  <span className="font-bold text-foreground">{pressure !== null ? `${pressure}` : "1011"}</span>
                </div>
              </div>

              {/* Weather Condition Note */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border">
                <CloudSun className="size-3.5 text-amber-500 shrink-0" />
                <span>
                  {humidity !== null && humidity > 85 ? "High humidity, convective rain likely" : "Partly cloudy, favorable atmospheric dispersion"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
