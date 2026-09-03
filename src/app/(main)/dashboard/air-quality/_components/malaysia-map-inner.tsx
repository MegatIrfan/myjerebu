"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { StateAqiResult } from "./waqi-service";
import { getAqiMapFill, getAqiInfo } from "./aqi-utils";
import { malaysiaStates, type MalaysiaState } from "./malaysia-states";
import { Layers, MapPin, Globe, Compass, RefreshCw, ZoomIn, ZoomOut, Maximize2, Minimize2, Flame } from "lucide-react";
import type { SimulationDay } from "./haze-simulation-data";
import { HazeSmokeOverlay } from "./haze-smoke-overlay";

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
  const layersRef = useRef<Record<string, any>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  const [activeTile, setActiveTile] = useState<TileStyle>("satellite");
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 200);
      return next;
    });
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
          font-size: 11px;
          letter-spacing: -0.02em;
          border: 2px solid white;
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
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Function to render custom pulsing station markers
  const renderMarkers = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (L: any, map: any, group: any) => {
      if (!L || !group) return;
      group.clearLayers();

      malaysiaStates.forEach((state: MalaysiaState) => {
        const aqi = aqiMap[state.id] ?? null;
        const res = resultMap[state.id];
        const info = getAqiInfo(aqi);
        const fill = getAqiMapFill(aqi);
        const isSelected = selectedStateId === state.id;

        // Determine coordinates: prefer city.geo from API response if valid, else state center
        let lat = state.coordinates[0];
        let lng = state.coordinates[1];
        if (res?.data?.city?.geo && res.data.city.geo.length === 2) {
          lat = res.data.city.geo[0];
          lng = res.data.city.geo[1];
        }

        // Filter check
        if (filterLevel && info.status !== filterLevel) {
          return;
        }

        // Create Custom HTML Pin Icon
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

        // Rich Interactive Popup
        const temp = res?.data?.iaqi?.t?.v;
        const humidity = res?.data?.iaqi?.h?.v;
        const pm25 = res?.data?.iaqi?.pm25?.v;
        const stationTitle = res?.data?.city?.name || state.nameMs;

        const popupContent = `
          <div style="font-family:system-ui,-apple-system,sans-serif;width:230px;padding:12px;background:white">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:#888;letter-spacing:0.05em">${state.region === "peninsular" ? "Peninsular" : "East Malaysia"}</span>
              <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#f3f4f6;color:#555">Active Station</span>
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
            <button id="select-btn-${state.id}" style="width:100%;margin-top:10px;padding:6px 0;background:#0f172a;color:white;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer">
              View ${state.name} Analysis
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 260 });

        marker.on("popupopen", () => {
          const btn = document.getElementById(`select-btn-${state.id}`);
          if (btn) {
            btn.onclick = () => {
              onStateSelect(state.id);
              marker.closePopup();
            };
          }
        });

        marker.on("click", () => {
          onStateSelect(state.id);
        });

        group.addLayer(marker);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [aqiMap, selectedStateId, filterLevel]
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

          layer.bindTooltip(
            `<div style="font-family:system-ui,-apple-system,sans-serif;min-width:140px;padding:2px 4px">
              <div style="display:flex;align-items:center;gap:6px">
                <span class="malaysia-state-flag-icon malaysia-state-flag-icon-${flagCode}" style="width:16px;height:11px;display:inline-block;border-radius:2px"></span>
                <span style="font-weight:700;font-size:13px;color:#111">${stateName}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
                <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background-color:${getAqiMapFill(aqi)}"></span>
                <span style="font-weight:800;font-size:13px;color:#111">${aqi !== null ? `AQI ${aqi}` : "Tiada Data"}</span>
              </div>
              <div style="font-size:11px;font-weight:500;color:#555;margin-top:2px">${info.labelMs}</div>
            </div>`,
            { sticky: true, opacity: 0.95 }
          );

          layer.on({
            click() {
              if (stateId) onStateSelect(stateId);
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

  // Preset region view jumps
  const jumpToRegion = (region: "all" | "peninsular" | "sabah" | "sarawak") => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    if (region === "all") {
      if (geoLayerRef.current) {
        map.fitBounds(geoLayerRef.current.getBounds(), { padding: [16, 16], duration: 1 });
      } else {
        map.flyTo([4.1, 109.2], 6);
      }
    } else if (region === "peninsular") {
      map.flyTo([4.2, 102.0], 7, { duration: 1.2 });
    } else if (region === "sabah") {
      map.flyTo([5.4, 117.0], 7.5, { duration: 1.2 });
    } else if (region === "sarawak") {
      map.flyTo([2.6, 113.0], 7, { duration: 1.2 });
    }
  };

  const legendItems = [
    { key: "good", label: "Good (0–50)", color: "#22c55e" },
    { key: "moderate", label: "Moderate (51–100)", color: "#eab308" },
    { key: "unhealthy-sensitive", label: "Sensitive (101–150)", color: "#f97316" },
    { key: "unhealthy", label: "Unhealthy (151–200)", color: "#ef4444" },
    { key: "very-unhealthy", label: "Hazardous (201+)", color: "#9333ea" },
  ];

  return (
    <div
      className={`flex flex-col gap-3 transition-all ${
        isFullscreen ? "fixed inset-0 z-[100] bg-background/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto" : ""
      }`}
    >
      {/* Top Map Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card p-2.5 ring-1 ring-border shadow-xs">
        {/* Region Jumps */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider pl-1 pr-2 hidden sm:inline-flex items-center gap-1">
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

        {/* Floating Map Watermark / Info Badge */}
        <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 rounded-lg bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur-md ring-1 ring-border shadow-md pointer-events-none">
          <Globe className="size-3.5 text-primary" />
          <span>
            {isSimulationActive
              ? `🔥 Haze Simulation: ${simulationDay?.dayName} — ${simulationDay?.title}`
              : "Malaysia Air Quality Live Map"}
          </span>
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
