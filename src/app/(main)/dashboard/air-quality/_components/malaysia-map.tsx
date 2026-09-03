import dynamic from "next/dynamic";
import type { StateAqiResult } from "./waqi-service";
import type { SimulationDay } from "./haze-simulation-data";

export interface MalaysiaMapProps {
  results: StateAqiResult[];
  selectedStateId: string | null;
  onStateSelect: (stateId: string) => void;
  simulationDay?: SimulationDay | null;
  isSimulationActive?: boolean;
  onToggleSimulation?: (active: boolean) => void;
}

// Dynamically import the actual map to avoid SSR issues with Leaflet
const MalaysiaMapInner = dynamic(() => import("./malaysia-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[560px] items-center justify-center rounded-2xl bg-muted/30 ring-1 ring-border">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span className="text-xs font-semibold">Memuatkan peta satelit & penderia jerebu...</span>
      </div>
    </div>
  ),
});

export function MalaysiaMap(props: MalaysiaMapProps) {
  return <MalaysiaMapInner {...props} />;
}
