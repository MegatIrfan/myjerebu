"use client";

import { FileText, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LandingOfficialReferencesProps {
  lang: "ms" | "en";
}

export function LandingOfficialReferences({ lang }: LandingOfficialReferencesProps) {
  const documents = [
    {
      id: 1,
      title: "Air Pollutant Index Calculation Guide (Panduan Pengiraan IPU)",
      date: "15 February 2026",
      category: "Technical Guide",
      size: "1.4 MB",
    },
    {
      id: 2,
      title: "Introduction to PM2.5 Ambient Standards (Pengenalan Kepada PM2.5)",
      date: "15 February 2026",
      category: "Standard Guidelines",
      size: "890 KB",
    },
    {
      id: 3,
      title: "Information on PM2.5 Continuous Monitoring (Maklumat Pemantauan PM2.5)",
      date: "15 February 2026",
      category: "Monitoring Protocol",
      size: "1.2 MB",
    },
    {
      id: 4,
      title: "IPU Health Impact & Precautionary Action Matrix (Matriks Tindakan Kesihatan)",
      date: "15 February 2026",
      category: "Public Health",
      size: "650 KB",
    },
    {
      id: 5,
      title: "Atmospheric Visibility & Haze FAQ (Jarak Penglihatan & Soalan Lazim Jerebu)",
      date: "15 February 2026",
      category: "Meteorology",
      size: "980 KB",
    },
    {
      id: 6,
      title: "Transboundary Haze Mitigation Protocol (Protokol Jerebu Rentas Sempadan)",
      date: "15 February 2026",
      category: "Environmental Policy",
      size: "2.1 MB",
    },
    {
      id: 7,
      title: "Nasihat Kesihatan Semasa Jerebu — Kementerian Kesihatan Malaysia (KKM)",
      date: "15 February 2026",
      category: "Health Advisory",
      size: "720 KB",
    },
  ];

  const handleDownload = (title: string) => {
    toast.success(`Memuat turun: ${title}`, {
      description: "Fail dokumen rujukan sedang dimuat turun.",
    });
  };

  return (
    <Card className="border-border shadow-xs">
      {/* Header */}
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">
                {lang === "ms" ? "Dokumen Rujukan & Penerbitan Rasmi" : "Official Publications & References"}
              </CardTitle>
              <CardDescription className="text-xs">
                {lang === "ms"
                  ? "Panduan pengiraan, protokol piawaian kualiti udara, dan dokumen dasar JAS"
                  : "Calculation guides, air quality standards, and official DOE guidelines"}
              </CardDescription>
            </div>
          </div>

          <CardAction>
            <Badge variant="secondary" className="text-xs font-semibold">
              {documents.length} Dokumen Tersedia
            </Badge>
          </CardAction>
        </div>
      </CardHeader>

      {/* Table using shadcn Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="bg-muted/70 text-[11px] font-bold text-muted-foreground uppercase">
                <TableHead className="py-2.5 px-3 w-12 text-center">No</TableHead>
                <TableHead className="py-2.5 px-3">Tajuk Dokumen / Publication Title</TableHead>
                <TableHead className="py-2.5 px-3 w-36 hidden sm:table-cell">Kategori</TableHead>
                <TableHead className="py-2.5 px-3 w-36 hidden md:table-cell">Tarikh Kemaskini</TableHead>
                <TableHead className="py-2.5 px-3 w-28 text-center">Muat Turun</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {documents.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                    {doc.id}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <FileText className="size-3.5 text-red-500 shrink-0" />
                      <span>{doc.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">
                    <Badge variant="outline" className="text-[10px] font-medium">
                      {doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-muted-foreground font-mono text-[11px] hidden md:table-cell">
                    {doc.date}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.title)}
                      className="gap-1 font-bold text-xs h-7 px-2.5 shadow-xs"
                      title={`Download ${doc.title} (${doc.size})`}
                    >
                      <Download className="size-3 text-primary" />
                      <span>PDF</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
