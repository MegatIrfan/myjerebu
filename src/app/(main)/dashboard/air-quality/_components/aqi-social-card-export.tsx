"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  AlertTriangle,
  Layers,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { malaysiaStates, type MalaysiaState } from "./malaysia-states";
import { malaysiaDistricts } from "./malaysia-districts";
import type { StateAqiResult } from "./waqi-service";
import { getAqiInfo } from "./aqi-utils";
import { toast } from "sonner";

interface AqiSocialCardExportProps {
  results: StateAqiResult[];
  states?: MalaysiaState[];
  defaultStateId?: string;
  defaultDistrictId?: string;
  initialLang?: "ms" | "en";
  trigger?: React.ReactNode;
}

export function AqiSocialCardExport({
  results,
  states = malaysiaStates,
  defaultStateId = "kuala-lumpur",
  defaultDistrictId,
  initialLang = "ms",
  trigger,
}: AqiSocialCardExportProps) {
  const [open, setOpen] = useState(false);
  const [selectedStateId, setSelectedStateId] = useState<string>(defaultStateId || "kuala-lumpur");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(defaultDistrictId || "all");
  const [lang, setLang] = useState<"ms" | "en">(initialLang);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state when defaultDistrictId or defaultStateId change
  useEffect(() => {
    if (defaultDistrictId && defaultDistrictId !== "all") {
      const found = malaysiaDistricts.find((d) => d.id === defaultDistrictId);
      if (found) {
        setSelectedStateId(found.stateId);
        setSelectedDistrictId(found.id);
        return;
      }
    }
    if (defaultStateId) {
      setSelectedStateId(defaultStateId);
    }
    if (defaultDistrictId) {
      setSelectedDistrictId(defaultDistrictId);
    }
  }, [defaultStateId, defaultDistrictId]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (defaultDistrictId && defaultDistrictId !== "all") {
        const found = malaysiaDistricts.find((d) => d.id === defaultDistrictId);
        if (found) {
          setSelectedStateId(found.stateId);
          setSelectedDistrictId(found.id);
        } else {
          if (defaultStateId) setSelectedStateId(defaultStateId);
          setSelectedDistrictId(defaultDistrictId);
        }
      } else {
        if (defaultStateId) setSelectedStateId(defaultStateId);
        setSelectedDistrictId(defaultDistrictId || "all");
      }
    }
    setOpen(newOpen);
  };

  const stateMap = useMemo(() => Object.fromEntries(states.map((s) => [s.id, s])), [states]);
  const resultMap = useMemo(() => Object.fromEntries(results.map((r) => [r.stateId, r])), [results]);

  const currentState = stateMap[selectedStateId] || states[0];
  const currentResult = resultMap[selectedStateId];

  const districtsForState = useMemo(() => {
    return malaysiaDistricts.filter((d) => d.stateId === selectedStateId);
  }, [selectedStateId]);

  const currentDistrict = useMemo(() => {
    if (selectedDistrictId === "all" || !selectedDistrictId) return null;
    return malaysiaDistricts.find((d) => d.id === selectedDistrictId) ?? null;
  }, [selectedDistrictId]);

  // Compute AQI & weather parameters
  const activeAqi = useMemo(() => {
    const base = currentResult?.data?.aqi ?? 68;
    if (currentDistrict) {
      return Math.max(12, Math.min(450, base + currentDistrict.baseAqiOffset));
    }
    return base;
  }, [currentResult, currentDistrict]);

  const aqiInfo = getAqiInfo(activeAqi);

  const locationName = useMemo(() => {
    if (currentDistrict) {
      return lang === "ms" ? currentDistrict.nameMs : currentDistrict.name;
    }
    return lang === "ms" ? currentState?.nameMs || currentState?.name : currentState?.name;
  }, [currentDistrict, currentState, lang]);

  const stateDisplayName = lang === "ms" ? currentState?.nameMs || currentState?.name : currentState?.name;

  // Weather data
  const temp = currentResult?.data?.iaqi?.t?.v ?? 33;
  const humidity = currentResult?.data?.iaqi?.h?.v ?? 65;
  const windSpeed = currentResult?.data?.iaqi?.w?.v ?? 14;
  const dominantPollutant = (currentDistrict?.dominantPollutant || currentResult?.data?.dominentpol || "pm25").toUpperCase();
  const pm25Val = Math.round(currentResult?.data?.iaqi?.pm25?.v ?? activeAqi * 0.55 + 8);

  // Status colors (5-tier map standard) & friendly texts
  const cardTheme = useMemo(() => {
    // 0 - 50: Good (Blue)
    if (activeAqi <= 50) {
      return {
        bgGradient: "from-blue-500 to-blue-600",
        solidBg: "#3b82f6",
        gradientStart: "#3b82f6",
        gradientEnd: "#2563eb",
        statusTextMs: "Baik",
        statusTextEn: "Good",
        adviceMs: "Kualiti udara memuaskan. Sesuai untuk aktiviti luar.",
        adviceEn: "Air quality is ideal for outdoor activities.",
      };
    }
    // 51 - 100: Moderate (Green)
    if (activeAqi <= 100) {
      return {
        bgGradient: "from-emerald-500 to-green-600",
        solidBg: "#22c55e",
        gradientStart: "#22c55e",
        gradientEnd: "#16a34a",
        statusTextMs: "Sederhana",
        statusTextEn: "Moderate",
        adviceMs: "Kualiti udara boleh diterima. Golongan sensitif kurangkan aktiviti lasak.",
        adviceEn: "Air quality is acceptable. Sensitive groups should take care.",
      };
    }
    // 101 - 200: Unhealthy (Yellow)
    if (activeAqi <= 200) {
      return {
        bgGradient: "from-yellow-500 to-amber-600",
        solidBg: "#eab308",
        gradientStart: "#eab308",
        gradientEnd: "#ca8a04",
        statusTextMs: "Tidak Sihat",
        statusTextEn: "Unhealthy",
        adviceMs: "Orang ramai disyorkan kurangkan aktiviti luar dan pakai pelitup muka.",
        adviceEn: "Reduce outdoor activities and wear a mask when outdoors.",
      };
    }
    // 201 - 300: Very Unhealthy (Orange)
    if (activeAqi <= 300) {
      return {
        bgGradient: "from-orange-500 to-amber-700",
        solidBg: "#f97316",
        gradientStart: "#f97316",
        gradientEnd: "#ea580c",
        statusTextMs: "Sangat Tidak Sihat",
        statusTextEn: "Very Unhealthy",
        adviceMs: "Kekal di dalam rumah. Tutup tingkap dan guna penapis udara.",
        adviceEn: "Stay indoors. Keep windows shut and run air purifiers.",
      };
    }
    // 301+: Hazardous (Red)
    return {
      bgGradient: "from-red-600 to-rose-700",
      solidBg: "#ef4444",
      gradientStart: "#ef4444",
      gradientEnd: "#dc2626",
      statusTextMs: "Berbahaya",
      statusTextEn: "Hazardous",
      adviceMs: "AMARAN BAHAYA: Semua individu perlu kekal di dalam bangunan.",
      adviceEn: "HAZARDOUS WARNING: Everyone should avoid all outdoor exposure.",
    };
  }, [activeAqi]);

  const timestampStr = useMemo(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const mins = now.getMinutes().toString().padStart(2, "0");
    const months = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = lang === "ms" ? months[now.getMonth()] : monthsEn[now.getMonth()];
    const day = now.getDate().toString().padStart(2, "0");
    return `${hours}:${mins}, ${day} ${month}`;
  }, [lang]);

  // Pure HTML5 Canvas 4:3 high-res JPG renderer (1200 x 900 px) using Geist font
  const generateCanvasImage = useCallback((): Promise<Blob | null> => {
    return new Promise(async (resolve) => {
      // Ensure Geist and all document fonts are fully loaded
      if (typeof document !== "undefined" && document.fonts) {
        try {
          await document.fonts.ready;
        } catch {
          // ignore
        }
      }

      const canvas = document.createElement("canvas");
      // 4:3 aspect ratio (1200 x 900)
      const width = 1200;
      const height = 900;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      // Smooth anti-aliasing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Geist Font Family constant
      const geistFont = "'Geist', 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

      // 1. Background (Clean soft off-white canvas with subtle ambient gradient)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#f8fafc");
      bgGrad.addColorStop(0.5, "#ffffff");
      bgGrad.addColorStop(1, "#f1f5f9");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle atmospheric aura based on AQI
      const auraGrad = ctx.createRadialGradient(width * 0.5, height * 0.45, 50, width * 0.5, height * 0.45, 600);
      auraGrad.addColorStop(0, `${cardTheme.gradientStart}15`);
      auraGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = auraGrad;
      ctx.fillRect(0, 0, width, height);

      // Helper for rounded rectangles
      const roundRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number | { tl?: number; tr?: number; br?: number; bl?: number }
      ) => {
        ctx.beginPath();
        let r = { tl: 0, tr: 0, br: 0, bl: 0 };
        if (typeof radius === "number") {
          r = { tl: radius, tr: radius, br: radius, bl: radius };
        } else {
          r = { ...r, ...radius };
        }
        ctx.moveTo(x + r.tl, y);
        ctx.lineTo(x + w - r.tr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        ctx.lineTo(x + w, y + h - r.br);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        ctx.lineTo(x + r.bl, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        ctx.lineTo(x, y + r.tl);
        ctx.quadraticCurveTo(x, y, x + r.tl, y);
        ctx.closePath();
      };

      // 2. Top Header
      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 44px ${geistFont}`;
      ctx.textAlign = "center";
      const titleText =
        lang === "ms" ? `Kualiti Udara di ${locationName}` : `Air quality in ${locationName}`;
      ctx.fillText(titleText, width / 2, 75);

      // Subtitle
      ctx.fillStyle = "#64748b";
      ctx.font = `500 20px ${geistFont}`;
      const subtitleText =
        lang === "ms"
          ? `Indeks Kualiti Udara (IPU) & Pencemaran PM2.5 di ${locationName}, ${stateDisplayName} · ${timestampStr}`
          : `Air quality index (AQI) & PM2.5 air pollution in ${locationName}, ${stateDisplayName} · ${timestampStr}`;
      ctx.fillText(subtitleText, width / 2, 115);

      // 3. Alert / Advisory Banner
      const bannerY = 145;
      const bannerH = 46;
      const bannerW = 860;
      const bannerX = (width - bannerW) / 2;

      roundRect(bannerX, bannerY, bannerW, bannerH, 23);
      if (activeAqi > 100) {
        ctx.fillStyle = "#fee2e2";
        ctx.fill();
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#b91c1c";
        ctx.font = `bold 18px ${geistFont}`;
        ctx.textAlign = "center";
        const alertMsg =
          lang === "ms"
            ? `⚠️ Nasihat Kesihatan Udara: ${cardTheme.adviceMs}`
            : `⚠️ Air Quality Advisory: ${cardTheme.adviceEn}`;
        ctx.fillText(alertMsg, width / 2, bannerY + 29);
      } else {
        ctx.fillStyle = "#ecfdf5";
        ctx.fill();
        ctx.strokeStyle = "#a7f3d0";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#047857";
        ctx.font = `bold 18px ${geistFont}`;
        ctx.textAlign = "center";
        const alertMsg =
          lang === "ms"
            ? `🍃 Status Udara Semasa: ${cardTheme.adviceMs}`
            : `🍃 Current Status: ${cardTheme.adviceEn}`;
        ctx.fillText(alertMsg, width / 2, bannerY + 29);
      }

      // 4. Main Hero Card (4:3 inner prominent block)
      const cardX = 140;
      const cardY = 215;
      const cardW = 920;
      const cardH = 550;
      const cardRadius = 36;

      // Card Shadow
      ctx.save();
      ctx.shadowColor = "rgba(15, 23, 42, 0.18)";
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 16;
      roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.fillStyle = cardTheme.gradientStart;
      ctx.fill();
      ctx.restore();

      // Card Gradient Fill
      const mainCardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      mainCardGrad.addColorStop(0, cardTheme.gradientStart);
      mainCardGrad.addColorStop(1, cardTheme.gradientEnd);
      roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.fillStyle = mainCardGrad;
      ctx.fill();

      // Ambient decorative pattern inside main card
      ctx.save();
      ctx.beginPath();
      roundRect(cardX, cardY, cardW, cardH, cardRadius);
      ctx.clip();
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.beginPath();
      ctx.arc(cardX + cardW - 50, cardY + 50, 220, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- Inside Main Card: Top-Left AQI Badge Container ---
      const aqiBoxX = cardX + 45;
      const aqiBoxY = cardY + 45;
      const aqiBoxW = 160;
      const aqiBoxH = 140;
      roundRect(aqiBoxX, aqiBoxY, aqiBoxW, aqiBoxH, 24);
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Big AQI Number
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 68px ${geistFont}`;
      ctx.textAlign = "center";
      ctx.fillText(activeAqi.toString(), aqiBoxX + aqiBoxW / 2, aqiBoxY + 75);

      // Sub-label (US AQI / MY IPU)
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = `bold 17px ${geistFont}`;
      ctx.fillText(lang === "ms" ? "MY IPU / AQI" : "US AQI+", aqiBoxX + aqiBoxW / 2, aqiBoxY + 115);

      // --- Inside Main Card: Center Status Label & Friendly Msg ---
      const statusX = aqiBoxX + aqiBoxW + 35;
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold 46px ${geistFont}`;
      const statusTitle = lang === "ms" ? cardTheme.statusTextMs : cardTheme.statusTextEn;
      ctx.fillText(statusTitle, statusX, aqiBoxY + 65);

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = `500 20px ${geistFont}`;
      const friendlyAdvice = lang === "ms" ? cardTheme.adviceMs : cardTheme.adviceEn;
      ctx.fillText(friendlyAdvice, statusX, aqiBoxY + 110);

      // --- Inside Main Card: Right Side Avatar / Mask Vector Illustration ---
      const avatarCenterX = cardX + cardW - 130;
      const avatarCenterY = cardY + 115;

      // Draw Avatar Circle & Face with Mask
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Vector Illustration of Head + Face Mask / Smile
      ctx.strokeStyle = "#ffffff";
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Head outline
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY - 10, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Eyes
      ctx.beginPath();
      ctx.arc(avatarCenterX - 10, avatarCenterY - 14, 3, 0, Math.PI * 2);
      ctx.arc(avatarCenterX + 10, avatarCenterY - 14, 3, 0, Math.PI * 2);
      ctx.fill();

      if (activeAqi <= 50) {
        // Happy smile
        ctx.beginPath();
        ctx.arc(avatarCenterX, avatarCenterY - 8, 14, 0.2 * Math.PI, 0.8 * Math.PI, false);
        ctx.stroke();
      } else {
        // Mask shape
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        roundRect(avatarCenterX - 18, avatarCenterY - 4, 36, 22, 6);
        ctx.fill();
        ctx.stroke();

        // Mask straps
        ctx.beginPath();
        ctx.moveTo(avatarCenterX - 18, avatarCenterY + 2);
        ctx.lineTo(avatarCenterX - 28, avatarCenterY - 2);
        ctx.moveTo(avatarCenterX + 18, avatarCenterY + 2);
        ctx.lineTo(avatarCenterX + 28, avatarCenterY - 2);
        ctx.stroke();
      }

      // Shoulders / Chest
      ctx.beginPath();
      ctx.arc(avatarCenterX, avatarCenterY + 54, 40, Math.PI * 1.15, Math.PI * 1.85, false);
      ctx.stroke();
      ctx.restore();

      // --- Inside Main Card: Sub Pollutant Row ---
      const polRowY = cardY + 245;
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.font = `bold 26px ${geistFont}`;
      ctx.textAlign = "left";
      ctx.fillText(
        lang === "ms" ? `Bahan Pencemar Utama: ${dominantPollutant}` : `Main pollutant: ${dominantPollutant}`,
        cardX + 45,
        polRowY
      );

      ctx.textAlign = "right";
      ctx.fillText(`${pm25Val} µg/m³`, cardX + cardW - 45, polRowY);

      // --- Inside Main Card: Weather / Ambient Bottom Card (White container) ---
      const weatherBoxX = cardX + 30;
      const weatherBoxY = cardY + 310;
      const weatherBoxW = cardW - 60;
      const weatherBoxH = 180;
      const weatherBoxR = 26;

      roundRect(weatherBoxX, weatherBoxY, weatherBoxW, weatherBoxH, weatherBoxR);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "rgba(226, 232, 240, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Weather Items (3 columns: Temp, Wind, Humidity)
      const colWidth = weatherBoxW / 3;

      // Col 1: Temperature
      const c1X = weatherBoxX + colWidth * 0.5;
      ctx.textAlign = "center";
      ctx.fillStyle = "#f59e0b";
      ctx.font = "38px sans-serif";
      ctx.fillText("☀️", c1X, weatherBoxY + 68);
      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 34px ${geistFont}`;
      ctx.fillText(`${temp}°C`, c1X, weatherBoxY + 118);
      ctx.fillStyle = "#64748b";
      ctx.font = `500 16px ${geistFont}`;
      ctx.fillText(lang === "ms" ? "Suhu Semasa" : "Temperature", c1X, weatherBoxY + 148);

      // Divider 1
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(weatherBoxX + colWidth, weatherBoxY + 30);
      ctx.lineTo(weatherBoxX + colWidth, weatherBoxY + weatherBoxH - 30);
      ctx.stroke();

      // Col 2: Wind Speed
      const c2X = weatherBoxX + colWidth * 1.5;
      ctx.fillStyle = "#0284c7";
      ctx.font = "38px sans-serif";
      ctx.fillText("💨", c2X, weatherBoxY + 68);
      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 34px ${geistFont}`;
      ctx.fillText(`${windSpeed} km/h`, c2X, weatherBoxY + 118);
      ctx.fillStyle = "#64748b";
      ctx.font = `500 16px ${geistFont}`;
      ctx.fillText(lang === "ms" ? "Kelajuan Angin" : "Wind Speed", c2X, weatherBoxY + 148);

      // Divider 2
      ctx.beginPath();
      ctx.moveTo(weatherBoxX + colWidth * 2, weatherBoxY + 30);
      ctx.lineTo(weatherBoxX + colWidth * 2, weatherBoxY + weatherBoxH - 30);
      ctx.stroke();

      // Col 3: Humidity
      const c3X = weatherBoxX + colWidth * 2.5;
      ctx.fillStyle = "#06b6d4";
      ctx.font = "38px sans-serif";
      ctx.fillText("💧", c3X, weatherBoxY + 68);
      ctx.fillStyle = "#0f172a";
      ctx.font = `bold 34px ${geistFont}`;
      ctx.fillText(`${humidity}%`, c3X, weatherBoxY + 118);
      ctx.fillStyle = "#64748b";
      ctx.font = `500 16px ${geistFont}`;
      ctx.fillText(lang === "ms" ? "Kelembapan Udara" : "Humidity", c3X, weatherBoxY + 148);

      // 5. Footer Watermark & Branding
      ctx.fillStyle = "#64748b";
      ctx.font = `bold 18px ${geistFont}`;
      ctx.textAlign = "center";
      const footerBrand = "🇲🇾 MyJerebu · https://myjerebu.vercel.app/ · Developed by Megat Irfan";
      ctx.fillText(footerBrand, width / 2, height - 40);

      // Convert to JPG blob (quality 0.95)
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  }, [
    activeAqi,
    cardTheme,
    currentDistrict,
    currentState,
    dominantPollutant,
    humidity,
    lang,
    locationName,
    pm25Val,
    stateDisplayName,
    temp,
    timestampStr,
    windSpeed,
  ]);

  // Handle Download JPG
  const handleDownloadJpg = async () => {
    setIsExporting(true);
    try {
      const blob = await generateCanvasImage();
      if (!blob) throw new Error("Gagal menjana imej JPG.");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeLoc = locationName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      link.download = `myjerebu-${safeLoc}-4x3.jpg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        lang === "ms"
          ? `Imej JPG 4:3 untuk ${locationName} berjaya dimuat turun!`
          : `4:3 JPG image for ${locationName} downloaded!`
      );
    } catch {
      toast.error(lang === "ms" ? "Ralat semasa memuat turun imej." : "Error downloading image.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Copy to Clipboard
  const handleCopyImage = async () => {
    try {
      const blob = await generateCanvasImage();
      if (!blob) throw new Error("Could not generate image");

      if (navigator.clipboard && window.ClipboardItem) {
        const pngBlob = await new Promise<Blob | null>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((b) => resolve(b), "image/png");
          };
          img.src = URL.createObjectURL(blob);
        });

        if (pngBlob) {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": pngBlob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
          toast.success(
            lang === "ms" ? "Imej disalin ke papan klip (Clipboard)!" : "Image copied to clipboard!"
          );
          return;
        }
      }
      handleDownloadJpg();
    } catch {
      handleDownloadJpg();
    }
  };

  // Handle Share (Web Share API)
  const handleShare = async () => {
    try {
      const blob = await generateCanvasImage();
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], `myjerebu-${locationName}.jpg`, { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Kualiti Udara di ${locationName} - MyJerebu`,
            text: `Indeks Kualiti Udara (AQI) di ${locationName}: ${activeAqi} (${cardTheme.statusTextMs}). Layari MyJerebu untuk bacaan penuh.`,
            files: [file],
          });
          return;
        }
      }
      handleDownloadJpg();
    } catch {
      handleDownloadJpg();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-bold shadow-xs hover:border-primary/50 transition-colors"
          >
            <ImageIcon className="size-4 text-primary" />
            <span>{lang === "ms" ? "Eksport JPG (4:3)" : "Export JPG (4:3)"}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-heading font-bold">
                {lang === "ms" ? "Eksport Kad Kualiti Udara (Format 4:3)" : "Export Air Quality Card (4:3 Aspect Ratio)"}
              </DialogTitle>
            </div>
            <Badge variant="secondary" className="font-mono text-[11px] font-bold">
              4:3 JPG (1200×900)
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {lang === "ms"
              ? "Cipta dan muat turun kad visual mesra pengguna dalam nisbah 4:3 untuk dikongsi ke media sosial, WhatsApp, atau laporan rasmi."
              : "Generate and download a user-friendly 4:3 graphic card to share across social media, WhatsApp, or reports."}
          </DialogDescription>
        </DialogHeader>

        {/* Customization Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/50 border border-border">
          {/* State Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="size-3" />
              {lang === "ms" ? "Pilih Negeri" : "Select State"}
            </label>
            <Select
              value={selectedStateId}
              onValueChange={(val) => {
                setSelectedStateId(val);
                setSelectedDistrictId("all");
              }}
            >
              <SelectTrigger className="h-8 text-xs font-semibold">
                <SelectValue placeholder="Pilih Negeri" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {states.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {lang === "ms" ? s.nameMs : s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Layers className="size-3" />
              {lang === "ms" ? "Pilih Stesen / Daerah" : "Select Station / District"}
            </label>
            <Select value={selectedDistrictId} onValueChange={setSelectedDistrictId}>
              <SelectTrigger className="h-8 text-xs font-semibold">
                <SelectValue placeholder="Semua / Stesen Utama" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all" className="text-xs font-bold">
                  {lang === "ms" ? `Semua (Purata ${currentState.nameMs})` : `All (Average ${currentState.name})`}
                </SelectItem>
                {districtsForState.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="text-xs">
                    {lang === "ms" ? d.nameMs : d.name} ({d.stationCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Toggle */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Globe className="size-3" />
              {lang === "ms" ? "Bahasa Paparan" : "Language"}
            </label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant={lang === "ms" ? "default" : "outline"}
                size="sm"
                className="h-8 flex-1 text-xs font-bold px-2"
                onClick={() => setLang("ms")}
              >
                🇲🇾 BM
              </Button>
              <Button
                type="button"
                variant={lang === "en" ? "default" : "outline"}
                size="sm"
                className="h-8 flex-1 text-xs font-bold px-2"
                onClick={() => setLang("en")}
              >
                🇬🇧 EN
              </Button>
            </div>
          </div>
        </div>

        {/* Live 4:3 Visual Card Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {lang === "ms" ? "Pratonton Kad 4:3 (Live Preview)" : "4:3 Card Live Preview"}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              {lang === "ms" ? "Format 4:3 Sedia Dikongsi" : "4:3 Ready-to-Share"}
            </span>
          </div>

          {/* The 4:3 Container Mockup */}
          <div className="w-full flex items-center justify-center bg-muted/40 p-2 sm:p-4 rounded-xl border border-border overflow-hidden">
            <div
              className="w-full max-w-[520px] aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-3 sm:p-5 shadow-md border border-border flex flex-col justify-between select-none relative overflow-hidden font-sans"
              style={{ fontFamily: "var(--font-geist), 'Geist', sans-serif" }}
            >
              {/* Subtle background ambient aura */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${cardTheme.solidBg}, transparent 70%)`,
                }}
              />

              {/* 1. Header */}
              <div className="relative z-10 text-center space-y-0.5">
                <h3 className="text-base sm:text-xl font-black tracking-tight text-foreground truncate px-2">
                  {lang === "ms" ? `Kualiti Udara di ${locationName}` : `Air quality in ${locationName}`}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate px-2">
                  {lang === "ms"
                    ? `Indeks Kualiti Udara (IPU) & PM2.5 di ${locationName} · ${timestampStr}`
                    : `Air quality index (AQI) & PM2.5 air pollution in ${locationName} · ${timestampStr}`}
                </p>
              </div>

              {/* 2. Alert Banner */}
              <div className="relative z-10 px-1">
                <div
                  className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-center text-[10px] sm:text-[11px] font-bold shadow-xs border ${
                    activeAqi > 100
                      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                  }`}
                >
                  <AlertTriangle className="size-3 shrink-0" />
                  <span className="truncate">
                    {lang === "ms"
                      ? `${locationName}: ${cardTheme.adviceMs}`
                      : `${locationName}: ${cardTheme.adviceEn}`}
                  </span>
                </div>
              </div>

              {/* 3. Main AQI Hero Card */}
              <div
                className={`relative z-10 rounded-xl p-2.5 sm:p-4 text-white shadow-md bg-gradient-to-br ${cardTheme.bgGradient} flex flex-col justify-between gap-2 sm:gap-2.5`}
              >
                {/* Upper Row: Left Box (AQI) + Center (Status) + Right (Avatar) */}
                <div className="flex items-center justify-between gap-2">
                  {/* Left AQI Box */}
                  <div className="flex flex-col items-center justify-center rounded-lg bg-black/25 border border-white/20 px-2 py-1 min-w-[52px] sm:min-w-[68px] backdrop-blur-xs shrink-0">
                    <span className="text-lg sm:text-2xl font-black tracking-tight leading-none">{activeAqi}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-white/80 uppercase tracking-wider mt-0.5">
                      {lang === "ms" ? "MY IPU" : "US AQI"}
                    </span>
                  </div>

                  {/* Center Status & Advice */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-lg font-black leading-tight drop-shadow-xs truncate">
                      {lang === "ms" ? cardTheme.statusTextMs : cardTheme.statusTextEn}
                    </h4>
                    <p className="text-[9px] sm:text-[11px] text-white/90 line-clamp-1 mt-0.5">
                      {lang === "ms" ? cardTheme.adviceMs : cardTheme.adviceEn}
                    </p>
                  </div>

                  {/* Right Avatar Illustration */}
                  <div className="shrink-0 size-9 sm:size-11 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                    {activeAqi <= 50 ? (
                      <span className="text-lg sm:text-xl" role="img" aria-label="happy">
                        😊
                      </span>
                    ) : (
                      <span className="text-base sm:text-lg">😷</span>
                    )}
                  </div>
                </div>

                {/* Sub row: Main Pollutant */}
                <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-bold text-white/90 border-t border-white/20 pt-1.5">
                  <span className="truncate">
                    {lang === "ms" ? `Pencemar: ${dominantPollutant}` : `Pollutant: ${dominantPollutant}`}
                  </span>
                  <span className="shrink-0">{pm25Val} µg/m³</span>
                </div>

                {/* Weather capsule inside card (White bottom pill) */}
                <div className="bg-white text-slate-900 rounded-lg p-1.5 sm:p-2 grid grid-cols-3 divide-x divide-slate-200 text-center shadow-xs">
                  <div className="flex items-center justify-center gap-1 px-1">
                    <span className="text-amber-500 text-[11px] sm:text-xs">☀️</span>
                    <span className="text-[10px] sm:text-xs font-black">{temp}°</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 px-1">
                    <span className="text-sky-500 text-[11px] sm:text-xs">💨</span>
                    <span className="text-[10px] sm:text-xs font-black">{windSpeed} km/h</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 px-1">
                    <span className="text-cyan-500 text-[11px] sm:text-xs">💧</span>
                    <span className="text-[10px] sm:text-xs font-black">{humidity}%</span>
                  </div>
                </div>
              </div>

              {/* 4. Footer Brand */}
              <div className="relative z-10 text-center">
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/80 truncate">
                  🇲🇾 MyJerebu · https://myjerebu.vercel.app/ · Developed by Megat Irfan
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 flex-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold h-9 sm:h-8 w-full"
              onClick={handleCopyImage}
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
              <span>{copied ? (lang === "ms" ? "Disalin!" : "Copied!") : lang === "ms" ? "Salin Imej" : "Copy Image"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold h-9 sm:h-8 w-full"
              onClick={handleShare}
            >
              <Share2 className="size-3.5" />
              <span>{lang === "ms" ? "Kongsi" : "Share"}</span>
            </Button>
          </div>

          <Button
            type="button"
            className="gap-2 font-bold text-xs h-9 sm:h-8 w-full sm:w-auto bg-primary text-primary-foreground shadow-sm"
            onClick={handleDownloadJpg}
            disabled={isExporting}
          >
            <Download className="size-3.5" />
            <span>
              {isExporting
                ? lang === "ms"
                  ? "Menjana JPG..."
                  : "Generating JPG..."
                : lang === "ms"
                ? "Muat Turun JPG (4:3)"
                : "Download JPG (4:3)"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
