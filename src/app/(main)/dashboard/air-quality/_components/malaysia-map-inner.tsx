"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StateAqiResult } from "./waqi-service";
import { getAqiMapFill, getAqiInfo } from "./aqi-utils";
import { malaysiaStates, type MalaysiaState } from "./malaysia-states";
import { malaysiaDistricts, getDistrictsByState, type MalaysiaDistrict } from "./malaysia-districts";
import {
  Layers,
  MapPin,
  Globe,
  Compass,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Flame,
  LocateFixed,
  Building2,
  ArrowLeft,
} from "lucide-react";
import type { SimulationDay } from "./haze-simulation-data";
import { HazeSmokeOverlay } from "./haze-smoke-overlay";
import { toast } from "sonner";

// State code → our state ID mapping for GeoJSON
const STATE_CODE_TO_ID: Record<string, string> = {
  KDH: "kedah",
  KTN: "kelantan",
  PRK: "perak",
  PNG: "penang",
  KUL: "kuala-lumpur",
  NSN: "negeri-sembilan",
  MLK: "melaka",
  PLS: "perlis",
  PHG: "pahang",
  TRG: "terengganu",
  PJY: "putrajaya",
  LBN: "labuan",
  SGR: "selangor",
  SBH: "sabah",
  JHR: "johor",
  SWK: "sarawak",
};

type TileStyle = "topo" | "satellite" | "streets" | "dark";

const TILE_LAYERS: Record<TileStyle, { name: string; url: string; attribution: string; maxZoom: number }> = {
  satellite: {
    name: "ESRI Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
    maxZoom: 18,
  },
  topo: {
    name: "Topography",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, METI, NRCAN",
    maxZoom: 18,
  },
  streets: {
    name: "Streets",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN",
    maxZoom: 18,
  },
  dark: {
    name: "Dark Canvas",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 16,
  },
};

interface MalaysiaMapInnerProps {
  results: StateAqiResult[];
  selectedStateId: string | null;
  onStateSelect: (stateId: string) => void;
  simulationDay?: SimulationDay | null;
  isSimulationActive?: boolean;
  onToggleSimulation?: (active: boolean) => void;
}

export default function MalaysiaMapInner({
  results,
  selectedStateId,
  onStateSelect,
  simulationDay = null,
  isSimulationActive = false,
  onToggleSimulation,
}: MalaysiaMapInnerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentTileLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotspotsLayerGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userLocationGroupRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layersRef = useRef<Record<string, any>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  const [activeTile, setActiveTile] = useState<TileStyle>("satellite");
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [granularity, setGranularity] = useState<"state" | "district">("state");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  // Automatically switch to district view when a specific state is selected
  useEffect(() => {
    if (selectedStateId) {
      setGranularity("district");
    }
  }, [selectedStateId]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 200);
      return next;
    });
  };

  // Helper to calculate distance in KM using Haversine formula
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Build AQI lookup map (supporting live data and simulation overrides)
  const aqiMap: Record<string, number | null> = {};
  const resultMap: Record<string, StateAqiResult> = {};
  for (const r of results) {
    if (isSimulationActive && simulationDay?.stateAqi && simulationDay.stateAqi[r.stateId] !== undefined) {
      aqiMap[r.stateId] = simulationDay.stateAqi[r.stateId];
    } else {
      aqiMap[r.stateId] = r.data?.aqi ?? null;
    }
    resultMap[r.stateId] = r;
  }

  // Set up custom CSS for Leaflet & pulsing markers
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("myjerebu-map-custom-css")) {
      const style = document.createElement("style");
      style.id = "myjerebu-map-custom-css";
      style.innerHTML = `
        @keyframes aqi-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .aqi-marker-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          color: white;
          font-weight: 800;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 11px;
          border: 2px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        .aqi-marker-badge:hover {
          transform: scale(1.18) translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.45);
          z-index: 1000 !important;
        }
        .aqi-marker-badge.selected {
          transform: scale(1.22);
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.5), 0 8px 20px rgba(0,0,0,0.5);
          animation: aqi-pulse 2s infinite;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          backdrop-filter: blur(8px);
        }
        .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        @keyframes haze-organic-drift {
          0% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.08) translate(15px, -10px); }
          100% { transform: scale(1) translate(-10px, 12px); }
        }
        @keyframes haze-swirl-west {
          0% { transform: rotate(0deg) scale(0.95); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(0.95); }
        }
        @keyframes haze-swirl-east {
          0% { transform: rotate(360deg) scale(1.05); }
          50% { transform: rotate(180deg) scale(0.9); }
          100% { transform: rotate(0deg) scale(1.05); }
        }
        @keyframes wind-dash {
          to { stroke-dashoffset: -28; }
        }
        @keyframes hotspot-pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .hotspot-radar-pulse {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
        }
        .hotspot-core {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background-color: #ef4444;
          box-shadow: 0 0 10px #ef4444;
          z-index: 2;
        }
        .hotspot-core.extreme {
          background-color: #dc2626;
          box-shadow: 0 0 14px #dc2626;
        }
        .hotspot-ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 2px solid #ef4444;
          animation: hotspot-pulse 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        .hotspot-ring.extreme {
          border-color: #dc2626;
          animation: hotspot-pulse 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
        @keyframes user-gps-radar {
          0% { transform: scale(0.6); opacity: 0.95; }
          70% { transform: scale(2.2); opacity: 0.2; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .user-gps-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
        }
        .user-gps-core {
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background-color: #2563eb;
          border: 2.5px solid #ffffff;
          box-shadow: 0 0 12px rgba(37,99,235,0.85);
          z-index: 2;
        }
        .user-gps-wave {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background-color: rgba(37, 99, 235, 0.45);
          animation: user-gps-radar 2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Function to render custom pulsing station markers (State Hubs or District Stations)
  const renderMarkers = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L: any, map: any, group: any) => {
      if (!L || !group) return;
      group.clearLayers();

      if (granularity === "district") {
        // Render District CAQM Stations (either filtered by selected state or all 68)
        const targetDistricts = selectedStateId
          ? getDistrictsByState(selectedStateId)
          : malaysiaDistricts;

        targetDistricts.forEach((district: MalaysiaDistrict) => {
          const parentStateAqi = aqiMap[district.stateId] ?? 60;
          const aqi = Math.max(10, Math.min(450, parentStateAqi + district.baseAqiOffset));
          const info = getAqiInfo(aqi);
          const fill = getAqiMapFill(aqi);
          const isSelected = selectedDistrictId === district.id;

          if (filterLevel && info.status !== filterLevel) {
            return;
          }

          const size = isSelected ? 36 : 30;
          const iconHtml = `
            <div class="aqi-marker-badge district-pin ${isSelected ? "selected" : ""}" style="width:${size}px;height:${size}px;background-color:${fill};border:2px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.35);font-size:10px;">
              ${aqi}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const marker = L.marker(district.coordinates, { icon: customIcon });

          const pm25Est = Math.round(aqi * 0.72);
          const pm10Est = Math.round(aqi * 1.15);

          const popupContent = `
            <div style="font-family:system-ui,-apple-system,sans-serif;width:245px;padding:12px;background:white">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:#2563eb;letter-spacing:0.05em">📍 ${district.stateName} District</span>
                <span style="font-size:9px;padding:2px 6px;border-radius:4px;background:#f1f5f9;color:#475569;font-weight:600">${district.stationCode}</span>
              </div>
              <div style="font-size:15px;font-weight:800;color:#0f172a;line-height:1.2;margin-bottom:2px">${district.name}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:8px">Station Type: <b>${district.stationType} Monitoring</b></div>
              
              <div style="display:flex;align-items:baseline;gap:8px;margin:8px 0;padding:8px;border-radius:8px;background:${fill}18">
                <span style="font-size:26px;font-weight:900;color:${fill};line-height:1">${aqi}</span>
                <div>
                  <div style="font-size:10px;font-weight:700;color:#64748b">DISTRICT AQI</div>
                  <div style="font-size:12px;font-weight:700;color:${fill}">${info.label}</div>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;color:#475569;margin-top:8px;padding-top:8px;border-top:1px solid #f1f5f9">
                <div>PM2.5: <b>~${pm25Est} µg/m³</b></div>
                <div>PM10: <b>~${pm10Est} µg/m³</b></div>
                <div>Dominant: <b style="text-transform:uppercase">${district.dominantPollutant ?? "pm25"}</b></div>
                <div>Status: <b style="color:${info.color}">${info.label}</b></div>
              </div>

              <button id="select-district-btn-${district.id}" style="width:100%;margin-top:10px;padding:6px 0;background:#0f172a;color:white;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer">
                Focus on ${district.name}
              </button>
            </div>
          `;

          // Rich Tooltip on Hover for District Pins
          marker.bindTooltip(
            `<div style="font-family:system-ui,-apple-system,sans-serif;padding:6px 10px;background:#0f172a;color:white;border-radius:8px;box-shadow:0 8px 20px rgba(0,0,0,0.3);min-width:150px">
              <div style="font-size:10px;font-weight:700;color:#93c5fd;text-transform:uppercase">📍 ${district.stateName} Daerah</div>
              <div style="font-size:13px;font-weight:800;color:#ffffff;margin-top:1px">${district.name}</div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${fill}"></span>
                <span style="font-size:13px;font-weight:900;color:${fill}">AQI ${aqi}</span>
                <span style="font-size:11px;color:#cbd5e1">(${info.label})</span>
              </div>
              <div style="font-size:10px;color:#94a3b8;margin-top:2px">${district.stationType} · ${district.stationCode}</div>
            </div>`,
            { sticky: true, opacity: 0.98, offset: [0, -10] }
          );

          marker.bindPopup(popupContent, { maxWidth: 260 });

          marker.on("popupopen", () => {
            const btn = document.getElementById(`select-district-btn-${district.id}`);
            if (btn) {
              btn.onclick = () => {
                setSelectedDistrictId(district.id);
                map.flyTo(district.coordinates, 12, { duration: 1 });
              };
            }
          });

          marker.on("click", () => {
            setSelectedDistrictId(district.id);
          });

          group.addLayer(marker);
        });
      } else {
        // Render 16 State Monitoring Hubs
        malaysiaStates.forEach((state: MalaysiaState) => {
          const aqi = aqiMap[state.id] ?? null;
          const res = resultMap[state.id];
          const info = getAqiInfo(aqi);
          const fill = getAqiMapFill(aqi);
          const isSelected = selectedStateId === state.id;

          let lat = state.coordinates[0];
          let lng = state.coordinates[1];
          if (res?.data?.city?.geo && res.data.city.geo.length === 2) {
            lat = res.data.city.geo[0];
            lng = res.data.city.geo[1];
          }

          if (filterLevel && info.status !== filterLevel) {
            return;
          }

          const size = isSelected ? 38 : 32;
          const iconHtml = `
            <div class="aqi-marker-badge ${isSelected ? "selected" : ""}" style="width:${size}px;height:${size}px;background-color:${fill};">
              ${aqi ?? "–"}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: "",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });

          const marker = L.marker([lat, lng], { icon: customIcon });

          const temp = res?.data?.iaqi?.t?.v;
          const humidity = res?.data?.iaqi?.h?.v;
          const pm25 = res?.data?.iaqi?.pm25?.v;
          const stationTitle = res?.data?.city?.name || state.nameMs;
          const districtsInThisState = getDistrictsByState(state.id);
          const districtCount = districtsInThisState.length;

          const districtBadges = districtsInThisState
            .map((d) => {
              const dParentAqi = aqi ?? 60;
              const dAqi = Math.max(10, Math.min(450, dParentAqi + d.baseAqiOffset));
              const dFill = getAqiMapFill(dAqi);
              return `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(255,255,255,0.12);padding:2px 5px;border-radius:4px;margin:2px 2px 2px 0;font-size:10px;color:#ffffff">
                <span style="width:6px;height:6px;border-radius:50%;background:${dFill}"></span>
                <b>${d.name}</b> (${dAqi})
              </span>`;
            })
            .join("");

          // Hover Tooltip on State Pins showing district breakdown
          marker.bindTooltip(
            `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:210px;max-width:280px;padding:8px 10px;background:#0f172a;color:white;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.35)">
              <div style="display:flex;align-items:center;gap:6px">
                <span class="malaysia-state-flag-icon malaysia-state-flag-icon-${state.flagCode}" style="width:18px;height:12px;border-radius:2px"></span>
                <span style="font-weight:800;font-size:14px;color:#ffffff">${state.name}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;margin:4px 0">
                <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background-color:${fill}"></span>
                <span style="font-weight:900;font-size:14px;color:${fill}">${aqi !== null ? `AQI ${aqi}` : "No Data"}</span>
                <span style="font-size:11px;font-weight:600;color:#94a3b8">· ${info.label}</span>
              </div>
              <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:6px;margin-top:4px">
                <div style="font-size:10px;font-weight:700;color:#93c5fd;text-transform:uppercase;margin-bottom:4px;display:flex;justify-content:space-between">
                  <span>📍 ${districtCount} Stesen Daerah:</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:2px">
                  ${districtBadges}
                </div>
              </div>
            </div>`,
            { sticky: true, opacity: 0.98, offset: [0, -12] }
          );

          const popupContent = `
            <div style="font-family:system-ui,-apple-system,sans-serif;width:240px;padding:12px;background:white">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:0.05em">${state.region === "peninsular" ? "Peninsular" : "East Malaysia"}</span>
                <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#eff6ff;color:#1d4ed8;font-weight:700">${districtCount} Districts</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span class="malaysia-state-flag-icon malaysia-state-flag-icon-${state.flagCode}" style="width:20px;height:14px;border-radius:3px"></span>
                <div style="font-size:15px;font-weight:700;color:#111;line-height:1.2">${stationTitle}</div>
              </div>
              <div style="display:flex;align-items:baseline;gap:8px;margin:8px 0;padding:8px;border-radius:8px;background:${fill}18">
                <span style="font-size:26px;font-weight:900;color:${fill};line-height:1">${aqi ?? "N/A"}</span>
                <div>
                  <div style="font-size:10px;font-weight:700;color:#666">AQI INDEX</div>
                  <div style="font-size:12px;font-weight:700;color:${fill}">${info.label}</div>
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;color:#555;margin-top:8px;padding-top:8px;border-top:1px solid #eee">
                ${pm25 !== undefined ? `<div>PM2.5: <b>${pm25} µg/m³</b></div>` : ""}
                ${temp !== undefined ? `<div>Temp: <b>${temp}°C</b></div>` : ""}
                ${humidity !== undefined ? `<div>Humidity: <b>${humidity}%</b></div>` : ""}
              </div>
              <button id="select-btn-${state.id}" style="width:100%;margin-top:10px;padding:7px 0;background:#2563eb;color:white;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">
                Drill Down into ${state.name} Districts (${districtCount}) →
              </button>
            </div>
          `;

          marker.bindPopup(popupContent, { maxWidth: 260 });

          marker.on("popupopen", () => {
            const btn = document.getElementById(`select-btn-${state.id}`);
            if (btn) {
              btn.onclick = () => {
                onStateSelect(state.id);
                setGranularity("district");
                map.flyTo(state.coordinates, 9.5, { duration: 1.2 });
                marker.closePopup();
              };
            }
          });

          marker.on("click", () => {
            onStateSelect(state.id);
            setGranularity("district");
            map.flyTo(state.coordinates, 9.5, { duration: 1.2 });
          });

          group.addLayer(marker);
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aqiMap, selectedStateId, filterLevel, granularity, selectedDistrictId]
  );

  // Function to render active fire hotspots during simulation
  const renderHotspots = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L: any, map: any, group: any) => {
      if (!L || !group) return;
      group.clearLayers();
      if (!isSimulationActive || !simulationDay?.hotspots) return;

      simulationDay.hotspots.forEach((hs) => {
        const iconHtml = `
          <div class="hotspot-radar-pulse" title="Titik Panas: ${hs.name}">
            <div class="hotspot-core ${hs.intensity}"></div>
            <div class="hotspot-ring ${hs.intensity}"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([hs.lat, hs.lng], { icon: customIcon });
        marker.bindTooltip(
          `<div style="font-family:system-ui,-apple-system,sans-serif;padding:3px 6px;background:rgba(220,38,38,0.95);color:white;font-weight:bold;font-size:11px;border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,0.3)">
            🔥 Titik Panas Kebakaran: ${hs.name}
          </div>`,
          { sticky: true }
        );
        marker.addTo(group);
      });
    },
    [isSimulationActive, simulationDay]
  );

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    Promise.all([
      import("leaflet"),
      import("./malaysia-states.json"),
    ]).then(([L, geojsonModule]) => {
      if (leafletMapRef.current || !mapRef.current) return;

      // Clean up previous instance marker
      if ((mapRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) {
        delete (mapRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id;
      }

      LRef.current = L;

      // Create map centered on Malaysia (lat: 4.2105, lng: 108.9758)
      const map = L.map(mapRef.current!, {
        center: [4.1, 109.2],
        zoom: 6,
        minZoom: 5,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      leafletMapRef.current = map;

      // Base Tile Layer
      const tileConfig = TILE_LAYERS[activeTile];
      const tileLayer = L.tileLayer(tileConfig.url, {
        attribution: tileConfig.attribution,
        maxZoom: tileConfig.maxZoom,
      }).addTo(map);
      currentTileLayerRef.current = tileLayer;

      // GeoJSON Boundaries Layer
      const geojson = geojsonModule.default;
      const geoLayer = L.geoJSON(geojson as GeoJSON.FeatureCollection, {
        style(feature) {
          const stateCode = feature?.properties?.state;
          const stateId = STATE_CODE_TO_ID[stateCode];
          const aqi = aqiMap[stateId] ?? null;
          const fill = getAqiMapFill(aqi);
          const isSelected = stateId === selectedStateId;

          return {
            fillColor: fill,
            fillOpacity: isSelected ? 0.55 : 0.32,
            color: isSelected ? "#ffffff" : "#ffffff",
            weight: isSelected ? 2.5 : 1.2,
            opacity: isSelected ? 1 : 0.7,
            dashArray: isSelected ? "4 3" : undefined,
          };
        },
        onEachFeature(feature, layer) {
          const stateCode = feature.properties.state;
          const stateId = STATE_CODE_TO_ID[stateCode];
          const stateName = feature.properties.name;
          const aqi = aqiMap[stateId] ?? null;
          const info = getAqiInfo(aqi);

          layersRef.current[stateId] = layer;

          const stateObj = malaysiaStates.find((s) => s.id === stateId);
          const flagCode = stateObj?.flagCode || "ft";
          const districtsInState = getDistrictsByState(stateId);
          const districtCount = districtsInState.length;

          const districtBadges = districtsInState
            .map((d) => {
              const dParentAqi = aqi ?? 60;
              const dAqi = Math.max(10, Math.min(450, dParentAqi + d.baseAqiOffset));
              const dFill = getAqiMapFill(dAqi);
              return `<span style="display:inline-flex;align-items:center;gap:3px;background:rgba(255,255,255,0.12);padding:2px 5px;border-radius:4px;margin:2px 2px 2px 0;font-size:10px;color:#ffffff">
                <span style="width:6px;height:6px;border-radius:50%;background:${dFill}"></span>
                <b>${d.name}</b> (${dAqi})
              </span>`;
            })
            .join("");

          layer.bindTooltip(
            `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:210px;max-width:280px;padding:8px 10px;background:rgba(15,23,42,0.96);color:white;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.35);backdrop-filter:blur(6px)">
              <div style="display:flex;align-items:center;gap:6px">
                <span class="malaysia-state-flag-icon malaysia-state-flag-icon-${flagCode}" style="width:18px;height:12px;display:inline-block;border-radius:2px"></span>
                <span style="font-weight:800;font-size:14px;color:#ffffff">${stateName}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;margin:4px 0">
                <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background-color:${getAqiMapFill(aqi)}"></span>
                <span style="font-weight:900;font-size:14px;color:${getAqiMapFill(aqi)}">${aqi !== null ? `AQI ${aqi}` : "Tiada Data"}</span>
                <span style="font-size:11px;font-weight:600;color:#94a3b8">· ${info.label}</span>
              </div>
              <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:6px;margin-top:4px">
                <div style="font-size:10px;font-weight:700;color:#93c5fd;text-transform:uppercase;margin-bottom:4px;display:flex;justify-content:space-between">
                  <span>📍 ${districtCount} Stesen Daerah:</span>
                  <span style="color:#cbd5e1;font-weight:400;font-size:9px">Klik untuk Drill-Down</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:2px">
                  ${districtBadges}
                </div>
              </div>
            </div>`,
            { sticky: true, opacity: 0.98 }
          );

          layer.on({
            click() {
              if (stateId) {
                onStateSelect(stateId);
                setGranularity("district");
                const st = malaysiaStates.find((s) => s.id === stateId);
                if (st && leafletMapRef.current) {
                  leafletMapRef.current.flyTo(st.coordinates, 9.5, { duration: 1.2 });
                }
              }
            },
            mouseover(e) {
              const target = e.target;
              target.setStyle({
                fillOpacity: 0.65,
                weight: 2.2,
                color: "#ffffff",
              });
            },
            mouseout(e) {
              const target = e.target;
              geoLayer.resetStyle(target);
              if (stateId === selectedStateId) {
                target.setStyle({ fillOpacity: 0.55, weight: 2.5, dashArray: "4 3" });
              }
            },
          });
        },
      }).addTo(map);

      geoLayerRef.current = geoLayer;

      // Create Group for Station Markers
      const markersGroup = L.layerGroup().addTo(map);
      markersLayerGroupRef.current = markersGroup;

      // Create Group for Hotspots
      const hotspotsGroup = L.layerGroup().addTo(map);
      hotspotsLayerGroupRef.current = hotspotsGroup;

      renderMarkers(L, map, markersGroup);
      renderHotspots(L, map, hotspotsGroup);

      // Fit bounds nicely to Malaysia
      map.fitBounds(geoLayer.getBounds(), { padding: [16, 16] });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reactive effect when simulationDay or isSimulationActive updates
  useEffect(() => {
    if (!LRef.current || !leafletMapRef.current) return;
    const L = LRef.current;
    const map = leafletMapRef.current;

    // 1. Re-render markers with new simulated / live AQI
    if (markersLayerGroupRef.current) {
      renderMarkers(L, map, markersLayerGroupRef.current);
    }

    // 2. Re-render hotspots
    if (hotspotsLayerGroupRef.current) {
      renderHotspots(L, map, hotspotsLayerGroupRef.current);
    }

    // 3. Update GeoJSON polygon fills
    if (geoLayerRef.current) {
      geoLayerRef.current.eachLayer((layer: any) => {
        const stateCode = layer.feature?.properties?.state;
        const stateId = STATE_CODE_TO_ID[stateCode];
        const aqi = aqiMap[stateId] ?? null;
        const fill = getAqiMapFill(aqi);
        const isSelected = stateId === selectedStateId;

        layer.setStyle({
          fillColor: fill,
          fillOpacity: isSelected ? 0.55 : 0.32,
          color: "#ffffff",
          weight: isSelected ? 2.5 : 1.2,
        });
      });
    }
  }, [isSimulationActive, simulationDay, selectedStateId, renderMarkers, renderHotspots]);

  // Update Markers when results, selectedStateId, or filter change
  useEffect(() => {
    if (LRef.current && leafletMapRef.current && markersLayerGroupRef.current) {
      renderMarkers(LRef.current, leafletMapRef.current, markersLayerGroupRef.current);
    }
  }, [results, selectedStateId, filterLevel, renderMarkers]);

  // Update Polygon styles when selection or AQI updates
  useEffect(() => {
    if (!geoLayerRef.current) return;

    for (const [stateId, layer] of Object.entries(layersRef.current)) {
      const aqi = aqiMap[stateId] ?? null;
      const fill = getAqiMapFill(aqi);
      const isSelected = stateId === selectedStateId;

      layer.setStyle({
        fillColor: fill,
        fillOpacity: isSelected ? 0.6 : 0.32,
        color: isSelected ? "#ffffff" : "#ffffff",
        weight: isSelected ? 2.5 : 1.2,
        opacity: isSelected ? 1 : 0.7,
        dashArray: isSelected ? "4 3" : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, selectedStateId]);

  // Handle Tile Style change
  const handleTileChange = (style: TileStyle) => {
    setActiveTile(style);
    if (!leafletMapRef.current || !LRef.current) return;

    const map = leafletMapRef.current;
    const L = LRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const config = TILE_LAYERS[style];
    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(map);

    // Ensure GeoJSON stays properly ordered
    if (geoLayerRef.current) geoLayerRef.current.bringToFront();
    // Re-render markers so they are on top
    if (markersLayerGroupRef.current) {
      renderMarkers(L, map, markersLayerGroupRef.current);
    }
  };

  // Toggle Boundaries Visibility
  const toggleBoundaries = () => {
    if (!leafletMapRef.current || !geoLayerRef.current) return;
    const map = leafletMapRef.current;
    const layer = geoLayerRef.current;

    if (showBoundaries) {
      map.removeLayer(layer);
      setShowBoundaries(false);
    } else {
      map.addLayer(layer);
      layer.bringToBack();
      if (currentTileLayerRef.current) currentTileLayerRef.current.bringToBack();
      setShowBoundaries(true);
    }
  };

  // Toggle Markers Visibility
  const toggleMarkers = () => {
    if (!leafletMapRef.current || !markersLayerGroupRef.current || !LRef.current) return;
    const map = leafletMapRef.current;
    const group = markersLayerGroupRef.current;

    if (showMarkers) {
      map.removeLayer(group);
      setShowMarkers(false);
    } else {
      map.addLayer(group);
      renderMarkers(LRef.current, map, group);
      setShowMarkers(true);
    }
  };

  const jumpToRegion = (region: "all" | "peninsular" | "sabah" | "sarawak") => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    if (region === "all") {
      onStateSelect(null as any);
      setGranularity("state");
      if (geoLayerRef.current) {
        map.fitBounds(geoLayerRef.current.getBounds(), { padding: [16, 16], duration: 1 });
      } else {
        map.flyTo([4.1, 109.2], 6);
      }
    } else if (region === "peninsular") {
      onStateSelect(null as any);
      setGranularity("state");
      map.flyTo([4.2, 102.0], 7, { duration: 1.2 });
    } else if (region === "sabah") {
      onStateSelect(null as any);
      setGranularity("state");
      map.flyTo([5.4, 117.0], 7.5, { duration: 1.2 });
    } else if (region === "sarawak") {
      onStateSelect(null as any);
      setGranularity("state");
      map.flyTo([2.6, 113.0], 7, { duration: 1.2 });
    }
  };

  // Locate User GPS Position & Display Nearest Station (among all 68+ districts)
  const handleLocateUser = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    toast.loading("Acquiring GPS location...", { id: "geo-toast" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        setUserCoords({ lat, lng, accuracy });

        if (!leafletMapRef.current || !LRef.current) return;
        const L = LRef.current;
        const map = leafletMapRef.current;

        // Find nearest district station among all 68+ stations in Malaysia
        let nearestDistrict = malaysiaDistricts[0];
        let minDistance = Infinity;

        for (const dst of malaysiaDistricts) {
          const dist = getDistanceKm(lat, lng, dst.coordinates[0], dst.coordinates[1]);
          if (dist < minDistance) {
            minDistance = dist;
            nearestDistrict = dst;
          }
        }

        const parentAqi = aqiMap[nearestDistrict.stateId] ?? 60;
        const nearestAqi = Math.max(10, Math.min(450, parentAqi + nearestDistrict.baseAqiOffset));
        const nearestInfo = getAqiInfo(nearestAqi);

        // Switch to district view and select parent state
        onStateSelect(nearestDistrict.stateId);
        setGranularity("district");
        setSelectedDistrictId(nearestDistrict.id);

        // Initialize or clear user location layer group
        if (!userLocationGroupRef.current) {
          userLocationGroupRef.current = L.layerGroup().addTo(map);
        } else {
          userLocationGroupRef.current.clearLayers();
        }

        // Add accuracy radius circle
        if (accuracy && accuracy < 50000) {
          L.circle([lat, lng], {
            radius: Math.max(accuracy, 120),
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: "4, 4",
          }).addTo(userLocationGroupRef.current);
        }

        // Add animated GPS beacon marker
        const userIcon = L.divIcon({
          className: "user-gps-custom-icon",
          html: `
            <div class="user-gps-marker">
              <div class="user-gps-wave"></div>
              <div class="user-gps-core"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const userMarker = L.marker([lat, lng], {
          icon: userIcon,
          zIndexOffset: 2500,
        }).addTo(userLocationGroupRef.current);

        const popupHtml = `
          <div style="font-family:system-ui,-apple-system,sans-serif;width:250px;padding:12px;background:white">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="font-size:16px">📍</span>
              <span style="font-size:13px;font-weight:700;color:#0f172a">Your Current Location</span>
            </div>
            <div style="font-size:11px;color:#64748b;margin-bottom:8px">
              GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (±${Math.round(accuracy)}m)
            </div>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px;margin-bottom:8px">
              <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase">Nearest CAQM Station</div>
              <div style="font-size:13px;font-weight:700;color:#0f172a;display:flex;align-items:center;gap:4px">
                <span>${nearestDistrict.name}</span>
                <span style="font-size:11px;color:#2563eb;font-weight:600">(${minDistance.toFixed(1)} km)</span>
              </div>
              <div style="font-size:11px;color:#334155;margin-top:3px">
                District AQI: <b style="color:${nearestInfo.color}">${nearestAqi}</b> — ${nearestInfo.label} (${nearestDistrict.stationType})
              </div>
            </div>
            <button id="user-loc-select-btn" style="width:100%;padding:6px 0;background:#0f172a;color:white;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer">
              Focus ${nearestDistrict.name} Station
            </button>
          </div>
        `;

        userMarker.bindPopup(popupHtml, { maxWidth: 280 });

        userMarker.on("popupopen", () => {
          const btn = document.getElementById("user-loc-select-btn");
          if (btn) {
            btn.onclick = () => {
              setSelectedDistrictId(nearestDistrict.id);
              map.flyTo(nearestDistrict.coordinates, 12, { duration: 1 });
              userMarker.closePopup();
            };
          }
        });

        // Smoothly fly map to user's location
        map.flyTo([lat, lng], 12, { duration: 1.4 });

        setTimeout(() => {
          userMarker.openPopup();
        }, 1500);

        toast.success(`📍 Location detected! Nearest station: ${nearestDistrict.name} (${minDistance.toFixed(1)} km).`, {
          id: "geo-toast",
        });
      },
      (err) => {
        setIsLocating(false);
        let msg = "Failed to obtain location.";
        if (err.code === 1) {
          msg = "Location permission denied. Please enable location access in your browser.";
        } else if (err.code === 2) {
          msg = "Location position is currently unavailable.";
        } else if (err.code === 3) {
          msg = "Location request timed out. Please try again.";
        }
        toast.error(msg, { id: "geo-toast" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [aqiMap, onStateSelect]);

  const legendItems = [
    { key: "good", label: "Good (0–50)", color: "#22c55e" },
    { key: "moderate", label: "Moderate (51–100)", color: "#eab308" },
    { key: "unhealthy-sensitive", label: "Sensitive (101–150)", color: "#f97316" },
    { key: "unhealthy", label: "Unhealthy (151–200)", color: "#ef4444" },
    { key: "very-unhealthy", label: "Hazardous (201+)", color: "#9333ea" },
  ];

  const selectedStateObj = selectedStateId ? malaysiaStates.find((s) => s.id === selectedStateId) : null;
  const stateDistricts = selectedStateId ? getDistrictsByState(selectedStateId) : [];

  return (
    <div
      className={`flex flex-col gap-3 transition-all ${
        isFullscreen ? "fixed inset-0 z-[100] bg-background/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto" : ""
      }`}
    >
      {/* Top Map Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card p-2.5 ring-1 ring-border shadow-xs">
        {/* Granularity & Region Jumps */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* State vs District Switcher */}
          <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border mr-1">
            <button
              type="button"
              onClick={() => {
                setGranularity("state");
                onStateSelect(null as any);
                leafletMapRef.current?.flyTo([4.1, 109.2], 6);
              }}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                granularity === "state"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="size-3.5" />
              <span>States (16)</span>
            </button>
            <button
              type="button"
              onClick={() => setGranularity("district")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                granularity === "district"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="size-3.5" />
              <span>Districts ({selectedStateId ? stateDistricts.length : "68"})</span>
            </button>
          </div>

          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider pl-1 pr-1 hidden sm:inline-flex items-center gap-1">
            <Compass className="size-3.5" /> Focus:
          </span>
          <button
            type="button"
            onClick={() => jumpToRegion("all")}
            className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-muted/80"
          >
            🇲🇾 All
          </button>
          <button
            type="button"
            onClick={() => jumpToRegion("peninsular")}
            className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            Peninsular
          </button>
          <button
            type="button"
            onClick={() => jumpToRegion("sabah")}
            className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            Sabah
          </button>
          <button
            type="button"
            onClick={() => jumpToRegion("sarawak")}
            className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            Sarawak
          </button>

          {/* Locate User GPS Button */}
          <button
            type="button"
            onClick={handleLocateUser}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-60 ml-1"
            title="Detect your current location (GPS) and show nearest air quality station"
          >
            <LocateFixed className={`size-3.5 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Locating..." : "My Location"}</span>
          </button>
        </div>

        {/* Map Styles & Layers */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Tile Layer Selector */}
          <div className="flex items-center rounded-lg bg-muted p-0.5 ring-1 ring-border">
            {(["satellite", "topo", "streets", "dark"] as TileStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => handleTileChange(style)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                  activeTile === style
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {TILE_LAYERS[style].name}
              </button>
            ))}
          </div>

          {/* Toggle Sempadan */}
          <button
            type="button"
            onClick={toggleBoundaries}
            title={showBoundaries ? "Hide State Boundaries" : "Show State Boundaries"}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-border transition-all ${
              showBoundaries ? "bg-primary/10 text-primary ring-primary/30" : "bg-muted text-muted-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            <span className="hidden md:inline">Zones</span>
          </button>

          {/* Toggle Pins */}
          <button
            type="button"
            onClick={toggleMarkers}
            title={showMarkers ? "Hide Station Pins" : "Show Station Pins"}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-border transition-all ${
              showMarkers ? "bg-primary/10 text-primary ring-primary/30" : "bg-muted text-muted-foreground"
            }`}
          >
            <MapPin className="size-3.5" />
            <span className="hidden md:inline">Pins</span>
          </button>

          {/* Toggle Simulation Mode */}
          {onToggleSimulation && (
            <button
              type="button"
              onClick={() => onToggleSimulation(!isSimulationActive)}
              title={isSimulationActive ? "Exit Simulation Mode" : "Start Haze Simulation"}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ring-1 transition-all ${
                isSimulationActive
                  ? "bg-amber-500 text-white ring-amber-600 shadow-xs"
                  : "bg-muted text-muted-foreground ring-border hover:text-foreground"
              }`}
            >
              <Flame className="size-3.5" />
              <span>{isSimulationActive ? "Simulation ON" : "Simulation"}</span>
            </button>
          )}

          {/* Zoom controls & Fullscreen Toggle */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5 ring-1 ring-border">
            <button
              type="button"
              onClick={() => leafletMapRef.current?.zoomIn()}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-background"
              title="Zoom In"
            >
              <ZoomIn className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => leafletMapRef.current?.zoomOut()}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-background"
              title="Zoom Out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-background"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="size-3.5 text-primary" /> : <Maximize2 className="size-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Realistic Interactive Map Viewport (Large & Prominent) */}
      <div
        className={`relative overflow-hidden rounded-2xl ring-1 ring-border shadow-md w-full transition-all ${
          isFullscreen ? "flex-1 min-h-[75vh]" : "h-[560px] md:h-[600px] xl:h-[640px]"
        }`}
      >
        <div ref={mapRef} style={{ height: "100%", width: "100%", zIndex: 1 }} />

        {/* Dynamic Animated Haze Smoke / Particle Overlay */}
        <HazeSmokeOverlay
          simulationDay={simulationDay}
          isSimulationActive={isSimulationActive}
        />

        {/* Floating Drill-down Breadcrumb & Info Badge */}
        <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 flex-wrap">
          {granularity === "district" && selectedStateId ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onStateSelect(null as any);
                  setGranularity("state");
                  leafletMapRef.current?.flyTo([4.1, 109.2], 6);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-card/95 px-3 py-1.5 text-xs font-bold text-foreground ring-1 ring-border shadow-md backdrop-blur-md hover:bg-muted transition-all cursor-pointer pointer-events-auto"
              >
                <ArrowLeft className="size-3.5 text-primary" />
                <span>All 16 States</span>
              </button>
              <div className="flex items-center gap-1.5 rounded-lg bg-card/95 px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-border shadow-md backdrop-blur-md">
                <span className="text-primary font-bold">{selectedStateObj?.name}:</span>
                <span className="text-muted-foreground">{stateDistricts.length} CAQM Stations</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur-md ring-1 ring-border shadow-md pointer-events-none">
              <Globe className="size-3.5 text-primary" />
              <span>
                {isSimulationActive
                  ? `🔥 Haze Simulation: ${simulationDay?.dayName} — ${simulationDay?.title}`
                  : granularity === "district"
                    ? "Malaysia 68+ District Monitoring Stations"
                    : "Malaysia Air Quality Live Map (16 States)"}
              </span>
            </div>
          )}
        </div>

        {/* Floating Quick Action Helper */}
        <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex items-center gap-1.5 rounded-lg bg-background/90 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur-md ring-1 ring-border shadow-xs pointer-events-none">
          <span>
            {isSimulationActive
              ? `💡 Simulation: ${simulationDay?.hotspotCount} fire hotspots · ${simulationDay?.affectedRegion}`
              : "💡 Click any station pin or state boundary for deep analysis"}
          </span>
        </div>
      </div>

      {/* Interactive Legend Bar with Filter functionality */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-4 py-2.5 ring-1 ring-border shadow-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">AQI Scale:</span>
          {legendItems.map((item) => {
            const isActive = filterLevel === item.key;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setFilterLevel(isActive ? null : item.key)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs transition-all ${
                  isActive
                    ? "bg-muted ring-1 ring-foreground/20 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                title={`Filter by ${item.label}`}
              >
                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {filterLevel && (
          <button
            type="button"
            onClick={() => setFilterLevel(null)}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
          >
            <RefreshCw className="size-3" /> Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
