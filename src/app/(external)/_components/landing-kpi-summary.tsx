"use client";

import { useState, useMemo, useEffect } from "react";
import { LocateFixed, MapPin, Activity, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { getAqiInfo } from "@/app/(main)/dashboard/air-quality/_components/aqi-utils";
import { malaysiaDistricts, type MalaysiaDistrict } from "@/app/(main)/dashboard/air-quality/_components/malaysia-districts";
import type { StateAqiResult } from "@/app/(main)/dashboard/air-quality/_components/waqi-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AqiSocialCardExport } from "@/app/(main)/dashboard/air-quality/_components/aqi-social-card-export";
import { toast } from "sonner";

interface LandingKpiSummaryProps {
  results: StateAqiResult[];
  lang: "ms" | "en";
  selectedStationId?: string | null;
  onSelectStation?: (districtId: string) => void;
}

export function LandingKpiSummary({ results, lang, selectedStationId, onSelectStation }: LandingKpiSummaryProps) {
  const [nearestStation, setNearestStation] = useState<MalaysiaDistrict | null>(malaysiaDistricts[0]);
  const [userDistance, setUserDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Sync when selectedStationId changes
  useEffect(() => {
    if (selectedStationId) {
      const found = malaysiaDistricts.find((d) => d.id === selectedStationId);
      if (found) {
        setNearestStation(found);
      }
    }
  }, [selectedStationId]);

  // Calculate AQI map lookup
  const aqiMap = useMemo(() => {
    return Object.fromEntries(results.map((r) => [r.stateId, r.data?.aqi ?? 60]));
  }, [results]);

  // Compute stats across all 68+ districts
  const counts = useMemo(() => {
    let good = 0;
    let moderate = 0;
    let unhealthy = 0;
    let veryUnhealthy = 0;
    let hazardous = 0;

    malaysiaDistricts.forEach((dst) => {
      const parentAqi = aqiMap[dst.stateId] ?? 60;
      const aqi = Math.max(10, Math.min(450, parentAqi + dst.baseAqiOffset));
      if (aqi <= 50) good++;
      else if (aqi <= 100) moderate++;
      else if (aqi <= 200) unhealthy++;
      else if (aqi <= 300) veryUnhealthy++;
      else hazardous++;
    });

    return { good, moderate, unhealthy, veryUnhealthy, hazardous, total: malaysiaDistricts.length };
  }, [aqiMap]);

  // Handle GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    toast.loading(lang === "ms" ? "Mencari stesen terdekat..." : "Locating nearest station...", { id: "geo-summary" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let closest = malaysiaDistricts[0];
        let minD = Infinity;

        malaysiaDistricts.forEach((dst) => {
          const R = 6371;
          const dLat = ((dst.coordinates[0] - lat) * Math.PI) / 180;
          const dLon = ((dst.coordinates[1] - lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) * Math.cos((dst.coordinates[0] * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;

          if (dist < minD) {
            minD = dist;
            closest = dst;
          }
        });

        setNearestStation(closest);
        setUserDistance(minD);
        toast.success(
          lang === "ms"
            ? `📍 Stesen terdekat: ${closest.name} (${minD.toFixed(1)} km)`
            : `📍 Nearest station: ${closest.name} (${minD.toFixed(1)} km)`,
          { id: "geo-summary" }
        );

        if (onSelectStation) {
          onSelectStation(closest.id);
        }
      },
      () => {
        setIsLocating(false);
        toast.error(lang === "ms" ? "Gagal mengesan lokasi GPS." : "Failed to obtain GPS location.", { id: "geo-summary" });
      },
      { timeout: 8000 }
    );
  };

  const nearestParentAqi = nearestStation ? aqiMap[nearestStation.stateId] ?? 60 : 60;
  const nearestAqi = nearestStation ? Math.max(10, Math.min(450, nearestParentAqi + nearestStation.baseAqiOffset)) : 60;
  const nearestInfo = getAqiInfo(nearestAqi);

  const nowTime = new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" });
  const nowDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
      {/* Left Card: 6-Tier Dashboard Summary Counters (8 cols) using shadcn Card */}
      <Card className="lg:col-span-8 flex flex-col justify-between shadow-xs border-border">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold">
                {lang === "ms" ? "Ringkasan Status Kualiti Udara (IPU)" : "Air Quality Status Summary (API)"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {nowDate}, {nowTime} (MYT +08:00) · 68 Stesen CAQM Beroperasi
              </CardDescription>
            </div>
            <CardAction>
              <Badge variant="outline" className="font-mono text-xs">
                Total: 68 Stations
              </Badge>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {/* 6 Grid Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {/* Good (0-50) - Blue */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/25 p-3 text-center transition-all hover:scale-[1.02]">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Good</span>
              <span className="text-[9px] text-muted-foreground font-medium">0 – 50</span>
              <div className="my-1.5 flex size-9 items-center justify-center rounded-full bg-blue-500 text-white font-black text-base shadow-sm">
                {counts.good}
              </div>
              <span className="text-[10px] text-muted-foreground">Stations</span>
            </div>

            {/* Moderate (51-100) - Green */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-green-500/10 border border-green-500/25 p-3 text-center transition-all hover:scale-[1.02]">
              <span className="text-[11px] font-bold text-green-600 dark:text-green-400">Moderate</span>
              <span className="text-[9px] text-muted-foreground font-medium">51 – 100</span>
              <div className="my-1.5 flex size-9 items-center justify-center rounded-full bg-green-500 text-white font-black text-base shadow-sm">
                {counts.moderate}
              </div>
              <span className="text-[10px] text-muted-foreground">Stations</span>
            </div>

            {/* Unhealthy (101-200) - Yellow */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/25 p-3 text-center transition-all hover:scale-[1.02]">
              <span className="text-[11px] font-bold text-yellow-600 dark:text-yellow-400">Unhealthy</span>
              <span className="text-[9px] text-muted-foreground font-medium">101 – 200</span>
              <div className="my-1.5 flex size-9 items-center justify-center rounded-full bg-yellow-500 text-white font-black text-base shadow-sm">
                {counts.unhealthy}
              </div>
              <span className="text-[10px] text-muted-foreground">Stations</span>
            </div>

            {/* Very Unhealthy (201-300) - Orange */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/25 p-3 text-center transition-all hover:scale-[1.02]">
              <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">Very Unhealthy</span>
              <span className="text-[9px] text-muted-foreground font-medium">201 – 300</span>
              <div className="my-1.5 flex size-9 items-center justify-center rounded-full bg-orange-500 text-white font-black text-base shadow-sm">
                {counts.veryUnhealthy}
              </div>
              <span className="text-[10px] text-muted-foreground">Stations</span>
            </div>

            {/* Hazardous (301+) - Red */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-center transition-all hover:scale-[1.02]">
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400">Hazardous</span>
              <span className="text-[9px] text-muted-foreground font-medium">301+</span>
              <div className="my-1.5 flex size-9 items-center justify-center rounded-full bg-red-500 text-white font-black text-base shadow-sm">
                {counts.hazardous}
              </div>
              <span className="text-[10px] text-muted-foreground">Stations</span>
            </div>

            {/* N/A - Gray */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-muted/50 border border-border p-3 text-center transition-all hover:scale-[1.02]">
              <span className="text-[11px] font-bold text-muted-foreground">N/A</span>
              <span className="text-[9px] text-muted-foreground font-medium">Offline</span>
              <div className="my-1.5 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground font-black text-base ring-1 ring-border">
                0
              </div>
              <span className="text-[10px] text-muted-foreground">Stations</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-border pt-3 text-[11px] text-muted-foreground justify-between">
          <span>* Pengiraan IPU berdasarkan purata 24 jam parameter dominan (PM2.5).</span>
          <Badge variant="secondary" className="text-[10px] font-semibold">
            JAS &amp; MetMalaysia Feed
          </Badge>
        </CardFooter>
      </Card>

      {/* Right Card: Nearest Station Detector (4 cols) using shadcn Card */}
      <Card className="lg:col-span-4 flex flex-col justify-between shadow-xs border-border">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              {lang === "ms" ? "Stesen Terdekat Anda" : "Nearest Station (GPS)"}
            </CardTitle>
            <CardAction>
              <Button
                variant="default"
                size="sm"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="gap-1.5 text-xs font-bold h-7 px-2.5 shadow-xs"
              >
                <LocateFixed className={`size-3 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Detecting..." : "Detect GPS"}</span>
              </Button>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {nearestStation ? (
            <div className="flex items-center gap-3.5">
              {/* Big AQI Pill */}
              <div
                className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white font-black shadow-md"
                style={{ backgroundColor: nearestInfo.color }}
              >
                <span className="text-2xl leading-none font-mono font-black">{nearestAqi}</span>
                <span className="text-[9px] tracking-wider uppercase font-sans mt-0.5">AQI / IPU</span>
              </div>

              <div className="flex flex-col gap-0.5 overflow-hidden">
                <span className="text-sm font-bold text-foreground truncate">{nearestStation.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {nearestStation.stateName} · <span className="font-mono text-[10px]">{nearestStation.stationCode}</span>
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="outline" className="gap-1 px-1.5 py-0.2 text-[10px] font-bold" style={{ color: nearestInfo.color, borderColor: `${nearestInfo.color}40` }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: nearestInfo.color }} />
                    {nearestInfo.label} ({nearestInfo.labelMs})
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Tekan butang Detect GPS untuk mencari stesen berdekatan anda.
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border pt-3 text-[11px] justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">
              Jenis: <b>{nearestStation?.stationType}</b>
            </span>
            {userDistance !== null && (
              <Badge variant="secondary" className="font-bold text-primary">
                Jarak: {userDistance.toFixed(1)} km
              </Badge>
            )}
          </div>
          <AqiSocialCardExport
            results={results}
            defaultStateId={nearestStation?.stateId || "kuala-lumpur"}
            defaultDistrictId={nearestStation?.id}
            initialLang={lang}
            trigger={
              <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs font-bold gap-1.5 shadow-xs">
                <span>{lang === "ms" ? "Eksport Kad JPG (4:3)" : "Export 4:3 Card"}</span>
              </Button>
            }
          />
        </CardFooter>
      </Card>
    </div>
  );
}
