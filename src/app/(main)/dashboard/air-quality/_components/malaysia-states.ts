export interface MalaysiaState {
  id: string;
  name: string;
  nameMs: string;
  waqiStation: string;
  region: "peninsular" | "east";
  coordinates: [number, number]; // [lat, lng]
  flagCode: string;
}

export const malaysiaStates: MalaysiaState[] = [
  { id: "kuala-lumpur", name: "Kuala Lumpur", nameMs: "Kuala Lumpur", waqiStation: "kuala-lumpur", region: "peninsular", coordinates: [3.1390, 101.6869], flagCode: "kul" },
  { id: "selangor", name: "Selangor", nameMs: "Selangor", waqiStation: "shah-alam", region: "peninsular", coordinates: [3.0738, 101.5183], flagCode: "sgr" },
  { id: "johor", name: "Johor", nameMs: "Johor", waqiStation: "johor-bahru", region: "peninsular", coordinates: [1.4927, 103.7414], flagCode: "jhr" },
  { id: "penang", name: "Penang", nameMs: "Pulau Pinang", waqiStation: "penang", region: "peninsular", coordinates: [5.4141, 100.3288], flagCode: "png" },
  { id: "perak", name: "Perak", nameMs: "Perak", waqiStation: "ipoh", region: "peninsular", coordinates: [4.5975, 101.0901], flagCode: "prk" },
  { id: "kedah", name: "Kedah", nameMs: "Kedah", waqiStation: "alor-setar", region: "peninsular", coordinates: [6.1248, 100.3678], flagCode: "kdh" },
  { id: "kelantan", name: "Kelantan", nameMs: "Kelantan", waqiStation: "kota-bharu", region: "peninsular", coordinates: [6.1254, 102.2386], flagCode: "ktn" },
  { id: "terengganu", name: "Terengganu", nameMs: "Terengganu", waqiStation: "kuala-terengganu", region: "peninsular", coordinates: [5.3117, 103.1324], flagCode: "trg" },
  { id: "pahang", name: "Pahang", nameMs: "Pahang", waqiStation: "kuantan", region: "peninsular", coordinates: [3.8077, 103.3260], flagCode: "phg" },
  { id: "negeri-sembilan", name: "Negeri Sembilan", nameMs: "Negeri Sembilan", waqiStation: "seremban", region: "peninsular", coordinates: [2.7258, 101.9424], flagCode: "nsn" },
  { id: "melaka", name: "Melaka", nameMs: "Melaka", waqiStation: "melaka", region: "peninsular", coordinates: [2.1896, 102.2501], flagCode: "mlk" },
  { id: "perlis", name: "Perlis", nameMs: "Perlis", waqiStation: "kangar", region: "peninsular", coordinates: [6.4449, 100.1985], flagCode: "pls" },
  { id: "sabah", name: "Sabah", nameMs: "Sabah", waqiStation: "kota-kinabalu", region: "east", coordinates: [5.9804, 116.0735], flagCode: "sbh" },
  { id: "sarawak", name: "Sarawak", nameMs: "Sarawak", waqiStation: "kuching", region: "east", coordinates: [1.5533, 110.3592], flagCode: "swk" },
  { id: "putrajaya", name: "Putrajaya", nameMs: "Putrajaya", waqiStation: "putrajaya", region: "peninsular", coordinates: [2.9264, 101.6964], flagCode: "pjy" },
  { id: "labuan", name: "Labuan", nameMs: "Labuan", waqiStation: "labuan", region: "east", coordinates: [5.2831, 115.2308], flagCode: "lbn" },
];

// Map from WAQI station id → state id for reverse lookup
export const stationToStateMap: Record<string, string> = Object.fromEntries(
  malaysiaStates.map((s) => [s.waqiStation, s.id]),
);
