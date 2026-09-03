const WAQI_TOKEN = "8e0cae8e7ce7c27459a65fbd04cddc2b924a4ee5";
const BASE_URL = "https://api.waqi.info";

export interface WaqiPollutant {
  v: number;
}

export interface WaqiForecastDay {
  avg: number;
  day: string;
  max: number;
  min: number;
}

export interface WaqiData {
  aqi: number;
  city: {
    name: string;
    geo: [number, number];
  };
  dominentpol: string;
  iaqi: {
    co?: WaqiPollutant;
    h?: WaqiPollutant;
    no2?: WaqiPollutant;
    o3?: WaqiPollutant;
    p?: WaqiPollutant;
    pm10?: WaqiPollutant;
    pm25?: WaqiPollutant;
    so2?: WaqiPollutant;
    t?: WaqiPollutant;
    w?: WaqiPollutant;
  };
  time: {
    s: string;
    iso: string;
    tz: string;
  };
  forecast?: {
    daily: {
      pm10?: WaqiForecastDay[];
      pm25?: WaqiForecastDay[];
      o3?: WaqiForecastDay[];
      uvi?: WaqiForecastDay[];
    };
  };
}

export interface WaqiResponse {
  status: "ok" | "error";
  data: WaqiData | string;
}

export interface StateAqiResult {
  stateId: string;
  stationName: string;
  data: WaqiData | null;
  error: boolean;
}

export async function fetchStationAqi(station: string): Promise<WaqiData | null> {
  try {
    const res = await fetch(`${BASE_URL}/feed/${encodeURIComponent(station)}/?token=${WAQI_TOKEN}`, {
      next: { revalidate: 1800 }, // revalidate every 30 minutes
    });
    if (!res.ok) return null;
    const json: WaqiResponse = await res.json();
    if (json.status !== "ok" || typeof json.data === "string") return null;
    return json.data as WaqiData;
  } catch {
    return null;
  }
}

export async function fetchAllStatesAqi(
  states: Array<{ id: string; name: string; waqiStation: string }>,
): Promise<StateAqiResult[]> {
  const results = await Promise.allSettled(
    states.map(async (state) => {
      const data = await fetchStationAqi(state.waqiStation);
      return {
        stateId: state.id,
        stationName: state.name,
        data,
        error: data === null,
      } satisfies StateAqiResult;
    }),
  );

  return results.map((result, i) => {
    if (result.status === "fulfilled") return result.value;
    return {
      stateId: states[i].id,
      stationName: states[i].name,
      data: null,
      error: true,
    };
  });
}
