import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAllStatesAqi } from "../air-quality/_components/waqi-service";
import { malaysiaStates } from "../air-quality/_components/malaysia-states";
import { ForecastClient } from "./_components/forecast-client";

export const metadata: Metadata = {
  title: "Ramalan 7 Hari IPU & Jerebu Malaysia — MyJerebu",
  description: "Projeksi mingguan kualiti udara, arah angin monsun, dan ramalan indeks pencemaran mengikut negeri.",
};

export default async function ForecastPage() {
  const results = await fetchAllStatesAqi(malaysiaStates);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuatkan model ramalan...</div>}>
      <ForecastClient initialResults={results} states={malaysiaStates} />
    </Suspense>
  );
}
