"use client";

import { useState, useEffect, useRef } from "react";
import {
  Flame,
  Radio,
  Eye,
  Maximize2,
  Minimize2,
  Compass,
  Thermometer,
  Wind,
  Layers,
  MapPin,
  Sparkles,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Video,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FireHotspotFeed {
  id: string;
  name: string;
  locationName: string;
  country: "Indonesia" | "Malaysia";
  region: "Sumatra" | "Kalimantan" | "Peninsular Malaysia" | "Sarawak";
  coordinates: [number, number]; // [lat, lng]
  sensorType: "FLIR Thermal Infrared" | "MODIS / VIIRS Satellite" | "DOE Drone Sentinel" | "NREB Watchtower Cam";
  frp: number; // Fire Radiative Power in Megawatts (MW)
  maxTemp: number; // in Celsius
  smokeDensity: "Light" | "Moderate" | "Dense" | "Severe Hazardous";
  windVector: string;
  dispersionHeading: string;
  threatLevel: "High" | "Severe" | "Critical";
  statusText: string;
  activeEmbers: number;
}

export const FIRE_HOTSPOT_FEEDS: FireHotspotFeed[] = [
  {
    id: "cam-riau-01",
    name: "Riau Pelalawan Peatland Fire",
    locationName: "Pelalawan, Riau (Central Sumatra)",
    country: "Indonesia",
    region: "Sumatra",
    coordinates: [0.5312, 101.4478],
    sensorType: "FLIR Thermal Infrared",
    frp: 385,
    maxTemp: 840,
    smokeDensity: "Severe Hazardous",
    windVector: "215° SW @ 18 km/h",
    dispersionHeading: "Towards Malacca Straits & Selangor / KL",
    threatLevel: "Critical",
    statusText: "Active Smoldering Peat Fire with Dense Plume",
    activeEmbers: 42,
  },
  {
    id: "cam-kalimantan-02",
    name: "Ketapang Peat Forest Blaze",
    locationName: "Ketapang, West Kalimantan",
    country: "Indonesia",
    region: "Kalimantan",
    coordinates: [-1.8492, 109.9765],
    sensorType: "MODIS / VIIRS Satellite",
    frp: 310,
    maxTemp: 760,
    smokeDensity: "Dense",
    windVector: "195° SSW @ 16 km/h",
    dispersionHeading: "Towards Kuching & Western Sarawak",
    threatLevel: "Severe",
    statusText: "Multi-cluster Forest Fire Trajectory",
    activeEmbers: 35,
  },
  {
    id: "cam-selangor-03",
    name: "Kuala Langat South Peat Reserve",
    locationName: "Banting / Kuala Langat, Selangor",
    country: "Malaysia",
    region: "Peninsular Malaysia",
    coordinates: [2.8136, 101.5519],
    sensorType: "DOE Drone Sentinel",
    frp: 85,
    maxTemp: 480,
    smokeDensity: "Moderate",
    windVector: "220° SW @ 10 km/h",
    dispersionHeading: "Towards Shah Alam & Klang Valley",
    threatLevel: "High",
    statusText: "Sub-surface Peatland Smoldering Containment",
    activeEmbers: 12,
  },
  {
    id: "cam-miri-04",
    name: "Kuala Baram Peat Swamp Watch",
    locationName: "Kuala Baram, Miri, Sarawak",
    country: "Malaysia",
    region: "Sarawak",
    coordinates: [4.5821, 114.0215],
    sensorType: "NREB Watchtower Cam",
    frp: 140,
    maxTemp: 560,
    smokeDensity: "Moderate",
    windVector: "180° S @ 12 km/h",
    dispersionHeading: "Towards Miri Coastal & Brunei Bay",
    threatLevel: "High",
    statusText: "Dry Season Bushfire Thermal Surveillance",
    activeEmbers: 18,
  },
  {
    id: "cam-sumatra-05",
    name: "Ogan Komering Ilir Peat Cluster",
    locationName: "OKI, South Sumatra",
    country: "Indonesia",
    region: "Sumatra",
    coordinates: [-3.4512, 104.9215],
    sensorType: "MODIS / VIIRS Satellite",
    frp: 420,
    maxTemp: 890,
    smokeDensity: "Severe Hazardous",
    windVector: "210° SSW @ 22 km/h",
    dispersionHeading: "Towards Johor & Singapore Air Corridor",
    threatLevel: "Critical",
    statusText: "Intense Transboundary Peatland Conflagration",
    activeEmbers: 58,
  },
  {
    id: "cam-pahang-06",
    name: "Rompin Peat Forest Sentinel",
    locationName: "Rompin / Pekan, Pahang",
    country: "Malaysia",
    region: "Peninsular Malaysia",
    coordinates: [3.1205, 103.3512],
    sensorType: "DOE Drone Sentinel",
    frp: 65,
    maxTemp: 410,
    smokeDensity: "Light",
    windVector: "170° S @ 8 km/h",
    dispersionHeading: "Localized Forest Dispersion",
    threatLevel: "High",
    statusText: "Early Hotspot Detection & Preventive Water Bombing",
    activeEmbers: 8,
  },
];

interface FireHotspotStreamsProps {
  onFocusMapCoordinates?: (lat: number, lng: number) => void;
}

export function FireHotspotStreams({ onFocusMapCoordinates }: FireHotspotStreamsProps) {
  const [selectedFeedId, setSelectedFeedId] = useState<string>("cam-riau-01");
  const [visionMode, setVisionMode] = useState<"thermal" | "optical" | "ai">("thermal");
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeFeed = FIRE_HOTSPOT_FEEDS.find((f) => f.id === selectedFeedId) || FIRE_HOTSPOT_FEEDS[0];

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace("T", " ").slice(0, 19) +
          " UTC · " +
          now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Kuala_Lumpur" }) +
          " MYT"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Canvas Dynamic Simulation for Thermal / Optical / AI feeds
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let tick = 0;

    // Generate random particle embers & smoke puffs
    const embers: Array<{ x: number; y: number; size: number; speedY: number; speedX: number; alpha: number }> = [];
    for (let i = 0; i < 45; i++) {
      embers.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1.5,
        speedY: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.2) * 1.2,
        alpha: Math.random() * 0.8 + 0.2,
      });
    }

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      if (visionMode === "thermal") {
        // --- FLIR THERMAL INFRARED PALETTE (Black -> Purple -> Deep Red -> Orange -> Bright Yellow -> White) ---
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#090514");
        bgGrad.addColorStop(0.5, "#1e0b2b");
        bgGrad.addColorStop(1, "#2e0f1a");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Ground landscape horizon
        ctx.fillStyle = "#18071e";
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        for (let x = 0; x <= width; x += 40) {
          const y = height * 0.7 + Math.sin((x + tick * 0.5) * 0.02) * 8;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Glowing Fire Core Hotspots (Thermal Heat Signature)
        const fireCenters = [
          { x: width * 0.45, y: height * 0.68, r: 90, maxT: activeFeed.maxTemp },
          { x: width * 0.62, y: height * 0.72, r: 65, maxT: activeFeed.maxTemp - 120 },
          { x: width * 0.32, y: height * 0.75, r: 45, maxT: activeFeed.maxTemp - 200 },
        ];

        fireCenters.forEach((fc, idx) => {
          const pulse = Math.sin(tick * 0.06 + idx) * 8;
          const rad = fc.r + pulse;

          const heatGrad = ctx.createRadialGradient(fc.x, fc.y, 2, fc.x, fc.y, rad);
          heatGrad.addColorStop(0, "#ffffff"); // Core White (Hottest)
          heatGrad.addColorStop(0.2, "#fef08a"); // Bright Yellow
          heatGrad.addColorStop(0.45, "#f97316"); // Fiery Orange
          heatGrad.addColorStop(0.75, "#dc2626"); // Crimson Red
          heatGrad.addColorStop(0.9, "#581c87"); // Thermal Purple
          heatGrad.addColorStop(1, "rgba(24, 7, 30, 0)");

          ctx.fillStyle = heatGrad;
          ctx.beginPath();
          ctx.arc(fc.x, fc.y, rad, 0, Math.PI * 2);
          ctx.fill();
        });

        // Rising Thermal Heat Wave Distortion Plumes
        ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          const cx = width * 0.48 + Math.sin(tick * 0.03 + i) * 35 + i * 20;
          const cy = height * 0.4 - i * 35;
          ctx.arc(cx, cy, 50 + i * 14, 0, Math.PI * 2);
          ctx.fill();
        }

        // Thermal Embers
        embers.forEach((em) => {
          em.y -= em.speedY;
          em.x += em.speedX;
          if (em.y < 0) em.y = height;
          if (em.x > width) em.x = 0;

          ctx.fillStyle = `rgba(254, 240, 138, ${em.alpha})`;
          ctx.beginPath();
          ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Thermal Scale Grid Overlay
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 60) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else if (visionMode === "optical") {
        // --- RGB OPTICAL HD REALISTIC SURVEILLANCE CAM ---
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, "#475569"); // Heavy Haze Gray Sky
        skyGrad.addColorStop(0.6, "#94a3b8");
        skyGrad.addColorStop(1, "#334155");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Forest Landscape
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.moveTo(0, height * 0.72);
        for (let x = 0; x <= width; x += 30) {
          const y = height * 0.72 + Math.sin((x + tick * 0.3) * 0.015) * 12;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Thick Billowing Haze & White-Grey Smoke Plumes
        for (let i = 0; i < 9; i++) {
          const smokeX = width * 0.42 + Math.sin(tick * 0.02 + i) * 45 + i * 28;
          const smokeY = height * 0.65 - i * 42;
          const smokeRad = 55 + i * 22;

          const smokeGrad = ctx.createRadialGradient(smokeX, smokeY, 4, smokeX, smokeY, smokeRad);
          smokeGrad.addColorStop(0, "rgba(241, 245, 249, 0.45)");
          smokeGrad.addColorStop(0.5, "rgba(203, 213, 225, 0.25)");
          smokeGrad.addColorStop(1, "rgba(148, 163, 184, 0)");

          ctx.fillStyle = smokeGrad;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, smokeRad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Visible Fire Glow at base
        const baseFireGrad = ctx.createRadialGradient(width * 0.45, height * 0.72, 5, width * 0.45, height * 0.72, 70);
        baseFireGrad.addColorStop(0, "rgba(251, 146, 60, 0.85)");
        baseFireGrad.addColorStop(0.6, "rgba(239, 68, 68, 0.4)");
        baseFireGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = baseFireGrad;
        ctx.beginPath();
        ctx.arc(width * 0.45, height * 0.72, 70, 0, Math.PI * 2);
        ctx.fill();

        // Embers / ash particles
        embers.forEach((em) => {
          em.y -= em.speedY * 0.8;
          em.x += em.speedX * 1.5;
          if (em.y < 0) em.y = height;
          if (em.x > width) em.x = 0;

          ctx.fillStyle = `rgba(255, 255, 255, ${em.alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(em.x, em.y, em.size * 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // --- AI FLAME & SMOKE PLUME DETECTION (FLIR + Bounding Boxes & HUD Vectors) ---
        // Render base thermal
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#0b0817");
        bgGrad.addColorStop(1, "#260e1d");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Fire hotspots
        const fx = width * 0.46;
        const fy = height * 0.68;
        const rad = 80 + Math.sin(tick * 0.08) * 10;

        const hGrad = ctx.createRadialGradient(fx, fy, 4, fx, fy, rad);
        hGrad.addColorStop(0, "#ffffff");
        hGrad.addColorStop(0.3, "#facc15");
        hGrad.addColorStop(0.6, "#ea580c");
        hGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, rad, 0, Math.PI * 2);
        ctx.fill();

        // AI Bounding Box 1 (Fire Core Detection)
        const boxX = fx - 75;
        const boxY = fy - 60;
        const boxW = 150;
        const boxH = 110;

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // AI Corner Highlights
        ctx.fillStyle = "#ef4444";
        const cLen = 12;
        ctx.fillRect(boxX - 2, boxY - 2, cLen, 3);
        ctx.fillRect(boxX - 2, boxY - 2, 3, cLen);
        ctx.fillRect(boxX + boxW - cLen + 2, boxY - 2, cLen, 3);
        ctx.fillRect(boxX + boxW - 1, boxY - 2, 3, cLen);

        // AI Label Badge
        ctx.fillStyle = "rgba(220, 38, 38, 0.9)";
        ctx.fillRect(boxX, boxY - 22, 140, 20);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`FIRE CORE: ${activeFeed.maxTemp}°C (99.4%)`, boxX + 6, boxY - 8);

        // AI Smoke Dispersion Vector Arrow
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(fx, fy - 30);
        ctx.lineTo(fx + 110, fy - 160);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
        ctx.fillRect(fx + 60, fy - 185, 150, 20);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 10px monospace";
        ctx.fillText(`PLUME VECTOR: ${activeFeed.windVector}`, fx + 65, fy - 171);
      }

      if (isPlaying) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [visionMode, isPlaying, activeFeed]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border shadow-md">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-8 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <Flame className="size-4 animate-bounce" />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Live Fire Spot Surveillance &amp; Thermal Streams</h2>
              <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400 border border-red-500/30">
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE 6 SITES
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time infrared thermal cameras &amp; satellite surveillance across peatland fire hotspots.
            </p>
          </div>
        </div>

        {/* Vision Mode Switcher & Stream Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Vision Modes */}
          <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border">
            <button
              type="button"
              onClick={() => setVisionMode("thermal")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                visionMode === "thermal"
                  ? "bg-red-600 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Thermometer className="size-3" />
              <span>FLIR Thermal</span>
            </button>
            <button
              type="button"
              onClick={() => setVisionMode("optical")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                visionMode === "optical"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Video className="size-3" />
              <span>RGB Optical HD</span>
            </button>
            <button
              type="button"
              onClick={() => setVisionMode("ai")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                visionMode === "ai"
                  ? "bg-amber-500 text-white shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="size-3" />
              <span>AI Detection</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 px-2.5 text-xs font-semibold"
          >
            {isPlaying ? <Pause className="size-3.5 mr-1" /> : <Play className="size-3.5 mr-1" />}
            <span>{isPlaying ? "Pause Feed" : "Resume"}</span>
          </Button>
        </div>
      </div>

      {/* Main Stream Viewport & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Large Stream Video Canvas (8 cols) */}
        <div className="relative lg:col-span-8 overflow-hidden rounded-xl border border-border/80 bg-black aspect-video flex items-center justify-center shadow-lg group">
          <canvas
            ref={canvasRef}
            width={854}
            height={480}
            className="w-full h-full object-cover"
          />

          {/* Top HUD Bar Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md bg-red-600/90 px-2 py-1 text-[11px] font-mono font-bold text-white shadow-md backdrop-blur-md">
                <span className="size-2 rounded-full bg-white animate-ping" />
                ● REC · {activeFeed.id.toUpperCase()}
              </span>
              <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-mono text-zinc-300 backdrop-blur-md border border-white/10 hidden sm:inline-block">
                {activeFeed.sensorType}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-mono text-emerald-400 backdrop-blur-md border border-white/10">
                FRP: {activeFeed.frp} MW
              </span>
              <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-mono text-zinc-300 backdrop-blur-md border border-white/10">
                {currentTime}
              </span>
            </div>
          </div>

          {/* Bottom HUD Bar Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2 pointer-events-none">
            <div className="rounded-lg bg-black/75 p-2.5 backdrop-blur-md border border-white/10 max-w-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{activeFeed.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/30 text-red-300 font-bold border border-red-500/40">
                  {activeFeed.threatLevel} Threat
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                📍 {activeFeed.locationName} · ({activeFeed.coordinates[0].toFixed(3)}°N, {activeFeed.coordinates[1].toFixed(3)}°E)
              </div>
              <div className="text-[11px] text-amber-300 mt-1 flex items-center gap-1 font-sans">
                <Wind className="size-3 text-cyan-400" />
                <span>Plume Drift: <b>{activeFeed.dispersionHeading}</b></span>
              </div>
            </div>

            {/* Quick Action Button to Zoom on Main Map */}
            {onFocusMapCoordinates && (
              <button
                type="button"
                onClick={() => onFocusMapCoordinates(activeFeed.coordinates[0], activeFeed.coordinates[1])}
                className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Compass className="size-3.5" />
                <span>Track on Map</span>
              </button>
            )}
          </div>
        </div>

        {/* Right 6 Feeds Selector Grid (4 cols) */}
        <div className="flex flex-col gap-2 lg:col-span-4 max-h-[380px] lg:max-h-[440px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1 mb-0.5">
            <span>SELECT MONITORING SITE</span>
            <span>6 FEEDS ONLINE</span>
          </div>

          {FIRE_HOTSPOT_FEEDS.map((feed) => {
            const isSelected = feed.id === selectedFeedId;
            return (
              <div
                key={feed.id}
                onClick={() => setSelectedFeedId(feed.id)}
                className={`flex flex-col gap-1 rounded-xl p-2.5 border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                    : "border-border/70 bg-muted/30 hover:bg-muted/70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                    <span className={`size-2 rounded-full ${feed.threatLevel === "Critical" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
                    {feed.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background text-muted-foreground border border-border">
                    {feed.frp} MW
                  </span>
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center justify-between mt-0.5">
                  <span className="truncate">{feed.locationName}</span>
                  <span className="text-red-500 font-bold font-mono text-[10px]">{feed.maxTemp}°C</span>
                </div>

                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                  <Wind className="size-2.5" />
                  <span>{feed.windVector}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
