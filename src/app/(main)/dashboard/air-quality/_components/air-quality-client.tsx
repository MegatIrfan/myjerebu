"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { RefreshCw, Sparkles, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { StateAqiResult } from "./waqi-service";
import type { MalaysiaState } from "./malaysia-states";
import { getDistrictsByState } from "./malaysia-districts";
import { AqiKpiStrip } from "./aqi-kpi-strip";
import { MalaysiaMap } from "./malaysia-map";
import { StateAqiGrid } from "./state-aqi-grid";
import { AqiForecastChart } from "./aqi-forecast-chart";
import { PollutantBreakdown } from "./pollutant-breakdown";
import { getAqiInfo } from "./aqi-utils";
import { HAZE_SIMULATION_DAYS, type SimulationDay } from "./haze-simulation-data";
import { HazeSimulationTimeline } from "./haze-simulation-timeline";
import { AqiSocialCardExport } from "./aqi-social-card-export";

interface AirQualityClientProps {
  initialResults: StateAqiResult[];
  states: MalaysiaState[];
}

export function AirQualityClient({ initialResults, states }: AirQualityClientProps) {
  const [results, setResults] = useState<StateAqiResult[]>(initialResults);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(
    // Default to highest AQI state
    initialResults.reduce<string | null>((acc, r) => {
      if (!r.data) return acc;
      if (!acc) return r.stateId;
      const accAqi = initialResults.find((x) => x.stateId === acc)?.data?.aqi ?? 0;
      return r.data.aqi > accAqi ? r.stateId : acc;
    }, null),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Haze Simulation State
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const simulationDay: SimulationDay | null = isSimulationActive ? HAZE_SIMULATION_DAYS[currentDayIndex] : null;

  // Auto-play interval loop
  useEffect(() => {
    if (!isPlaying || !isSimulationActive) return;

    const intervalMs = playbackSpeed === 1 ? 1800 : playbackSpeed === 2 ? 1000 : 600;
    const timer = setInterval(() => {
      setCurrentDayIndex((prev) => (prev + 1) % HAZE_SIMULATION_DAYS.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, isSimulationActive, playbackSpeed]);

  const togglePlay = () => {
    if (!isSimulationActive) {
      setIsSimulationActive(true);
    }
    setIsPlaying((prev) => !prev);
  };

  const selectedResult = useMemo(
    () => results.find((r) => r.stateId === selectedStateId) ?? null,
    [results, selectedStateId],
  );

  const selectedState = useMemo(
    () => states.find((s) => s.id === selectedStateId) ?? null,
    [states, selectedStateId],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/air-quality/refresh");
      if (res.ok) {
        const json = await res.json();
        setResults(json.results);
        setLastUpdated(new Date());
      }
    } catch {
      // silently fail
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Compute active AQI for selected state (simulated or live)
  const activeAqi = useMemo(() => {
    if (isSimulationActive && simulationDay && selectedStateId && simulationDay.stateAqi[selectedStateId] !== undefined) {
      return simulationDay.stateAqi[selectedStateId];
    }
    return selectedResult?.data?.aqi ?? null;
  }, [isSimulationActive, simulationDay, selectedStateId, selectedResult]);

  const aqiInfo = getAqiInfo(activeAqi);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl tracking-tight font-heading font-bold">MyJerebu 🌫️</h1>
            {isSimulationActive && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                7-Day Simulation Mode
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Real-Time Air Quality Monitoring for Malaysia &amp; Dynamic Haze Simulation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs hidden sm:inline">
            {isSimulationActive ? `Simulation: ${simulationDay?.dateStr}` : `Updated: ${lastUpdated.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" })}`}
          </span>
          <AqiSocialCardExport
            results={results}
            states={states}
            defaultStateId={selectedStateId || "kuala-lumpur"}
          />
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-1.5 font-semibold">
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <AqiKpiStrip results={results} />

      {/* Interactive 7-Day Haze Simulation Timeline Controller */}
      <HazeSimulationTimeline
        isSimulationActive={isSimulationActive}
        onToggleSimulation={setIsSimulationActive}
        currentDayIndex={currentDayIndex}
        onSelectDayIndex={setCurrentDayIndex}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        speed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
      />

      {/* Hero Full-Width Interactive Map */}
      <div className="w-full">
        <MalaysiaMap
          results={results}
          selectedStateId={selectedStateId}
          onStateSelect={setSelectedStateId}
          simulationDay={simulationDay}
          isSimulationActive={isSimulationActive}
          onToggleSimulation={setIsSimulationActive}
        />
      </div>

      {/* Secondary Detailed Breakdown Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start mt-2">
        {/* Left Col (7 cols): 16 State Stations Grid */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">16 State Monitoring Stations</h2>
            <span className="text-xs text-muted-foreground font-mono">16 stations active</span>
          </div>
          <StateAqiGrid
            states={states}
            results={results}
            selectedStateId={selectedStateId}
            onStateSelect={setSelectedStateId}
          />
        </div>

        {/* Right Col (5 cols): Selected State Details & Analysis */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Selected state banner */}
          {selectedState && selectedResult?.data && (
            <div
              className={`flex items-center gap-4 rounded-xl p-4 ring-1 ${aqiInfo.bgClass} ${aqiInfo.ringClass}`}
            >
              <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-background/50 shadow-sm">
                <span className={`text-2xl font-bold tabular-nums ${aqiInfo.textClass}`}>
                  {activeAqi ?? selectedResult.data.aqi}
                </span>
                <span className="text-muted-foreground text-xs">AQI</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${aqiInfo.dotClass}`} />
                  <span className={`text-sm font-semibold ${aqiInfo.textClass}`}>{aqiInfo.label}</span>
                  <span className="text-lg">{aqiInfo.emoji}</span>
                </div>
                <p className="font-semibold text-foreground">{selectedState.name}</p>
                <p className="text-muted-foreground text-xs">
                  Dominant Pollutant:{" "}
                  <span className="font-medium uppercase text-foreground">
                    {selectedResult.data.dominentpol}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* District CAQM Stations in Selected State */}
          {selectedState && (
            <div className="flex flex-col gap-2.5 rounded-xl bg-card p-3.5 ring-1 ring-border shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Building2 className="size-4 text-primary" />
                  <span>District Stations in {selectedState.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {getDistrictsByState(selectedState.id).length} Active Stations
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {getDistrictsByState(selectedState.id).map((dst) => {
                  const parentAqi = activeAqi ?? selectedResult?.data?.aqi ?? 60;
                  const dstAqi = Math.max(10, Math.min(450, parentAqi + dst.baseAqiOffset));
                  const dstInfo = getAqiInfo(dstAqi);
                  return (
                    <div
                      key={dst.id}
                      className="flex flex-col gap-1 rounded-lg border border-border/70 bg-muted/30 p-2.5 transition-all hover:bg-muted/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate">{dst.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border">
                          {dst.stationCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {dst.stationType} Monitoring
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`size-2 rounded-full ${dstInfo.dotClass}`} />
                          <span className={`text-xs font-bold font-mono ${dstInfo.textClass}`}>
                            {dstAqi} AQI
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pollutant Breakdown */}
          <PollutantBreakdown
            data={selectedResult?.data ?? null}
            stateName={selectedState?.name ?? ""}
          />

          {/* Forecast Chart */}
          <AqiForecastChart
            data={selectedResult?.data ?? null}
            stateName={selectedState?.name ?? ""}
          />
        </div>
      </div>

      {/* Attribution */}
      <p className="text-center text-muted-foreground text-xs">
        Data provided by{" "}
        <a href="https://eqms.doe.gov.my/" target="_blank" rel="noopener noreferrer" className="underline">
          Department of Environment Malaysia (DOE)
        </a>{" "}
        &amp;{" "}
        <a href="https://waqi.info/" target="_blank" rel="noopener noreferrer" className="underline">
          World Air Quality Index Project
        </a>
      </p>
    </div>
  );
}
