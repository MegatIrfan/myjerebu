import { Suspense } from "react";
import { Wind } from "lucide-react";

import { malaysiaStates } from "./_components/malaysia-states";
import { fetchAllStatesAqi } from "./_components/waqi-service";
import { AirQualityClient } from "./_components/air-quality-client";

export const metadata = {
  title: "MyJerebu — Kualiti Udara Malaysia",
  description:
    "Pantau indeks kualiti udara (AQI) seluruh Malaysia secara masa nyata. Semak negeri yang tidak sihat dan ramalan 7 hari.",
};

async function AirQualityDashboard() {
  const results = await fetchAllStatesAqi(malaysiaStates);

  return <AirQualityClient initialResults={results} states={malaysiaStates} />;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl tracking-tight">MyJerebu 🌫️</h1>
        <p className="text-muted-foreground text-sm">Memuatkan data kualiti udara...</p>
      </div>
      <div className="flex items-center justify-center rounded-xl bg-muted/30 p-20 ring-1 ring-border">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Wind className="size-10 animate-pulse" />
          <span className="text-sm">Mengambil data dari WAQI...</span>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AirQualityDashboard />
    </Suspense>
  );
}
