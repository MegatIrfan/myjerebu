"use client";

import { useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  ShieldAlert,
  Activity,
  Droplets,
  Home,
  Ban,
  Wind,
  Car,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LandingHealthAdvisoriesProps {
  lang: "ms" | "en";
}

export function LandingHealthAdvisories({ lang }: LandingHealthAdvisoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const advisories = [
    {
      id: 1,
      icon: ShieldAlert,
      iconColor: "text-blue-500 bg-blue-500/10 ring-blue-500/25",
      titleMs: "Pakai Pelitup Muka",
      titleEn: "Wear Face Mask",
      descMs: "Gunakan pelitup muka (N95 / 3-Ply) apabila berada di luar bangunan sepanjang masa jerebu.",
      descEn: "Use N95 or 3-ply masks whenever heading outdoors during haze episodes.",
      badge: "Perlindungan Diri",
    },
    {
      id: 2,
      icon: Activity,
      iconColor: "text-amber-500 bg-amber-500/10 ring-amber-500/25",
      titleMs: "Hadkan Aktiviti Fizikal Luar",
      titleEn: "Limit Outdoor Workouts",
      descMs: "Hadkan aktiviti fizikal, sukan dan riadah di luar bangunan yang terdedah kepada udara tercemar.",
      descEn: "Reduce vigorous outdoor exercises and sports exposed to ambient air pollutants.",
      badge: "Aktiviti Fizikal",
    },
    {
      id: 3,
      icon: Droplets,
      iconColor: "text-cyan-500 bg-cyan-500/10 ring-cyan-500/25",
      titleMs: "Minum Air Secukupnya",
      titleEn: "Drink Plenty of Water",
      descMs: "Minum sekurang-kurangnya 2 hingga 3 liter air kosong sehari untuk mengekalkan hidrasi badan.",
      descEn: "Consume at least 2 to 3 liters of water daily to maintain proper hydration.",
      badge: "Hidrasi Tubuh",
    },
    {
      id: 4,
      icon: Home,
      iconColor: "text-emerald-500 bg-emerald-500/10 ring-emerald-500/25",
      titleMs: "Kekal di Dalam Bangunan",
      titleEn: "Stay Indoors",
      descMs: "Kekal berada di dalam rumah dan kurangkan masa berada di persekitaran luar terbuka.",
      descEn: "Stay indoors as much as possible and minimize outdoor exposure.",
      badge: "Keselamatan Rumah",
    },
    {
      id: 5,
      icon: Ban,
      iconColor: "text-red-500 bg-red-500/10 ring-red-500/25",
      titleMs: "Elakkan Pembakaran Terbuka",
      titleEn: "No Open Burning",
      descMs: "Dilarang sama sekali melakukan pembakaran sampah sarap atau sisa pertanian secara terbuka.",
      descEn: "Strictly prohibit all forms of open burning, garbage or agricultural waste incineration.",
      badge: "Larangan Keras",
    },
    {
      id: 6,
      icon: HeartPulse,
      iconColor: "text-purple-500 bg-purple-500/10 ring-purple-500/25",
      titleMs: "Lindungi Golongan Sensitif",
      titleEn: "Protect High-Risk Groups",
      descMs: "Kanak-kanak, warga emas, wanita hamil dan pesakit asma/jantung perlu dipantau dengan teliti.",
      descEn: "Children, seniors, pregnant mothers, and asthmatic patients require close care.",
      badge: "Kumpulan Berisiko",
    },
    {
      id: 7,
      icon: Wind,
      iconColor: "text-sky-500 bg-sky-500/10 ring-sky-500/25",
      titleMs: "Tutup Tingkap & Pasang Penapis",
      titleEn: "Close Windows & Filter Air",
      descMs: "Tutup semua pintu dan tingkap serta gunakan penapis udara berkecekapan tinggi (HEPA).",
      descEn: "Keep windows shut and operate high-efficiency particulate air (HEPA) purifiers.",
      badge: "Kualiti Udara Dalaman",
    },
    {
      id: 8,
      icon: Car,
      iconColor: "text-slate-500 bg-slate-500/10 ring-slate-500/25",
      titleMs: "Kitaran Udara Dalam Kenderaan",
      titleEn: "Recirculate Vehicle Air",
      descMs: "Gunakan mod kitaran udara dalaman (recirculation) pendingin hawa semasa memandu kenderaan.",
      descEn: "Switch vehicle air conditioning to internal recirculation mode while driving.",
      badge: "Pemanduan",
    },
    {
      id: 9,
      icon: Sparkles,
      iconColor: "text-teal-500 bg-teal-500/10 ring-teal-500/25",
      titleMs: "Kerap Cuci Muka & Tangan",
      titleEn: "Wash Face & Hands Regularly",
      descMs: "Kerap membasuh muka, mata dan tangan dengan air bersih selepas pulang dari luar.",
      descEn: "Rinse face, eyes, and exposed skin with clean water immediately after returning home.",
      badge: "Kebersihan Diri",
    },
    {
      id: 10,
      icon: Stethoscope,
      iconColor: "text-rose-500 bg-rose-500/10 ring-rose-500/25",
      titleMs: "Dapatkan Rawatan Segera",
      titleEn: "Seek Immediate Medical Help",
      descMs: "Segera ke klinik atau hospital jika mengalami sesak nafas, sakit dada atau batuk berterusan.",
      descEn: "Consult a healthcare provider immediately if experiencing shortness of breath or chest pain.",
      badge: "Kecemasan Kesihatan",
    },
  ];

  return (
    <Card className="border-border shadow-xs">
      {/* Header with Navigation Controls */}
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20 shadow-xs">
              <HeartPulse className="size-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold">
                {lang === "ms" ? "Nasihat Kesihatan Semasa Jerebu" : "Public Health Advisories During Haze"}
              </CardTitle>
              <CardDescription className="text-xs">
                {lang === "ms"
                  ? "Langkah berjaga-jaga disyorkan oleh Kementerian Kesihatan Malaysia (KKM) & JAS"
                  : "Official precautionary guidelines from Ministry of Health Malaysia & DOE"}
              </CardDescription>
            </div>
          </div>

          {/* Carousel Navigation Buttons using shadcn Button */}
          <CardAction className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="size-8 rounded-lg"
              title="Slide Left"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="size-8 rounded-lg"
              title="Slide Right"
            >
              <ChevronRight className="size-4" />
            </Button>
          </CardAction>
        </div>
      </CardHeader>

      {/* Horizontal Carousel List */}
      <CardContent className="pt-4">
        <div
          ref={scrollRef}
          className="flex gap-3.5 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {advisories.map((adv) => {
            const IconComp = adv.icon;
            return (
              <Card
                key={adv.id}
                className="w-[240px] sm:w-[260px] shrink-0 flex flex-col items-center justify-between p-4 text-center transition-all hover:scale-[1.02] shadow-xs border-border bg-card/60 hover:bg-card hover:border-primary/30"
              >
                <CardContent className="p-0 flex flex-col items-center">
                  {/* Clean shadcn Icon Badge */}
                  <div className={`mx-auto flex size-12 items-center justify-center rounded-2xl ring-1 shadow-xs mb-3 ${adv.iconColor}`}>
                    <IconComp className="size-6" />
                  </div>

                  <CardTitle className="text-xs font-bold line-clamp-1">
                    {lang === "ms" ? adv.titleMs : adv.titleEn}
                  </CardTitle>
                  <CardDescription className="text-[11px] mt-1.5 leading-relaxed line-clamp-3">
                    {lang === "ms" ? adv.descMs : adv.descEn}
                  </CardDescription>
                </CardContent>

                <CardFooter className="p-0 mt-3 w-full pt-2.5 border-t border-border/50 justify-between">
                  <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                    {adv.badge}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-primary">
                    #{adv.id}
                  </span>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
