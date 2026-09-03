import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAllStatesAqi } from "../air-quality/_components/waqi-service";
import { malaysiaStates } from "../air-quality/_components/malaysia-states";
import { WeatherClient } from "./_components/weather-client";

export const metadata: Metadata = {
  title: "Kadar Suhu, Kelembapan & Cuaca Malaysia — MyJerebu",
  description: "Data cerapan meteorologi masa-nyata termasuk suhu persekitaran, kelembapan relatif, kelajuan angin dan tekanan udara di Malaysia.",
};

export default async function WeatherPage() {
  const results = await fetchAllStatesAqi(malaysiaStates);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuatkan data kaji cuaca...</div>}>
      <WeatherClient initialResults={results} states={malaysiaStates} />
    </Suspense>
  );
}
