"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Globe, ExternalLink, ShieldCheck } from "lucide-react";

interface LandingFooterProps {
  lang: "ms" | "en";
}

export function LandingFooter({ lang }: LandingFooterProps) {
  return (
    <footer className="w-full bg-slate-950 text-slate-200 border-t border-slate-800 pt-10 pb-8 mt-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: Brand & Contact Us (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🇲🇾</span>
              <div>
                <span className="font-heading font-black text-lg tracking-tight text-white">
                  My<span className="text-sky-400">Jerebu</span> APIMS
                </span>
                <span className="block text-[10px] uppercase font-mono text-slate-400">
                  Jabatan Alam Sekitar Malaysia
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-300">
                Kementerian Sumber Asli dan Kelestarian Alam (NRES)
              </p>
              <p>
                Aras 1 - 4, Podium 2 &amp; 3, Wisma Sumber Asli,
              </p>
              <p>
                No 25, Persiaran Perdana, Presint 4, Pusat Pentadbiran Kerajaan Persekutuan,
              </p>
              <p className="font-medium text-slate-300">
                62574 Putrajaya, Malaysia.
              </p>
            </div>
          </div>

          {/* Col 2: Complaints & Hotlines (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              {lang === "ms" ? "Talian Aduan & Bantuan" : "Complaints & General Line"}
            </h4>

            <ul className="text-xs text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold w-24">Talian Bebas Tol:</span>
                <b className="text-emerald-400 font-mono">1-800-88-2727</b>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold w-24">Talian Aduan:</span>
                <span className="font-mono text-slate-300">03-8889 1972</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold w-24">Telefon Am:</span>
                <span className="font-mono text-slate-300">03-8871 2000 / 2200</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold w-24">Faks:</span>
                <span className="font-mono text-slate-300">03-8889 1973 / 75</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links & Portals (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              {lang === "ms" ? "Pautan Pantas Rasmi" : "Quick Links"}
            </h4>

            <ul className="text-xs space-y-1.5">
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
                  href="https://www.doe.gov.my"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Portal Rasmi JAS (DOE)</span>
                  <ExternalLink className="size-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link href="/dashboard/air-quality" className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                  <span>Studio Admin Dashboard</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-slate-400">
          <p>
            Hak Cipta Terpelihara &copy; 2026 Kementerian Sumber Asli dan Kelestarian Alam (NRES) &amp; Jabatan Alam Sekitar Malaysia.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <Link href="/dashboard/air-quality" className="hover:text-white transition-colors">
              Dasar Privasi
            </Link>
            <span>·</span>
            <Link href="/dashboard/air-quality" className="hover:text-white transition-colors">
              Pemberitahuan Keselamatan
            </Link>
            <span>·</span>
            <Link href="/dashboard/air-quality" className="hover:text-white transition-colors">
              Penafian
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
