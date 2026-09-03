"use client";

import { useState } from "react";
import {
  Archive,
  BarChart,
  Calendar,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ReportItem {
  id: string;
  title: string;
  year: number;
  month?: string;
  category: "annual" | "monthly" | "special" | "technical";
  size: string;
  datePublished: string;
  pages: number;
  highlight: string;
  peakAqi: number;
}

const REPORTS_DATA: ReportItem[] = [
  {
    id: "rep-2026-q1",
    title: "Quarter 1 Air Quality Monitoring Report 2026",
    year: 2026,
    month: "March",
    category: "monthly",
    size: "4.8 MB",
    datePublished: "28 March 2026",
    pages: 42,
    highlight: "Air quality remained stable across Peninsular Malaysia with localized PM2.5 elevations in Western Sarawak.",
    peakAqi: 273,
  },
  {
    id: "rep-2025-annual",
    title: "Annual Environmental Quality Report Malaysia 2025",
    year: 2025,
    category: "annual",
    size: "18.2 MB",
    datePublished: "15 January 2026",
    pages: 184,
    highlight: "94% of monitored calendar days recorded Good and Moderate air quality levels nationally.",
    peakAqi: 188,
  },
  {
    id: "rep-2024-annual",
    title: "National Air Pollutant Index Performance Report 2024",
    year: 2024,
    category: "annual",
    size: "15.6 MB",
    datePublished: "10 January 2025",
    pages: 156,
    highlight: "12% reduction in annual mean PM2.5 concentrations compared to the previous calendar year.",
    peakAqi: 195,
  },
  {
    id: "rep-2023-haze",
    title: "Special Technical Assessment of Southwest Monsoon Transboundary Haze 2023",
    year: 2023,
    category: "special",
    size: "9.1 MB",
    datePublished: "5 November 2023",
    pages: 88,
    highlight: "Scientific dispersion modeling and satellite trajectory verification of regional peatland fire plumes.",
    peakAqi: 220,
  },
  {
    id: "rep-2019-haze",
    title: "Comprehensive Southeast Asia Haze Crisis Assessment Report 2019",
    year: 2019,
    category: "special",
    size: "24.5 MB",
    datePublished: "12 December 2019",
    pages: 210,
    highlight: "Major severe transboundary haze episode that triggered precautionary closures of 2,400 schools in Peninsular & Sarawak.",
    peakAqi: 367,
  },
  {
    id: "rep-tech-stations",
    title: "Technical Sensor Specifications & PM2.5/PM10 Calibration Standards 2025",
    year: 2025,
    category: "technical",
    size: "6.3 MB",
    datePublished: "18 August 2025",
    pages: 64,
    highlight: "Standard operating procedures and optical particle counter calibration guidelines for state monitoring networks.",
    peakAqi: 120,
  },
];

export function ReportsClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  const filteredReports = REPORTS_DATA.filter((rep) => {
    if (selectedCategory !== "all" && rep.category !== selectedCategory) return false;
    if (selectedYear !== "all" && rep.year.toString() !== selectedYear) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return rep.title.toLowerCase().includes(q) || rep.highlight.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDownload = (rep: ReportItem) => {
    toast.success(`Downloading report: "${rep.title}" (${rep.size})`);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl tracking-tight sm:text-3xl">Official Annual &amp; Haze Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Historical repository and downloadable scientific documentation on air pollution index records in Malaysia.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Archive className="size-4" />
            <span>Total Published Reports</span>
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2 block">6 Documents</span>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Annual, quarterly &amp; technical whitepapers
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
            <TrendingDown className="size-4" />
            <span>Clean Days Mean Rate</span>
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2 block">94.2%</span>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Annual AQI recorded at Good and Moderate
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
            <TrendingUp className="size-4" />
            <span>Historical Peak Peak AQI</span>
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2 block">367 AQI</span>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Recorded during September 2019 haze crisis
          </span>
        </Card>

        <Card className="p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
            <FileCheck className="size-4" />
            <span>Compliance Standard</span>
          </div>
          <span className="text-3xl font-extrabold text-foreground mt-2 block">100% Verified</span>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Validated by Department of Environment Malaysia
          </span>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-3 ring-1 ring-border shadow-xs">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search report titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border">
            {[
              { id: "all", label: "All Categories" },
              { id: "annual", label: "Annual" },
              { id: "monthly", label: "Quarterly" },
              { id: "special", label: "Special Assessment" },
              { id: "technical", label: "Technical" },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedCategory === c.id
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-8 rounded-lg bg-muted px-2.5 text-xs font-medium text-foreground ring-1 ring-border outline-hidden cursor-pointer"
          >
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2019">2019</option>
          </select>
        </div>
      </div>

      {/* Reports List Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredReports.map((rep) => (
          <Card key={rep.id} className="p-5 ring-1 ring-border hover:shadow-md transition-all flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary shrink-0" />
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">
                    {rep.category}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{rep.datePublished}</span>
              </div>

              <CardTitle className="text-sm font-bold text-foreground leading-snug">
                {rep.title}
              </CardTitle>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {rep.highlight}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 text-muted-foreground font-mono text-[11px]">
                <span>{rep.pages} pages</span>
                <span>•</span>
                <span>PDF ({rep.size})</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(rep)}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                <Download className="size-3.5" />
                <span>Download PDF</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
