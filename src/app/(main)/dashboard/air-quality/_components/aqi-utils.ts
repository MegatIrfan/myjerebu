export type AqiStatus = "good" | "moderate" | "unhealthy" | "very-unhealthy" | "hazardous" | "unknown";

export interface AqiInfo {
  status: AqiStatus;
  label: string;
  labelMs: string;
  emoji: string;
  color: string;
  bgClass: string;
  textClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  ringClass: string;
  dotClass: string;
}

export function getAqiInfo(aqi: number | null): AqiInfo {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return {
      status: "unknown",
      label: "Unknown",
      labelMs: "Tidak Diketahui",
      emoji: "❓",
      color: "#64748b",
      bgClass: "bg-muted",
      textClass: "text-muted-foreground",
      badgeBgClass: "bg-muted",
      badgeTextClass: "text-muted-foreground",
      ringClass: "ring-muted-foreground/30",
      dotClass: "bg-muted-foreground",
    };
  }

  // 0 - 50: Good (Blue)
  if (aqi <= 50) {
    return {
      status: "good",
      label: "Good",
      labelMs: "Baik",
      emoji: "😊",
      color: "#3b82f6",
      bgClass: "bg-blue-500/10",
      textClass: "text-blue-600 dark:text-blue-400",
      badgeBgClass: "bg-blue-500/15",
      badgeTextClass: "text-blue-600 dark:text-blue-400",
      ringClass: "ring-blue-500/40",
      dotClass: "bg-blue-500",
    };
  }

  // 51 - 100: Moderate (Green)
  if (aqi <= 100) {
    return {
      status: "moderate",
      label: "Moderate",
      labelMs: "Sederhana",
      emoji: "🙂",
      color: "#22c55e",
      bgClass: "bg-green-500/10",
      textClass: "text-green-600 dark:text-green-400",
      badgeBgClass: "bg-green-500/15",
      badgeTextClass: "text-green-600 dark:text-green-400",
      ringClass: "ring-green-500/40",
      dotClass: "bg-green-500",
    };
  }

  // 101 - 200: Unhealthy (Yellow)
  if (aqi <= 200) {
    return {
      status: "unhealthy",
      label: "Unhealthy",
      labelMs: "Tidak Sihat",
      emoji: "😷",
      color: "#eab308",
      bgClass: "bg-yellow-500/10",
      textClass: "text-yellow-600 dark:text-yellow-400",
      badgeBgClass: "bg-yellow-500/15",
      badgeTextClass: "text-yellow-600 dark:text-yellow-400",
      ringClass: "ring-yellow-500/40",
      dotClass: "bg-yellow-500",
    };
  }

  // 201 - 300: Very Unhealthy (Orange)
  if (aqi <= 300) {
    return {
      status: "very-unhealthy",
      label: "Very Unhealthy",
      labelMs: "Sangat Tidak Sihat",
      emoji: "🤢",
      color: "#f97316",
      bgClass: "bg-orange-500/10",
      textClass: "text-orange-600 dark:text-orange-400",
      badgeBgClass: "bg-orange-500/15",
      badgeTextClass: "text-orange-600 dark:text-orange-400",
      ringClass: "ring-orange-500/40",
      dotClass: "bg-orange-500",
    };
  }

  // > 300: Hazardous (Red)
  return {
    status: "hazardous",
    label: "Hazardous",
    labelMs: "Berbahaya",
    emoji: "☠️",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
    textClass: "text-red-600 dark:text-red-400",
    badgeBgClass: "bg-red-500/15",
    badgeTextClass: "text-red-600 dark:text-red-400",
    ringClass: "ring-red-500/40",
    dotClass: "bg-red-500",
  };
}

export function getAqiMapFill(aqi: number | null): string {
  if (aqi === null || aqi === undefined || isNaN(aqi)) return "#64748b";
  if (aqi <= 50) return "#3b82f6"; // Blue (Good)
  if (aqi <= 100) return "#22c55e"; // Green (Moderate)
  if (aqi <= 200) return "#eab308"; // Yellow (Unhealthy)
  if (aqi <= 300) return "#f97316"; // Orange (Very Unhealthy)
  return "#ef4444"; // Red (Hazardous)
}

export function formatAqi(aqi: number | null): string {
  if (aqi === null || aqi === undefined) return "N/A";
  return aqi.toString();
}
