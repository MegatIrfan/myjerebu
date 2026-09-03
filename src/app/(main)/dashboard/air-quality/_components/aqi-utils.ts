export type AqiStatus = "good" | "moderate" | "sensitive" | "unhealthy" | "very-unhealthy" | "hazardous" | "unknown";

export interface AqiInfo {
  status: AqiStatus;
  label: string;
  labelMs: string;
  emoji: string;
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
      bgClass: "bg-muted",
      textClass: "text-muted-foreground",
      badgeBgClass: "bg-muted",
      badgeTextClass: "text-muted-foreground",
      ringClass: "ring-muted-foreground/30",
      dotClass: "bg-muted-foreground",
    };
  }

  if (aqi <= 50) {
    return {
      status: "good",
      label: "Good",
      labelMs: "Baik",
      emoji: "😊",
      bgClass: "bg-green-500/10",
      textClass: "text-green-700 dark:text-green-300",
      badgeBgClass: "bg-green-500/15",
      badgeTextClass: "text-green-700 dark:text-green-300",
      ringClass: "ring-green-500/40",
      dotClass: "bg-green-500",
    };
  }

  if (aqi <= 100) {
    return {
      status: "moderate",
      label: "Moderate",
      labelMs: "Sederhana",
      emoji: "😐",
      bgClass: "bg-yellow-500/10",
      textClass: "text-yellow-700 dark:text-yellow-300",
      badgeBgClass: "bg-yellow-500/15",
      badgeTextClass: "text-yellow-700 dark:text-yellow-300",
      ringClass: "ring-yellow-500/40",
      dotClass: "bg-yellow-500",
    };
  }

  if (aqi <= 150) {
    return {
      status: "sensitive",
      label: "Unhealthy for Sensitive Groups",
      labelMs: "Tidak Sihat (Kumpulan Sensitif)",
      emoji: "😷",
      bgClass: "bg-orange-500/10",
      textClass: "text-orange-700 dark:text-orange-300",
      badgeBgClass: "bg-orange-500/15",
      badgeTextClass: "text-orange-700 dark:text-orange-300",
      ringClass: "ring-orange-500/40",
      dotClass: "bg-orange-500",
    };
  }

  if (aqi <= 200) {
    return {
      status: "unhealthy",
      label: "Unhealthy",
      labelMs: "Tidak Sihat",
      emoji: "🤢",
      bgClass: "bg-red-500/10",
      textClass: "text-red-700 dark:text-red-300",
      badgeBgClass: "bg-red-500/15",
      badgeTextClass: "text-red-700 dark:text-red-300",
      ringClass: "ring-red-500/40",
      dotClass: "bg-red-500",
    };
  }

  if (aqi <= 300) {
    return {
      status: "very-unhealthy",
      label: "Very Unhealthy",
      labelMs: "Sangat Tidak Sihat",
      emoji: "🚨",
      bgClass: "bg-purple-600/10",
      textClass: "text-purple-700 dark:text-purple-300",
      badgeBgClass: "bg-purple-600/15",
      badgeTextClass: "text-purple-700 dark:text-purple-300",
      ringClass: "ring-purple-600/40",
      dotClass: "bg-purple-600",
    };
  }

  return {
    status: "hazardous",
    label: "Hazardous",
    labelMs: "Berbahaya",
    emoji: "☠️",
    bgClass: "bg-rose-900/10",
    textClass: "text-rose-900 dark:text-rose-300",
    badgeBgClass: "bg-rose-900/15",
    badgeTextClass: "text-rose-900 dark:text-rose-300",
    ringClass: "ring-rose-900/40",
    dotClass: "bg-rose-900",
  };
}

export function getAqiMapFill(aqi: number | null): string {
  if (aqi === null || aqi === undefined || isNaN(aqi)) return "currentColor";
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#9333ea";
  return "#881337";
}

export function formatAqi(aqi: number | null): string {
  if (aqi === null || aqi === undefined) return "N/A";
  return aqi.toString();
}
