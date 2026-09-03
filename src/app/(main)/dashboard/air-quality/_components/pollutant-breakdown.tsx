"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WaqiData } from "./waqi-service";

interface PollutantBreakdownProps {
  data: WaqiData | null;
  stateName: string;
}

interface PollutantEntry {
  key: string;
  label: string;
  unit: string;
  value: number | null;
  maxSafe: number;
  color: string;
}

function buildPollutants(iaqi: WaqiData["iaqi"]): PollutantEntry[] {
  return [
    { key: "pm25", label: "PM2.5", unit: "μg/m³", value: iaqi.pm25?.v ?? null, maxSafe: 35, color: "#f97316" },
    { key: "pm10", label: "PM10", unit: "μg/m³", value: iaqi.pm10?.v ?? null, maxSafe: 50, color: "#3b82f6" },
    { key: "o3", label: "Ozon (O₃)", unit: "ppb", value: iaqi.o3?.v ?? null, maxSafe: 70, color: "#8b5cf6" },
    { key: "no2", label: "Nitrogen Dioksida (NO₂)", unit: "ppb", value: iaqi.no2?.v ?? null, maxSafe: 53, color: "#ec4899" },
    { key: "so2", label: "Sulfur Dioksida (SO₂)", unit: "ppb", value: iaqi.so2?.v ?? null, maxSafe: 35, color: "#eab308" },
    { key: "co", label: "Karbon Monoksida (CO)", unit: "ppm", value: iaqi.co?.v ?? null, maxSafe: 4.4, color: "#6b7280" },
  ];
}

export function PollutantBreakdown({ data, stateName }: PollutantBreakdownProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Pecahan Bahan Pencemar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
            Pilih negeri untuk melihat butiran.
          </div>
        </CardContent>
      </Card>
    );
  }

  const pollutants = buildPollutants(data.iaqi);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          Pecahan Bahan Pencemar —{" "}
          <span className="font-normal text-muted-foreground">{stateName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* Extra data row: Temp, Humidity, Wind, Pressure */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Suhu", value: data.iaqi.t?.v, unit: "°C" },
            { label: "Kelembapan", value: data.iaqi.h?.v, unit: "%" },
            { label: "Angin", value: data.iaqi.w?.v, unit: "m/s" },
            { label: "Tekanan", value: data.iaqi.p?.v, unit: "hPa" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5 rounded-lg bg-muted/50 px-2 py-2 text-center">
              <span className="text-muted-foreground text-xs">{item.label}</span>
              <span className="font-semibold text-sm">
                {item.value !== undefined ? `${item.value}${item.unit}` : "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Pollutant bars */}
        <div className="flex flex-col gap-2.5">
          {pollutants.map((p) => {
            const pct = p.value !== null ? Math.min((p.value / (p.maxSafe * 2)) * 100, 100) : 0;
            const isOver = p.value !== null && p.value > p.maxSafe;

            return (
              <div key={p.key} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{p.label}</span>
                  <span className={isOver ? "font-semibold text-red-500" : "text-muted-foreground"}>
                    {p.value !== null ? `${p.value} ${p.unit}` : "—"}
                    {isOver && " ⚠️"}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: p.color }}
                  />
                </div>
                <div className="flex justify-end text-muted-foreground text-xs">
                  <span>Had selamat: {p.maxSafe} {p.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timestamp */}
        {data.time?.s && (
          <p className="mt-1 text-right text-muted-foreground text-xs">
            Kemaskini: {new Date(data.time.s).toLocaleString("ms-MY", { timeZone: "Asia/Kuala_Lumpur" })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
