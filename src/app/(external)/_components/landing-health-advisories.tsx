"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, HeartPulse } from "lucide-react";
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
      icon: "😷",
      titleMs: "Pakai Pelitup Muka",
      titleEn: "Wear Face Mask",
      descMs: "Gunakan pelitup muka (N95 / 3-Ply) apabila berada di luar bangunan sepanjang masa jerebu.",
      descEn: "Use N95 or 3-ply masks whenever heading outdoors during haze episodes.",
      bgGradient: "from-blue-500/10 to-indigo-500/10",
      accentColor: "border-blue-500/30",
    },
    {
      id: 2,
      icon: "🏃‍♂️",
      titleMs: "Hadkan Aktiviti Fizikal Luar",
      titleEn: "Limit Outdoor Workouts",
      descMs: "Hadkan aktiviti fizikal, sukan dan riadah di luar bangunan yang terdedah kepada udara tercemar.",
      descEn: "Reduce vigorous outdoor exercises and sports exposed to ambient air pollutants.",
      bgGradient: "from-amber-500/10 to-orange-500/10",
      accentColor: "border-amber-500/30",
    },
    {
      id: 3,
      icon: "💧",
      titleMs: "Minum Air Secukupnya",
      titleEn: "Drink Plenty of Water",
      descMs: "Minum sekurang-kurangnya 2 hingga 3 liter air kosong sehari untuk mengekalkan hidrasi badan.",
      descEn: "Consume at least 2 to 3 liters of water daily to maintain proper hydration.",
      bgGradient: "from-cyan-500/10 to-blue-500/10",
      accentColor: "border-cyan-500/30",
    },
    {
      id: 4,
      icon: "🏠",
      titleMs: "Kekal di Dalam Bangunan",
      titleEn: "Stay Indoors",
      descMs: "Kekal berada di dalam rumah dan kurangkan masa berada di persekitaran luar terbuka.",
      descEn: "Stay indoors as much as possible and minimize outdoor exposure.",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      accentColor: "border-emerald-500/30",
    },
    {
      id: 5,
      icon: "🔥",
      titleMs: "Elakkan Pembakaran Terbuka",
      titleEn: "No Open Burning",
      descMs: "Dilarang sama sekali melakukan pembakaran sampah sarap atau sisa pertanian secara terbuka.",
      descEn: "Strictly prohibit all forms of open burning, garbage or agricultural waste incineration.",
      bgGradient: "from-red-500/10 to-rose-500/10",
      accentColor: "border-red-500/30",
    },
    {
      id: 6,
      icon: "🧓",
      titleMs: "Lindungi Golongan Sensitif",
      titleEn: "Protect High-Risk Groups",
      descMs: "Kanak-kanak, warga emas, wanita hamil dan pesakit asma/jantung perlu dipantau dengan teliti.",
      descEn: "Children, seniors, pregnant mothers, and asthmatic patients require close care.",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      accentColor: "border-purple-500/30",
    },
    {
      id: 7,
      icon: "🪟",
      titleMs: "Tutup Tingkap & Pasang Penapis",
      titleEn: "Close Windows & Filter Air",
      descMs: "Tutup semua pintu dan tingkap serta gunakan penapis udara berkecekapan tinggi (HEPA).",
      descEn: "Keep windows shut and operate high-efficiency particulate air (HEPA) purifiers.",
      bgGradient: "from-blue-500/10 to-sky-500/10",
      accentColor: "border-blue-500/30",
    },
    {
      id: 8,
      icon: "🚗",
      titleMs: "Kitaran Udara Dalam Kenderaan",
      titleEn: "Recirculate Vehicle Air",
      descMs: "Gunakan mod kitaran udara dalaman (recirculation) pendingin hawa semasa memandu kenderaan.",
      descEn: "Switch vehicle air conditioning to internal recirculation mode while driving.",
      bgGradient: "from-slate-500/10 to-zinc-500/10",
      accentColor: "border-slate-500/30",
    },
    {
      id: 9,
      icon: "🧼",
      titleMs: "Kerap Cuci Muka & Tangan",
      titleEn: "Wash Face & Hands Regularly",
      descMs: "Kerap membasuh muka, mata dan tangan dengan air bersih selepas pulang dari luar.",
      descEn: "Rinse face, eyes, and exposed skin with clean water immediately after returning home.",
      bgGradient: "from-teal-500/10 to-emerald-500/10",
      accentColor: "border-teal-500/30",
    },
    {
      id: 10,
      icon: "🏥",
      titleMs: "Dapatkan Rawatan Segera",
      titleEn: "Seek Immediate Medical Help",
      descMs: "Segera ke klinik atau hospital jika mengalami sesak nafas, sakit dada atau batuk berterusan.",
      descEn: "Consult a healthcare provider immediately if experiencing shortness of breath or chest pain.",
      bgGradient: "from-rose-500/10 to-red-500/10",
      accentColor: "border-rose-500/30",
    },
  ];

  return (
    <Card className="border-border shadow-xs">
      {/* Header with Navigation Controls */}
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <HeartPulse className="size-4" />
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
              className="size-8"
              title="Slide Left"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="size-8"
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
          {advisories.map((adv) => (
            <Card
              key={adv.id}
              className={`w-[240px] sm:w-[260px] shrink-0 flex flex-col items-center justify-between bg-gradient-to-b ${adv.bgGradient} ${adv.accentColor} p-4 text-center transition-all hover:scale-[1.02] shadow-xs`}
            >
              <CardContent className="p-0 flex flex-col items-center">
                {/* Illustration Circle */}
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-background/90 text-2xl shadow-sm ring-1 ring-border mb-3">
                  {adv.icon}
                </div>

                <CardTitle className="text-xs font-bold line-clamp-1">
                  {lang === "ms" ? adv.titleMs : adv.titleEn}
                </CardTitle>
                <CardDescription className="text-[11px] mt-1.5 leading-relaxed line-clamp-3">
                  {lang === "ms" ? adv.descMs : adv.descEn}
                </CardDescription>
              </CardContent>

              <CardFooter className="p-0 mt-3 w-full pt-2 border-t border-border/50 justify-center">
                <Badge variant="secondary" className="text-[10px] font-semibold text-primary">
                  Tip #{adv.id}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
