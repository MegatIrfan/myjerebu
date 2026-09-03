"use client";

import { AlertCircle, Wind } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { MalaysiaFlag } from "@/components/malaysia-flag";

import type { StateAqiResult } from "./waqi-service";
import type { MalaysiaState } from "./malaysia-states";
import { getAqiInfo } from "./aqi-utils";

interface StateAqiGridProps {
  states: MalaysiaState[];
  results: StateAqiResult[];
  selectedStateId: string | null;
  onStateSelect: (stateId: string) => void;
}

export function StateAqiGrid({ states, results, selectedStateId, onStateSelect }: StateAqiGridProps) {
  const resultMap: Record<string, StateAqiResult> = Object.fromEntries(results.map((r) => [r.stateId, r]));

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
      {states.map((state) => {
        const result = resultMap[state.id];
        const aqi = result?.data?.aqi ?? null;
        const info = getAqiInfo(aqi);
        const isSelected = selectedStateId === state.id;

        return (
          <Card
            key={state.id}
            onClick={() => onStateSelect(state.id)}
            className={[
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              isSelected ? `ring-2 ring-foreground shadow-md` : "ring-1 ring-border hover:ring-foreground/30",
            ].join(" ")}
          >
            <CardContent className="flex flex-col gap-1.5 p-3">
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <MalaysiaFlag code={state.flagCode} size="sm" className="shadow-xs" />
                  <p className="truncate text-xs font-semibold leading-tight">{state.name}</p>
                </div>
                {aqi !== null ? (
                  <Badge
                    className={`shrink-0 text-xs font-bold tabular-nums ${info.badgeBgClass} ${info.badgeTextClass}`}
                  >
                    {aqi}
                  </Badge>
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`size-2 shrink-0 rounded-full ${info.dotClass}`} />
                <span className={`truncate text-xs ${info.textClass}`}>
                  {aqi !== null ? info.label : "No data"}
                </span>
              </div>

              {result?.data?.dominentpol && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Wind className="size-3" />
                  <span className="text-xs uppercase">{result.data.dominentpol}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
