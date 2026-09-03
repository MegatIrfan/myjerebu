import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAllStatesAqi } from "../air-quality/_components/waqi-service";
import { malaysiaStates } from "../air-quality/_components/malaysia-states";
import { AlertsClient } from "./_components/alerts-client";

export const metadata: Metadata = {
  title: "Pusat Amaran & Notifikasi Jerebu — MyJerebu",
  description: "Tetapan amaran automatik, sistem pemberitahuan kecemasan kualiti udara, dan talian perhubungan kecemasan JAS Malaysia.",
};

export default async function AlertsPage() {
  const results = await fetchAllStatesAqi(malaysiaStates);

  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Memuatkan pusat amaran...</div>}>
      <AlertsClient initialResults={results} states={malaysiaStates} />
    </Suspense>
  );
}
