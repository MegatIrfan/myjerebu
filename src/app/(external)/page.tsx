import { Suspense } from "react";
import { Wind } from "lucide-react";
import { malaysiaStates } from "@/app/(main)/dashboard/air-quality/_components/malaysia-states";
import { fetchAllStatesAqi } from "@/app/(main)/dashboard/air-quality/_components/waqi-service";
import { LandingPageClient } from "./_components/landing-page-client";

export const metadata = {
  title: "MyJerebu APIMS — Sistem Pengurusan Indeks Pencemaran Udara Malaysia",
  description:
    "Portal Rasmi Pemantauan Kualiti Udara (APIMS / IPU) Malaysia — Pantau 68+ stesen pemantauan udara berterusan (CAQM), jadual siri masa 24 jam, dan nasihat kesihatan jerebu.",
};

async function LandingPageContent() {
  const results = await fetchAllStatesAqi(malaysiaStates);
  return <LandingPageClient initialResults={results} />;
}

function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 space-y-4">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
        <Wind className="size-8" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold">MyJerebu APIMS</h2>
        <p className="text-xs text-muted-foreground">Memuatkan data telemetri kualiti udara 68+ stesen Malaysia...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LandingSkeleton />}>
      <LandingPageContent />
    </Suspense>
  );
}
