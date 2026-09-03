import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAllStatesAqi } from "../air-quality/_components/waqi-service";
import { malaysiaStates } from "../air-quality/_components/malaysia-states";
import { StationsClient } from "./_components/stations-client";

export const metadata: Metadata = {
  title: "16 Stesen Pemantauan Negeri — MyJerebu",
  description: "Senarai lengkap dan status masa-nyata 16 stesen cerapan kualiti udara di seluruh negeri dan wilayah persekutuan Malaysia.",
};

export default async function StationsPage() {
  const results = await fetchAllStatesAqi(malaysiaStates);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuatkan data stesen...</div>}>
      <StationsClient initialResults={results} states={malaysiaStates} />
    </Suspense>
  );
}
