import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CloudSun,
  Eye,
  FileText,
  Gauge,
  Globe,
  Info,
  Layers,
  type LucideIcon,
  MapPin,
  ShieldAlert,
  TrendingUp,
  UserRound,
  Wind,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Main Monitoring",
    items: [
      {
        id: "public-portal",
        title: "APIMS Public Portal",
        url: "/",
        icon: Globe,
      },
      {
        id: "air-quality-live",
        title: "Live Air Quality",
        url: "/dashboard/air-quality",
        icon: Wind,
        badge: "new",
      },
      {
        id: "aqi-forecast",
        title: "7-Day AQI Forecast",
        url: "/dashboard/forecast",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: 2,
    label: "Analysis & Stations",
    items: [
      {
        id: "states-overview",
        title: "16 State Stations",
        url: "/dashboard/stations",
        icon: Building2,
      },
      {
        id: "pollutants-analysis",
        title: "Pollutant Breakdown",
        url: "/dashboard/pollutants",
        icon: Activity,
      },
      {
        id: "weather-conditions",
        title: "Weather & Climate",
        url: "/dashboard/weather",
        icon: CloudSun,
      },
    ],
  },
  {
    id: 3,
    label: "Advisory & Health",
    items: [
      {
        id: "health-advisory",
        title: "Health & Safety Guidelines",
        url: "/dashboard/advisory",
        icon: ShieldAlert,
      },
      {
        id: "haze-reports",
        title: "Annual Haze Reports",
        url: "/dashboard/reports",
        icon: FileText,
      },
    ],
  },
  {
    id: 4,
    label: "Account & System",
    items: [
      {
        id: "admin-profile",
        title: "Admin Profile",
        url: "/dashboard/profile",
        icon: UserRound,
      },
      {
        id: "alerts-notifications",
        title: "Alerts & Notifications",
        url: "/dashboard/alerts",
        icon: Bell,
      },
    ],
  },
];
