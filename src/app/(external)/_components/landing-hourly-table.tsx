"use client";

import { useState, useMemo } from "react";
import { Search, Info, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [selectedState, setSelectedState] = useState<string>("all");
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  // Build 24 hour headers (e.g. from 14:00 yesterday to 14:00 today)
  const hours = useMemo(() => {
    const arr = [];
    for (let h = 14; h < 24; h++) {
      arr.push(`${h.toString().padStart(2, "0")}:00`);
    }
    for (let h = 0; h <= 14; h++) {
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
        stateName: dst.stateName,
        stationName: dst.name,
        stationCode: dst.stationCode,
        currentAqi: baseAqi,
        readings: hourlyReadings,
      };
    });
  }, [aqiMap, hours]);

  // Filter
  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      if (selectedState !== "all" && row.stateName.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
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
  }, [tableData, selectedState, search]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentRows = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const uniqueStates = Array.from(new Set(malaysiaDistricts.map((d) => d.stateName))).sort();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Left Info Box: Information on Pollutants (3 cols) using shadcn Card */}
      <Card className="lg:col-span-3 flex flex-col justify-between h-full border-border shadow-xs">
        <div>
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Info className="size-4 text-primary" />
              <span>{lang === "ms" ? "Maklumat Parameter (IPU)" : "Information on Parameters"}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              6 Parameter Pemantauan Udara
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-2.5">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 border border-border/50">
              <span className="font-mono font-bold text-primary">*</span>
              <span className="font-semibold text-foreground text-xs">PM2.5</span>
              <span className="text-[11px] text-muted-foreground">Habuk Halus (&lt;2.5 µm)</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 border border-border/50">
              <span className="font-mono font-bold text-primary">*</span>
              <span className="font-semibold text-foreground text-xs">PM10</span>
              <span className="text-[11px] text-muted-foreground">Habuk Kasar (&lt;10 µm)</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 border border-border/50">
              <span className="font-mono font-bold text-emerald-500">a</span>
              <span className="font-semibold text-foreground text-xs">SO₂</span>
              <span className="text-[11px] text-muted-foreground">Sulfur Dioksida</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 border border-border/50">
              <span className="font-mono font-bold text-blue-500">b</span>
              <span className="font-semibold text-foreground text-xs">NO₂</span>
              <span className="text-[11px] text-muted-foreground">Nitrogen Dioksida</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 border border-border/50">
              <span className="font-mono font-bold text-amber-500">c</span>
              <span className="font-semibold text-foreground text-xs">O₃</span>
              <span className="text-[11px] text-muted-foreground">Ozon Paras Bumi</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2 border border-border/50">
              <span className="font-mono font-bold text-orange-500">d</span>
              <span className="font-semibold text-foreground text-xs">CO</span>
              <span className="text-[11px] text-muted-foreground">Karbon Monoksida</span>
            </div>
          </CardContent>
        </div>

        <CardFooter className="border-t border-border pt-3 text-[10px] text-muted-foreground leading-relaxed">
          <b>Nota:</b> IPU dikira berdasarkan purata 24 jam bagi parameter dominan.
        </CardFooter>
      </Card>

      {/* Right Box: API Table (Hourly) - (9 cols) using shadcn Card & Table */}
      <Card className="lg:col-span-9 flex flex-col justify-between border-border shadow-xs">
        <div>
          <CardHeader className="border-b border-border pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold">
                  {lang === "ms" ? "Jadual IPU Mengikut Jam (24 Jam)" : "API Table (Hourly 24-Hour Trend)"}
                </CardTitle>
                <CardDescription className="text-xs">
                  {lang === "ms" ? "Bacaan siri masa setiap stesen di Malaysia" : "Continuous time-series telemetry across Malaysian stations"}
                </CardDescription>
              </div>

              <CardAction className="flex items-center gap-2">
                {/* State Filter */}
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

                {/* Search Input */}
                <div className="relative w-36 sm:w-44">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari stesen..."
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

          {/* Horizontally Scrollable 24-Hour Table using shadcn Table */}
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[950px] text-xs">
                <TableHeader>
                  <TableRow className="bg-muted/80 text-[11px] font-bold text-muted-foreground uppercase">
                    <TableHead className="py-2.5 px-3 sticky left-0 bg-muted/95 z-10 w-10">No</TableHead>
                    <TableHead className="py-2.5 px-3 sticky left-10 bg-muted/95 z-10 w-32">State</TableHead>
                    <TableHead className="py-2.5 px-3 sticky left-42 bg-muted/95 z-10 w-44">Station</TableHead>
                    {hours.map((h) => (
                      <TableHead key={h} className="py-2.5 px-2 text-center font-mono font-bold w-12 text-[10px]">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/60">
                  {currentRows.map((row, rIdx) => (
                    <TableRow key={row.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="py-2 px-3 sticky left-0 bg-card z-10 font-mono text-muted-foreground">
                        {(page - 1) * rowsPerPage + rIdx + 1}
                      </TableCell>
                      <TableCell className="py-2 px-3 sticky left-10 bg-card z-10 font-bold text-foreground truncate">
                        {row.stateName}
                      </TableCell>
                      <TableCell className="py-2 px-3 sticky left-42 bg-card z-10 font-medium text-foreground truncate">
                        <span>{row.stationName}</span>
                        <span className="block font-mono text-[9px] text-muted-foreground">{row.stationCode}</span>
                      </TableCell>
                      {row.readings.map((val, vIdx) => {
                        const info = getAqiInfo(val);
                        return (
                          <TableCell key={vIdx} className="py-2 px-1 text-center font-mono">
                            <span
                              className="inline-block min-w-[34px] rounded px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs"
                              style={{ backgroundColor: info.color }}
                              title={`${row.stationName} at ${hours[vIdx]}: AQI ${val} (${info.label})`}
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
        </div>

        {/* Bottom Legend Pills & Pagination */}
        <CardFooter className="border-t border-border pt-3 flex flex-wrap items-center justify-between gap-3">
          {/* Color Legend matching exact APIMS image */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
            <span className="text-muted-foreground mr-1">Status:</span>
            <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
              <span className="size-1.5 rounded-full bg-blue-500" /> Good (0–50)
            </Badge>
            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
              <span className="size-1.5 rounded-full bg-green-500" /> Moderate (51–100)
            </Badge>
            <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
              <span className="size-1.5 rounded-full bg-yellow-500" /> Unhealthy (101–200)
            </Badge>
            <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">
              <span className="size-1.5 rounded-full bg-orange-500" /> Very Unhealthy (201–300)
            </Badge>
            <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
              <span className="size-1.5 rounded-full bg-red-500" /> Hazardous (301+)
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
    </div>
  );
}
