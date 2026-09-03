"use client";

import { AlertTriangle, CheckCircle2, MapPin, TrendingDown, TrendingUp, Wind } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import { malaysiaStates } from "./malaysia-states";

import type { StateAqiResult } from "./waqi-service";
import { getAqiInfo } from "./aqi-utils";

interface AqiKpiStripProps {
  results: StateAqiResult[];
}

export function AqiKpiStrip({ results }: AqiKpiStripProps) {
  const validResults = results.filter((r) => r.data !== null && !isNaN(r.data.aqi));

  const stateFlagMap = Object.fromEntries(malaysiaStates.map((s) => [s.id, s.flagCode]));

  const aqiValues = validResults.map((r) => ({
    id: r.stateId,
    name: r.stationName,
    aqi: r.data!.aqi,
    flagCode: stateFlagMap[r.stateId] || "ft",
  }));

  const worstState = aqiValues.length > 0 ? aqiValues.reduce((a, b) => (a.aqi > b.aqi ? a : b)) : null;
  const bestState = aqiValues.length > 0 ? aqiValues.reduce((a, b) => (a.aqi < b.aqi ? a : b)) : null;
  const unhealthyCount = aqiValues.filter((s) => s.aqi > 100).length;
  const nationalAvg =
    aqiValues.length > 0 ? Math.round(aqiValues.reduce((sum, s) => sum + s.aqi, 0) / aqiValues.length) : null;

  const worstInfo = worstState ? getAqiInfo(worstState.aqi) : null;
  const bestInfo = bestState ? getAqiInfo(bestState.aqi) : null;
  const avgInfo = getAqiInfo(nationalAvg);

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
      <div className="grid divide-y *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
        {/* Worst State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal text-sm">
              <TrendingUp className="size-4 text-red-500" />
              Highest AQI State
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {worstState ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-2xl leading-none tracking-tight">{worstState.aqi}</span>
                  <span className={`mb-0.5 text-xs font-medium ${worstInfo?.textClass}`}>AQI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MalaysiaFlag code={worstState.flagCode} size="xs" />
                  <span className="text-muted-foreground text-xs font-medium">{worstState.name}</span>
                </div>
                <span className={`text-xs font-medium ${worstInfo?.textClass}`}>{worstInfo?.label}</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">No data</span>
            )}
          </CardContent>
        </Card>

        {/* Best State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal text-sm">
              <TrendingDown className="size-4 text-green-500" />
              Cleanest Air State
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {bestState ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-2xl leading-none tracking-tight">{bestState.aqi}</span>
                  <span className={`mb-0.5 text-xs font-medium ${bestInfo?.textClass}`}>AQI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MalaysiaFlag code={bestState.flagCode} size="xs" />
                  <span className="text-muted-foreground text-xs font-medium">{bestState.name}</span>
                </div>
                <span className={`text-xs font-medium ${bestInfo?.textClass}`}>{bestInfo?.label}</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">No data</span>
            )}
          </CardContent>
        </Card>

        {/* Unhealthy Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal text-sm">
              <AlertTriangle className="size-4 text-orange-500" />
              Unhealthy Regions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
              <span className="text-2xl leading-none tracking-tight">{unhealthyCount}</span>
              <span className="mb-0.5 text-muted-foreground text-xs">/ {validResults.length} states</span>
            </div>
            <div className="flex items-center gap-2">
              {unhealthyCount === 0 ? (
                <>
                  <CheckCircle2 className="size-3.5 text-green-500" />
                  <span className="text-green-700 text-xs dark:text-green-300">All regions within safe levels</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-3.5 text-orange-500" />
                  <span className="text-orange-700 text-xs dark:text-orange-300">AQI exceeds 100</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* National Average */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-normal text-sm">
              <Wind className="size-4 text-blue-500" />
              National Average
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {nationalAvg !== null ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-2xl leading-none tracking-tight">{nationalAvg}</span>
                  <span className={`mb-0.5 text-xs font-medium ${avgInfo.textClass}`}>AQI</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${avgInfo.dotClass}`} />
                  <span className={`text-xs font-medium ${avgInfo.textClass}`}>{avgInfo.label}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <MapPin className="size-3" />
                  <span>Based on {validResults.length} stations</span>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">No data</span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
