"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import { toast } from "sonner";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("megat.irfan@doe.gov.my");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [role, setRole] = useState<"admin" | "officer">("admin");
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickFillAdmin = () => {
    setEmail("megat.irfan@doe.gov.my");
    setPassword("MyJerebu@2026");
    setRole("admin");
    toast.info("Megat Irfan (Administrator) account auto-filled.");
  };

  const handleQuickFillOfficer = () => {
    setEmail("officer.jas@doe.gov.my");
    setPassword("JASMalaysia@2026");
    setRole("officer");
    toast.info("DOE Research Officer account auto-filled.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter a valid email address and password.");
      return;
    }

    setIsLoading(true);
    toast.loading("Authenticating credentials...", { id: "login-toast" });

    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Welcome back, ${role === "admin" ? "Megat Irfan (Lead Administrator)" : "Air Quality Research Officer"}!`, {
        id: "login-toast",
      });
      router.push("/dashboard/air-quality");
    }, 1000);
  };

  const statesList = [
    { code: "kul", name: "KL" },
    { code: "sgr", name: "Selangor" },
    { code: "png", name: "Penang" },
    { code: "jhr", name: "Johor" },
    { code: "prk", name: "Perak" },
    { code: "kdh", name: "Kedah" },
    { code: "swk", name: "Sarawak" },
    { code: "sbh", name: "Sabah" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Branding & Live Atmospheric Panel (Desktop/Tablet) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-10 text-white lg:flex xl:w-7/12">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute top-1/2 -right-32 size-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 size-96 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
              <Wind className="size-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-heading font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                MyJerebu <span className="text-xs text-emerald-400 font-mono">v2.4</span>
              </span>
              <span className="text-xs text-neutral-400 block">Malaysia Air Quality &amp; Haze Monitoring Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-neutral-300 ring-1 ring-white/10 backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>16 Stations Online</span>
          </div>
        </div>

        {/* Center Atmospheric Feature Showcase */}
        <div className="relative z-10 my-auto max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/30">
            <Flame className="size-3.5" />
            <span>Official Regional Haze &amp; Fire Telemetry Portal</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white xl:text-5xl leading-tight">
              Transparent Real-Time Atmospheric Intelligence.
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Integrated national platform for Air Pollutant Index (API/AQI) telemetry, satellite peatland hotspot tracking, wind trajectory dispersion simulation, and public health advisories for all Malaysians.
            </p>
          </div>

          {/* Mini Live Telemetry Card */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <div className="space-y-1">
              <span className="text-[11px] text-neutral-400 uppercase font-semibold block">National AQI Mean</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-400">54</span>
                <span className="text-[10px] text-emerald-400 font-bold">Good</span>
              </div>
            </div>

            <div className="space-y-1 border-l border-white/10 pl-3">
              <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Satellite Hotspots</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-amber-400">12</span>
                <span className="text-[10px] text-amber-400 font-bold">Controlled</span>
              </div>
            </div>

            <div className="space-y-1 border-l border-white/10 pl-3">
              <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Telemetry Uptime</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">99.8%</span>
                <span className="text-[10px] text-neutral-400">Real-Time</span>
              </div>
            </div>
          </div>

          {/* 16 States Mini Flag Bar */}
          <div className="space-y-2">
            <span className="text-[11px] text-neutral-400 font-medium">Integrated State Station Feeds:</span>
            <div className="flex flex-wrap items-center gap-2">
              {statesList.map((st) => (
                <div
                  key={st.code}
                  className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-xs text-neutral-300 ring-1 ring-white/10"
                >
                  <MalaysiaFlag code={st.code} size="xs" />
                  <span className="text-[11px]">{st.name}</span>
                </div>
              ))}
              <span className="text-xs text-neutral-400 font-mono">+ 8 more</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Quote */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Validated by Department of Environment &amp; MetMalaysia</span>
          </div>
          <span>© 2026 MyJerebu</span>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="flex w-full flex-col justify-between p-6 sm:p-10 lg:w-1/2 xl:w-5/12">
        {/* Top Header Mobile Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wind className="size-5" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">MyJerebu</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/air-quality"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
            >
              <span>Continue to Public Dashboard</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Center Login Form Card */}
        <div className="mx-auto my-auto w-full max-w-md space-y-6">
          <div className="space-y-2">
            <Badge variant="outline" className="text-[11px] font-bold text-primary">
              Administration &amp; Research Portal
            </Badge>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Account Login
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the MyJerebu operational command center.
            </p>
          </div>

          {/* Quick Fill Demo Helper Pill */}
          <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-3 ring-1 ring-border text-xs">
            <div className="flex items-center justify-between text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5 text-foreground font-bold">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Instant Demo Access:</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickFillAdmin}
                className={`text-xs h-8 justify-start gap-1.5 ${
                  role === "admin" ? "border-primary bg-primary/5 font-bold" : ""
                }`}
              >
                <Shield className="size-3 text-primary" />
                <span className="truncate">Megat Irfan (Admin)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickFillOfficer}
                className={`text-xs h-8 justify-start gap-1.5 ${
                  role === "officer" ? "border-primary bg-primary/5 font-bold" : ""
                }`}
              >
                <Activity className="size-3 text-emerald-500" />
                <span className="truncate">DOE Officer</span>
              </Button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@doe.gov.my"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Please contact DOE IT Administrator to reset credentials.")}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-bold text-sm h-10 gap-2 shadow-md transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="size-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to MyJerebu</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {/* Info note */}
          <p className="text-center text-[11px] text-muted-foreground">
            Authorized access restricted to registered environmental officers and emergency personnel.
          </p>
        </div>

        {/* Bottom Language & Copyright Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-4 mt-6">
          <span>MyJerebu Portal Malaysia</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <Globe className="size-3.5" />
            <span>English (UK/MY)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
