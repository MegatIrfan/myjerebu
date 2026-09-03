"use client";

import { useState } from "react";
import type { StateAqiResult } from "@/app/(main)/dashboard/air-quality/_components/waqi-service";
import { LandingNavbar } from "./landing-navbar";
import { LandingHeroMap } from "./landing-hero-map";
import { LandingKpiSummary } from "./landing-kpi-summary";
import { LandingHourlyTable } from "./landing-hourly-table";
import { LandingDailyRankings } from "./landing-daily-rankings";
import { LandingOfficialReferences } from "./landing-official-references";
import { LandingHealthAdvisories } from "./landing-health-advisories";
import { LandingFooter } from "./landing-footer";

interface LandingPageClientProps {
  initialResults: StateAqiResult[];
}

export function LandingPageClient({ initialResults }: LandingPageClientProps) {
  const [lang, setLang] = useState<"ms" | "en">("ms");
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);

  const handleToggleLang = () => {
    setLang((prev) => (prev === "ms" ? "en" : "ms"));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Government APIMS Navbar */}
      <LandingNavbar lang={lang} onToggleLang={handleToggleLang} />

      {/* Main Body Content with wider max-w for Bento Grid */}
      <main className="container mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* 1. Hero Map Section */}
        <LandingHeroMap
          results={initialResults}
          lang={lang}
          selectedStateId={selectedStateId}
          onStateSelect={setSelectedStateId}
        />

        {/* 2. KPI Summary Counters & Nearest Station */}
        <LandingKpiSummary
          results={initialResults}
          lang={lang}
        />

        {/* 3. Hourly API Table & Parameter Information */}
        <div id="hourly-section" className="scroll-mt-20">
          <LandingHourlyTable
            results={initialResults}
            lang={lang}
          />
        </div>

        {/* 4. Daily Rankings & 24-Hour Trend Chart */}
        <div id="ranking-section" className="scroll-mt-20">
          <LandingDailyRankings
            results={initialResults}
            lang={lang}
          />
        </div>

        {/* 5. Health Advisories Carousel (Nasihat Semasa Jerebu) */}
        <div id="advisory-section" className="scroll-mt-20">
          <LandingHealthAdvisories
            lang={lang}
          />
        </div>

        {/* 6. Official References & PDF Publications */}
        <div id="references-section" className="scroll-mt-20">
          <LandingOfficialReferences
            lang={lang}
          />
        </div>
      </main>

      {/* Official Government Footer */}
      <LandingFooter lang={lang} />
    </div>
  );
}
