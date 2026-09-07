"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Building2,
  Compass,
  Download,
  Filter,
  Grid,
  List,
  MapPin,
  RefreshCw,
  Search,
  Thermometer,
  Wind,
  Droplets,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import type { StateAqiResult } from "../../air-quality/_components/waqi-service";
import type { MalaysiaState } from "../../air-quality/_components/malaysia-states";
import { getAqiInfo } from "../../air-quality/_components/aqi-utils";
import { AqiSocialCardExport } from "../../air-quality/_components/aqi-social-card-export";
import { toast } from "sonner";

interface StationsClientProps {
  initialResults: StateAqiResult[];
  states: MalaysiaState[];
}

export function StationsClient({ initialResults, states }: StationsClientProps) {
  const [results, setResults] = useState<StateAqiResult[]>(initialResults);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"all" | "peninsular" | "east">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const resultMap = useMemo(() => {
    return Object.fromEntries(results.map((r) => [r.stateId, r]));
  }, [results]);

  const filteredStates = useMemo(() => {
    return states.filter((state) => {
      const result = resultMap[state.id];
      const aqi = result?.data?.aqi ?? null;
      const info = getAqiInfo(aqi);

      // Region Filter
      if (regionFilter !== "all" && state.region !== regionFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== "all" && info.status !== statusFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = state.name.toLowerCase().includes(query) || state.nameMs.toLowerCase().includes(query);
        const matchesStation = (result?.data?.city?.name || state.waqiStation).toLowerCase().includes(query);
        return matchesName || matchesStation;
      }

      return true;
    });
  }, [states, resultMap, regionFilter, statusFilter, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/air-quality/refresh", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
          toast.success("16 state station datasets successfully updated!");
        }
      }
    } catch {
      toast.error("Failed to update station datasets.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ["State ID", "State", "Station", "Region", "AQI", "Status", "PM2.5 (ug/m3)", "Temp (C)", "Humidity (%)", "Latitude", "Longitude"];
    const rows = states.map((s) => {
      const r = resultMap[s.id];
      const aqi = r?.data?.aqi ?? "N/A";
      const info = getAqiInfo(r?.data?.aqi ?? null);
      const pm25 = r?.data?.iaqi?.pm25?.v ?? "N/A";
      const temp = r?.data?.iaqi?.t?.v ?? "N/A";
      const hum = r?.data?.iaqi?.h?.v ?? "N/A";
      return [
        s.id,
        s.name,
        r?.data?.city?.name || s.waqiStation,
        s.region === "peninsular" ? "Peninsular" : "East Malaysia",
        aqi,
        info.label,
        pm25,
        temp,
        hum,
        s.coordinates[0],
        s.coordinates[1],
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `myjerebu_stations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl tracking-tight sm:text-3xl">16 State Monitoring Stations</h1>
            <Badge variant="secondary" className="font-bold">
              16/16 Online
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time atmospheric sensor monitoring, particulate concentration and meteorological telemetry across Malaysia.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <AqiSocialCardExport results={results} states={states} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5"
          >
            <Download className="size-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-1.5"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-3 ring-1 ring-border shadow-xs">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search state or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>

        {/* Region & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region Tabs */}
          <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border">
            {[
              { id: "all", label: "All Regions" },
              { id: "peninsular", label: "Peninsular" },
              { id: "east", label: "Sabah & Sarawak" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegionFilter(r.id as typeof regionFilter)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  regionFilter === r.id
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg bg-muted px-2.5 text-xs font-medium text-foreground ring-1 ring-border outline-hidden cursor-pointer"
          >
            <option value="all">All AQI Levels</option>
            <option value="good">Good (0–50)</option>
            <option value="moderate">Moderate (51–100)</option>
            <option value="unhealthy">Unhealthy (101–200)</option>
            <option value="very-unhealthy">Very Unhealthy (201–300)</option>
            <option value="hazardous">Hazardous (301+)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded p-1 text-xs ${viewMode === "grid" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`}
              title="Grid View"
            >
              <Grid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded p-1 text-xs ${viewMode === "table" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`}
              title="Table View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStates.map((state) => {
            const result = resultMap[state.id];
            const aqi = result?.data?.aqi ?? null;
            const info = getAqiInfo(aqi);
            const pm25 = result?.data?.iaqi?.pm25?.v;
            const temp = result?.data?.iaqi?.t?.v;
            const hum = result?.data?.iaqi?.h?.v;
            const stationName = result?.data?.city?.name || state.name;

            return (
              <Card key={state.id} className="overflow-hidden hover:shadow-md transition-all ring-1 ring-border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MalaysiaFlag code={state.flagCode} size="md" className="shadow-xs" />
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-bold truncate leading-snug">{state.name}</CardTitle>
                        <CardDescription className="text-[11px] truncate">{stationName}</CardDescription>
                      </div>
                    </div>
                    {aqi !== null ? (
                      <Badge className={`shrink-0 text-xs font-extrabold ${info.badgeBgClass} ${info.badgeTextClass}`}>
                        {aqi} AQI
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        No Data
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 flex flex-col gap-3">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                    <span className={`size-2.5 rounded-full ${info.dotClass} shrink-0`} />
                    <span className={`text-xs font-semibold ${info.textClass}`}>{info.label}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                      {state.region === "peninsular" ? "Peninsular" : "East M'sia"}
                    </span>
                  </div>

                  {/* Pollutant & Weather Metrics */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-1.5 rounded-md bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block font-medium">PM2.5</span>
                      <span className="font-bold text-foreground">{pm25 !== undefined ? `${pm25}` : "–"}</span>
                    </div>
                    <div className="p-1.5 rounded-md bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block font-medium">Temp</span>
                      <span className="font-bold text-foreground">{temp !== undefined ? `${temp}°C` : "–"}</span>
                    </div>
                    <div className="p-1.5 rounded-md bg-muted/30">
                      <span className="text-[10px] text-muted-foreground block font-medium">Humidity</span>
                      <span className="font-bold text-foreground">{hum !== undefined ? `${hum}%` : "–"}</span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {state.coordinates[0].toFixed(2)}°N, {state.coordinates[1].toFixed(2)}°E
                    </span>
                    <Link
                      href="/dashboard/air-quality"
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      <span>View on Map</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl ring-1 ring-border bg-card shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3">Flag &amp; State</th>
                <th className="p-3">Station Name</th>
                <th className="p-3">Region</th>
                <th className="p-3">AQI Reading</th>
                <th className="p-3">Air Quality Status</th>
                <th className="p-3">PM2.5 (µg/m³)</th>
                <th className="p-3">Temperature</th>
                <th className="p-3">Humidity</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStates.map((state) => {
                const result = resultMap[state.id];
                const aqi = result?.data?.aqi ?? null;
                const info = getAqiInfo(aqi);
                const pm25 = result?.data?.iaqi?.pm25?.v;
                const temp = result?.data?.iaqi?.t?.v;
                const hum = result?.data?.iaqi?.h?.v;

                return (
                  <tr key={state.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2">
                        <MalaysiaFlag code={state.flagCode} size="sm" />
                        <span className="font-bold">{state.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{result?.data?.city?.name || state.waqiStation}</td>
                    <td className="p-3 text-muted-foreground">
                      {state.region === "peninsular" ? "Peninsular" : "East Malaysia"}
                    </td>
                    <td className="p-3">
                      {aqi !== null ? (
                        <Badge className={`font-extrabold ${info.badgeBgClass} ${info.badgeTextClass}`}>
                          {aqi}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${info.dotClass}`} />
                        <span className={`font-semibold ${info.textClass}`}>{info.label}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{pm25 !== undefined ? `${pm25} µg/m³` : "–"}</td>
                    <td className="p-3">{temp !== undefined ? `${temp}°C` : "–"}</td>
                    <td className="p-3">{hum !== undefined ? `${hum}%` : "–"}</td>
                    <td className="p-3 text-right">
                      <Link
                        href="/dashboard/air-quality"
                        className="font-medium text-primary hover:underline"
                      >
                        Open Map
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
