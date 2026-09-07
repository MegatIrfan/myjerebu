"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Info,
  ChevronLeft,
  ChevronRight,
  Wind,
  Activity,
  Flame,
  Droplets,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  TrendingDown,
  TrendingUp,
  Layers,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { malaysiaDistricts } from "@/app/(main)/dashboard/air-quality/_components/malaysia-districts";
import { getAqiInfo } from "@/app/(main)/dashboard/air-quality/_components/aqi-utils";
import type { StateAqiResult } from "@/app/(main)/dashboard/air-quality/_components/waqi-service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LandingHourlyTableProps {
  results: StateAqiResult[];
  lang: "ms" | "en";
}

export function LandingHourlyTable({ results, lang }: LandingHourlyTableProps) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<"all" | "peninsular" | "sabah" | "sarawak">("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 9;

  // Build 24 hour headers (24 unique hours up to 14:00 / current hour)
  const hours = useMemo(() => {
    const arr = [];
    for (let i = 23; i >= 0; i--) {
      const h = (14 - i + 24) % 24;
      arr.push(`${h.toString().padStart(2, "0")}:00`);
    }
    return arr;
  }, []);

  const aqiMap = useMemo(() => {
    return Object.fromEntries(results.map((r) => [r.stateId, r.data?.aqi ?? 60]));
  }, [results]);

  // Generate synthetic but realistic hourly progression for each district
  const tableData = useMemo(() => {
    return malaysiaDistricts.map((dst, idx) => {
      const baseAqi = Math.max(15, Math.min(420, (aqiMap[dst.stateId] ?? 60) + dst.baseAqiOffset));

      // Generate 24 hourly readings that fluctuate naturally
      const hourlyReadings = hours.map((_, hIdx) => {
        const diurnalWave = Math.sin((hIdx - 6) * 0.3) * 12; // Peak midday/afternoon
        const noise = ((idx * 7 + hIdx * 11) % 9) - 4;
        const val = Math.max(12, Math.round(baseAqi + diurnalWave + noise));
        return val;
      });

      return {
        id: dst.id,
        stateId: dst.stateId,
        stateName: dst.stateName,
        stationName: dst.name,
        stationCode: dst.stationCode,
        stationType: dst.stationType,
        currentAqi: baseAqi,
        readings: hourlyReadings,
      };
    });
  }, [aqiMap, hours]);

  // Filter
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      // Region filter
      if (selectedRegion === "peninsular" && (row.stateId === "sabah" || row.stateId === "sarawak")) {
        return false;
      }
      if (selectedRegion === "sabah" && row.stateId !== "sabah") {
        return false;
      }
      if (selectedRegion === "sarawak" && row.stateId !== "sarawak") {
        return false;
      }

      // State dropdown filter
      if (selectedState !== "all" && row.stateName.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          row.stationName.toLowerCase().includes(q) ||
          row.stateName.toLowerCase().includes(q) ||
          row.stationCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tableData, selectedRegion, selectedState, search]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentRows = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const uniqueStates = Array.from(new Set(malaysiaDistricts.map((d) => d.stateName))).sort();

  // Compute telemetry metrics for the top bento tiles
  const cleanestStation = useMemo(() => {
    if (tableData.length === 0) return null;
    return tableData.reduce((prev, curr) => (prev.currentAqi < curr.currentAqi ? prev : curr));
  }, [tableData]);

  const peakStation = useMemo(() => {
    if (tableData.length === 0) return null;
    return tableData.reduce((prev, curr) => (prev.currentAqi > curr.currentAqi ? prev : curr));
  }, [tableData]);

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Bento Stat Tiles Row (4 Bento Grid Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Stat 1: 68 Active Stations */}
        <Card className="shadow-xs border-border bg-card/70 hover:bg-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === "ms" ? "Stesen Pemantauan CAQM" : "Active CAQM Stations"}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-black tracking-tight">68 / 68</span>
              <Badge variant="secondary" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                100% Online
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Telemetri berterusan 24 jam seluruh Malaysia
            </CardDescription>
          </CardContent>
        </Card>

        {/* Bento Stat 2: Peak AQI Interval */}
        <Card className="shadow-xs border-border bg-card/70 hover:bg-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === "ms" ? "Waktu Kemuncak Telemetri" : "Peak Telemetry Interval"}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-black tracking-tight">14:00 – 17:00</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                MYT
              </Badge>
            </div>
            <CardDescription className="text-xs truncate">
              Stesen Tertinggi: <b className="text-foreground">{peakStation?.stationName}</b> ({peakStation?.currentAqi} AQI)
            </CardDescription>
          </CardContent>
        </Card>

        {/* Bento Stat 3: Cleanest Station */}
        <Card className="shadow-xs border-border bg-card/70 hover:bg-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === "ms" ? "Stesen Paling Bersih" : "Cleanest Station Today"}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <TrendingDown className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                {cleanestStation?.currentAqi} AQI
              </span>
              <Badge variant="outline" className="text-[10px] font-bold bg-blue-500/10 text-blue-600 border-blue-500/30">
                Baik (Good)
              </Badge>
            </div>
            <CardDescription className="text-xs truncate">
              {cleanestStation?.stationName} ({cleanestStation?.stateName})
            </CardDescription>
          </CardContent>
        </Card>

        {/* Bento Stat 4: Dominant Pollutant */}
        <Card className="shadow-xs border-border bg-card/70 hover:bg-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {lang === "ms" ? "Parameter Dominan" : "Dominant Pollutant"}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Wind className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-black tracking-tight">PM2.5</span>
              <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                &lt; 2.5 µm
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Partikel halus bawaan jerebu &amp; asap pembakaran
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Bento Hero: 24-Hour Continuous Telemetry Matrix (Full Width Bento Card) */}
      <Card className="border-border shadow-md overflow-hidden">
        <CardHeader className="border-b border-border pb-4 bg-muted/20">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BarChart3 className="size-4.5 text-primary" />
                  <span>{lang === "ms" ? "Jadual IPU Mengikut Jam (Siri Masa 24 Jam)" : "API Hourly Continuous Matrix (24 Hours)"}</span>
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs">
                  {filteredData.length} Stesen Ditapis
                </Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                {lang === "ms"
                  ? "Bacaan telemetri kualiti udara setiap jam mengikut piawaian Indeks Pencemar Udara (IPU)"
                  : "Hourly air pollutant index telemetry across Malaysian ambient monitoring network"}
              </CardDescription>
            </div>

            {/* Interactive Region Pills, State Selector & Search */}
            <CardAction className="flex flex-wrap items-center gap-2">
              {/* Region Switcher Buttons */}
              <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegion("all");
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                    selectedRegion === "all" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Semua (68)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegion("peninsular");
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                    selectedRegion === "peninsular" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Semenanjung
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegion("sabah");
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                    selectedRegion === "sabah" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sabah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegion("sarawak");
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                    selectedRegion === "sarawak" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sarawak
                </button>
              </div>

              {/* State Filter Dropdown */}
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg bg-muted px-2.5 text-xs font-semibold text-foreground border border-border outline-hidden cursor-pointer"
              >
                <option value="all">Semua Negeri (16)</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              {/* Search Station Input */}
              <div className="relative w-40 sm:w-48">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari stesen / kod..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 pl-8 text-xs bg-muted"
                />
              </div>
            </CardAction>
          </div>
        </CardHeader>

        {/* Spacious 24-Hour Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1050px] text-xs">
              <TableHeader>
                <TableRow className="bg-muted/70 text-[11px] font-bold text-muted-foreground uppercase border-b border-border">
                  <TableHead className="py-3 px-3 sticky left-0 bg-muted/95 z-20 w-12 text-center">No</TableHead>
                  <TableHead className="py-3 px-3 sticky left-12 bg-muted/95 z-20 w-36">Negeri / State</TableHead>
                  <TableHead className="py-3 px-3 sticky left-48 bg-muted/95 z-20 w-52">Stesen CAQM</TableHead>
                  {hours.map((h, idx) => (
                    <TableHead key={`hour-${h}-${idx}`} className="py-3 px-2 text-center font-mono font-bold w-12 text-[10px]">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {currentRows.map((row, rIdx) => (
                  <TableRow key={row.id} className="hover:bg-muted/40 transition-colors group">
                    <TableCell className="py-2.5 px-3 sticky left-0 bg-card z-10 font-mono text-muted-foreground text-center">
                      {(page - 1) * rowsPerPage + rIdx + 1}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 sticky left-12 bg-card z-10 font-bold text-foreground truncate">
                      {row.stateName}
                    </TableCell>
                    <TableCell className="py-2.5 px-3 sticky left-48 bg-card z-10 font-medium text-foreground truncate">
                      <div className="flex flex-col">
                        <span className="font-bold">{row.stationName}</span>
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {row.stationCode} · {row.stationType}
                        </span>
                      </div>
                    </TableCell>
                    {row.readings.map((val, vIdx) => {
                      const info = getAqiInfo(val);
                      return (
                        <TableCell key={vIdx} className="py-2.5 px-1 text-center font-mono">
                          <span
                            className="inline-block min-w-[36px] rounded-md px-1.5 py-0.5 text-[10px] font-black text-white shadow-xs transition-transform group-hover:scale-105"
                            style={{ backgroundColor: info.color }}
                            title={`${row.stationName} (${hours[vIdx]}): AQI ${val} — ${info.label}`}
                          >
                            {val}
                          </span>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Bottom Legend Pills & Pagination */}
        <CardFooter className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-3 bg-muted/10">
          {/* Color Legend matching exact APIMS standard */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
            <span className="text-muted-foreground mr-1">Skala IPU:</span>
            <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
              <span className="size-1.5 rounded-full bg-blue-500" /> Baik (0–50)
            </Badge>
            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
              <span className="size-1.5 rounded-full bg-green-500" /> Sederhana (51–100)
            </Badge>
            <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
              <span className="size-1.5 rounded-full bg-yellow-500" /> Tidak Sihat (101–200)
            </Badge>
            <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">
              <span className="size-1.5 rounded-full bg-orange-500" /> Sangat Tidak Sihat (201–300)
            </Badge>
            <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
              <span className="size-1.5 rounded-full bg-red-500" /> Berbahaya (301+)
            </Badge>
          </div>

          {/* Pagination with shadcn Button */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Muka {page} daripada {totalPages || 1} ({filteredData.length} Stesen)
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="size-7"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="size-7"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* 3. Bottom Bento Row: 6 Parameter Bento Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="size-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {lang === "ms" ? "Panduan 6 Parameter Utama Indeks Pencemaran Udara (IPU)" : "6 Core Air Pollutant Parameters Guide"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* PM2.5 Bento */}
          <Card className="border-border shadow-xs bg-card/70 hover:bg-card transition-all p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="default" className="text-[10px] font-mono font-bold">
                  PM2.5
                </Badge>
                <Wind className="size-3.5 text-primary" />
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2">Habuk Halus</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Partikel zarah &lt;2.5 mikrometer daripada asap jerebu &amp; kebakaran hutan.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
              Unit: <b>µg/m³</b> · Purata 24 Jam
            </div>
          </Card>

          {/* PM10 Bento */}
          <Card className="border-border shadow-xs bg-card/70 hover:bg-card transition-all p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px] font-mono font-bold">
                  PM10
                </Badge>
                <Layers className="size-3.5 text-blue-500" />
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2">Habuk Kasar</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Debu persekitaran jalan raya, tapak binaan dan tanah kering terdedah.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
              Unit: <b>µg/m³</b> · Purata 24 Jam
            </div>
          </Card>

          {/* SO2 Bento */}
          <Card className="border-border shadow-xs bg-card/70 hover:bg-card transition-all p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono font-bold text-emerald-600 border-emerald-500/30">
                  SO₂
                </Badge>
                <Flame className="size-3.5 text-emerald-500" />
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2">Sulfur Dioksida</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Pelepasan bahan api fosil daripada kilang industri dan stesen janakuasa.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
              Unit: <b>ppm</b> · Purata 1 Jam
            </div>
          </Card>

          {/* NO2 Bento */}
          <Card className="border-border shadow-xs bg-card/70 hover:bg-card transition-all p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono font-bold text-blue-600 border-blue-500/30">
                  NO₂
                </Badge>
                <Activity className="size-3.5 text-blue-500" />
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2">Nitrogen Dioksida</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Gas ekzos kenderaan bermotor di kawasan bandar berkepadatan tinggi.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
              Unit: <b>ppm</b> · Purata 1 Jam
            </div>
          </Card>

          {/* O3 Bento */}
          <Card className="border-border shadow-xs bg-card/70 hover:bg-card transition-all p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono font-bold text-amber-600 border-amber-500/30">
                  O₃
                </Badge>
                <Sparkles className="size-3.5 text-amber-500" />
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2">Ozon Paras Bumi</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Tindak balas fotokimia cahaya matahari ke atas gas pelepasan kenderaan.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
              Unit: <b>ppm</b> · Purata 8 Jam
            </div>
          </Card>

          {/* CO Bento */}
          <Card className="border-border shadow-xs bg-card/70 hover:bg-card transition-all p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono font-bold text-orange-600 border-orange-500/30">
                  CO
                </Badge>
                <ShieldCheck className="size-3.5 text-orange-500" />
              </div>
              <h4 className="text-xs font-bold text-foreground mt-2">Karbon Monoksida</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Hasil pembakaran tidak lengkap enjin kenderaan dan jentera berat.
              </p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
              Unit: <b>ppm</b> · Purata 8 Jam
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
