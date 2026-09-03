import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAllStatesAqi } from "../air-quality/_components/waqi-service";
import { malaysiaStates } from "../air-quality/_components/malaysia-states";
import { PollutantsClient } from "./_components/pollutants-client";

export const metadata: Metadata = {
  title: "Pecahan Bahan Pencemar Udara (PM2.5, PM10, O3, NO2, SO2) — MyJerebu",
  description: "Analisis saintifik kepekatan zarah dan gas pencemar utama di Malaysia serta panduan pendedahan kesihatan.",
};

export default async function PollutantsPage() {
  const results = await fetchAllStatesAqi(malaysiaStates);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuatkan data bahan pencemar...</div>}>
      <PollutantsClient initialResults={results} states={malaysiaStates} />
    </Suspense>
  );
}
