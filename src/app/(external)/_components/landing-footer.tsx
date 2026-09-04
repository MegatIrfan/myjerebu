"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck, ArrowRight, Code2, UserCheck, Heart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LandingFooterProps {
  lang: "ms" | "en";
}

export function LandingFooter({ lang }: LandingFooterProps) {
  return (
    <footer className="w-full bg-slate-950 text-slate-200 border-t border-slate-800 pt-10 pb-8 mt-12">
      <div className="container mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: Brand & Creator Info (5 cols) */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <span className="font-heading font-black text-lg tracking-tight text-white">
                  My<span className="text-sky-400">Jerebu</span>
                </span>
                <span className="block text-[10px] uppercase font-mono text-slate-400">
                  {lang === "ms" ? "Portal Pemantauan Kualiti Udara" : "Air Quality Monitoring Portal"}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
              <Code2 className="size-3.5 text-sky-400" />
              <span className="font-semibold">Developed By Megat Irfan</span>
              <span className="text-slate-400 text-[10px] font-mono border-l border-sky-500/30 pl-1.5">Personal Project</span>
            </div>

            <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
              <p>
                {lang === "ms"
                  ? "Projek peribadi dibangunkan khas untuk pemantauan kualiti udara, telemetri indeks pencemar udara (IPU), dan cerapan titik panas jerebu di Malaysia secara visual & masa nyata."
                  : "A personal project developed for real-time air quality monitoring, API telemetry visualization, and haze hotspot tracking across Malaysia."}
              </p>
              <p className="text-[11px] text-slate-400">
                {lang === "ms"
                  ? "Berasaskan data terbuka & telemetri sensor kualiti udara."
                  : "Powered by open ambient air quality telemetry & sensor data."}
              </p>
            </div>
          </div>

          {/* Col 2: Project Features (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              {lang === "ms" ? "Ciri & Modul Utama" : "Features & Modules"}
            </h4>

            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-sky-400" />
                <span>{lang === "ms" ? "Peta Geososial & Stesen Interaktif" : "Interactive Geospatial Station Map"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>{lang === "ms" ? "Telemetri 24 Jam IPU & PM2.5 Masa Nyata" : "24-Hour Continuous API Matrix"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-400" />
                <span>{lang === "ms" ? "Analisis AI & Ramalan 3 Hari" : "AI Forecast & Trend Predictions"}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-rose-400" />
                <span>{lang === "ms" ? "Nasihat Kesihatan & Panduan Perlindungan" : "Health Advisory Guidelines"}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links & Dashboard (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              {lang === "ms" ? "Pautan Pantas" : "Quick Links"}
            </h4>

            <ul className="text-xs space-y-1.5">
              <li>
                <a
                  href="http://asmc.asean.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>ASMC ASEAN Haze Hotspots</span>
                  <ExternalLink className="size-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.met.gov.my"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Cuaca Harian MetMalaysia</span>
                  <ExternalLink className="size-3 text-slate-500" />
                </a>
              </li>
              <li className="pt-2">
                <Link href="/dashboard/air-quality">
                  <Button variant="secondary" size="sm" className="h-7 text-xs font-bold gap-1 px-2.5">
                    <span>Studio Admin Dashboard</span>
                    <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-400">
          <p>
            &copy; 2026 <span className="font-semibold text-slate-200">MyJerebu</span> · Developed By <span className="font-semibold text-white">Megat Irfan</span> (Personal Project).
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <Link href="/dashboard/air-quality" className="hover:text-white transition-colors">
              {lang === "ms" ? "Dasar Privasi" : "Privacy Policy"}
            </Link>
            <span>·</span>
            <Link href="/dashboard/air-quality" className="hover:text-white transition-colors">
              {lang === "ms" ? "Penafian Maklumat" : "Disclaimer"}
            </Link>
            <span>·</span>
            <Link href="/dashboard/air-quality" className="hover:text-white transition-colors">
              {lang === "ms" ? "Tentang Projek" : "About"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
