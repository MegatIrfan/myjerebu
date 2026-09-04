"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Globe,
  LayoutDashboard,
  LogIn,
  Map,
  TableProperties,
  TrendingUp,
  HeartPulse,
  FileText,
  Menu,
  X,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/app/(main)/dashboard/_components/header/theme-switcher";

interface LandingNavbarProps {
  lang: "ms" | "en";
  onToggleLang: () => void;
}

export function LandingNavbar({ lang, onToggleLang }: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#map-section", label: lang === "ms" ? "Peta Interaktif" : "APIMS Map", icon: Map },
    { href: "#hourly-section", label: lang === "ms" ? "Jadual Sejam" : "Hourly Table", icon: TableProperties },
    { href: "#ranking-section", label: lang === "ms" ? "Carta & Kedudukan" : "Rankings & Trends", icon: TrendingUp },
    { href: "#advisory-section", label: lang === "ms" ? "Nasihat Kesihatan" : "Health Advisory", icon: HeartPulse },
    { href: "#references-section", label: lang === "ms" ? "Panduan & Rujukan" : "Publications", icon: FileText },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md shadow-xs border-b border-border"
          : "bg-background/95 border-b border-border/80"
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Government Crest / Brand Emblem */}
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-base tracking-tight text-foreground">
                  My<span className="text-primary">Jerebu</span>
                </span>
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono font-bold">
                  APIMS
                </Badge>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:inline-block">
                Portal Pemantauan Kualiti Udara
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <link.icon className="size-3.5 text-muted-foreground/80" />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleLang}
            className="h-8 gap-1 px-2.5 text-xs font-bold"
            title="Tukar Bahasa (BM/EN)"
          >
            <Globe className="size-3.5 text-primary" />
            <span>{lang.toUpperCase()}</span>
          </Button>

          {/* Theme Toggle */}
          <div className="flex items-center [&_button]:size-8 [&_button]:rounded-lg">
            <ThemeSwitcher />
          </div>

          {/* Launch Dashboard Button */}
          <Link href="/dashboard/air-quality" className="hidden sm:inline-flex">
            <Button size="sm" className="h-8 gap-1.5 px-3 text-xs font-bold shadow-xs">
              <LayoutDashboard className="size-3.5" />
              <span>{lang === "ms" ? "Buka Dashboard" : "Open Dashboard"}</span>
            </Button>
          </Link>

          {/* Sign In Button */}
          <Link href="/login">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-semibold">
              <LogIn className="size-3.5" />
              <span className="hidden sm:inline">{lang === "ms" ? "Log Masuk" : "Sign In"}</span>
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden size-8"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-card/95 backdrop-blur-md p-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg p-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <link.icon className="size-4 text-primary" />
              <span>{link.label}</span>
            </a>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Link href="/dashboard/air-quality" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full gap-2 font-bold text-xs h-9">
                <LayoutDashboard className="size-4" />
                <span>{lang === "ms" ? "Buka Dashboard Penuh" : "Open Studio Dashboard"}</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
