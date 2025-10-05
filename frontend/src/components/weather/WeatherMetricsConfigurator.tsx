// components/weather/WeatherMetricsConfigurator.tsx
"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ThermometerSun,
  ThermometerSnowflake,
  Wind,
  CloudRain,
  Droplets,
  Gauge,
  Sun,
  CloudSunRain,
  Cloud,
  Activity,
  Info,
  Settings as SettingsIcon,
  Download,
} from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { WeatherData } from "@/lib/getData";

/**
 * This file contains:
 *  1) A minimally-updated <WeatherMetrics> that accepts a new optional `visible` prop
 *  2) A new <WeatherMetricsConfigurator> wrapper with a friendly UI for picking which cards to display
 *
 * Drop-in: Replace your existing import of WeatherMetrics with this file, or
 * split the components into separate files if you prefer.
 */

/** ---------------- Types ---------------- */
export type CardKey =
  | "airTemp"
  | "dailyMax"
  | "dailyMin"
  | "precip"
  | "windSpeed"
  | "windDir"
  | "humidity"
  | "feeling"
  | "airQuality"
  | "probVeryHot"
  | "probVeryCold"
  | "probVeryWindy"
  | "probVeryWet"
  | "probVeryUncomfortable"
  | "T2M_trend"; // <-- Added

/** Small helpers */
const pct = (n: number) => `${n.toFixed(1)}%`;
const mm = (n: number) => `${n.toFixed(2)} mm`;
const ms = (n: number) => `${n.toFixed(1)} m/s`;
const celsius = (n: number) => `${n.toFixed(1)}°C`;

function degreesToCardinal(degrees: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

function getSimpleCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 315 || normalized < 45) return "N";
  if (normalized >= 45 && normalized < 135) return "E";
  if (normalized >= 135 && normalized < 225) return "S";
  return "W";
}

function confidenceColor(level: "low" | "medium" | "high"): Parameters<typeof Badge>[0]["color"] {
  switch (level) {
    case "high":
      return "success";
    case "medium":
      return "warning";
    default:
      return "error";
  }
}

function feelingBadge(feeling: string) {
  const f = feeling.toLowerCase();
  if (f === "hot") return <Badge variant="solid" color="warning">Hot</Badge>;
  if (f === "cold") return <Badge variant="solid" color="info">Cold</Badge>;
  return <Badge variant="solid" color="dark">{feeling}</Badge>;
}

function airQualityBadge(index: WeatherData["predicted_values"]["air_quality"]) {
  const label = index >= 9 ? "Excellent" : index >= 8 ? "Good" : index >= 7 ? "Fair" : index >= 5 ? "Moderate" : "Poor";
  const color: Parameters<typeof Badge>[0]["color"] = index >= 9 ? "success" : index >= 8 ? "success" : index >= 7 ? "info" : index >= 5 ? "warning" : "error";
  return (
    <div className="flex items-center gap-2">
      <Badge variant="solid" color={color}>{label}</Badge>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
      <div className="h-2 rounded-full bg-gray-800 dark:bg-white/80" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function WindDirectionVane({ degrees }: { degrees: number | undefined }) {
  if (degrees === undefined || degrees === null || isNaN(degrees)) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-sm">No data available</div>
        </div>
      </div>
    );
  }

  const cardinal = degreesToCardinal(degrees);
  const simpleCardinal = getSimpleCardinal(degrees);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-24 h-24 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">N</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">S</div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">W</div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">E</div>
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500" style={{ transform: `rotate(${degrees}deg)` }}>
          <div className="relative w-1 h-15">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500 dark:border-b-red-400"></div>
            <div className="w-full h-full bg-red-500 dark:bg-red-400"></div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400 dark:bg-gray-500 z-10"></div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{simpleCardinal}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{cardinal} ({degrees.toFixed(0)}°)</div>
      </div>
    </div>
  );
}

/** ---------------- Reusable Item card ---------------- */
function Item({ title, value, sub, badge = null, icon }: { title: string; value: React.ReactNode; sub?: React.ReactNode; badge?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon ?? <Info className="size-6 text-gray-800 dark:text-white/90" />}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 truncate">{value}</h4>
          {sub && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>}
        </div>
        {badge ?? <div />}
      </div>
    </div>
  );
}

/** ---------------- WeatherMetrics (now accepts `visible`) ---------------- */
export function WeatherMetrics({ data, visible }: { data: WeatherData; visible?: Partial<Record<CardKey, boolean>> }) {
  const { probabilities, predicted_values, confidence } = data;
  const show = (key: CardKey, fallback = true) => (visible?.[key] ?? fallback);

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
      {(show("airTemp") || show("dailyMax") || show("dailyMin") || show("precip") || show("windSpeed") || show("windDir") || show("humidity") || show("feeling") || show("airQuality")) && (
        <div className="col-span-full mt-3">
          <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Predicted Values</h3>
        </div>
      )}

      {show("T2M_trend") && data.predicted_values.T2M_trend !== undefined && (
        <Item
          title="Air Temp Trend"
          value={celsius(data.predicted_values.T2M_trend)}
          sub="Weighted recent mean + annual rate"
          badge={<Badge variant="light" color="info">Trend</Badge>}
          icon={<ThermometerSun className="size-6 text-gray-800 dark:text-white/90" />}
        />
      )}

      {show("airTemp") && (
        <Item
          title="Air Temp"
          value={celsius(predicted_values.T2M)}
          sub="Current-day mean"
          badge={<Badge variant="light" color={confidenceColor(confidence.T2M)}>Confidence: {confidence.T2M}</Badge>}
          icon={<ThermometerSun className="size-6 text-gray-800 dark:text-white/90" />}
        />
      )}

      {show("dailyMax") && (
        <Item
          title="Daily Max"
          value={celsius(predicted_values.T2M_MAX)}
          badge={<Badge variant="light" color={confidenceColor(confidence.T2M_MAX)}>Confidence: {confidence.T2M_MAX}</Badge>}
          icon={<Sun className="size-6 text-gray-800 dark:text-white/90" />}
        />
      )}

      {show("dailyMin") && (
        <Item
          title="Daily Min"
          value={celsius(predicted_values.T2M_MIN)}
          badge={<Badge variant="light" color="info">Nighttime Low</Badge>}
          icon={<Cloud className="size-6 text-gray-800 dark:text-white/90" />}
        />
      )}

      {show("precip") && (
        <Item
          title="Precipitation"
          value={mm(predicted_values.PRECTOTCORR)}
          sub={predicted_values.PRECTOTCORR >= 10 ? "Heavy rain risk" : predicted_values.PRECTOTCORR >= 1 ? "Light to moderate" : "Minimal"}
          badge={<Badge variant="light" color={confidenceColor(confidence.PRECTOTCORR)}>Confidence: {confidence.PRECTOTCORR}</Badge>}
          icon={<CloudSunRain className="size-6 text-gray-800 dark:text-white/90" />}
        />
      )}

      {show("windSpeed") && (
        <Item
          title="Wind Speed"
          value={ms(predicted_values.WS2M)}
          sub={predicted_values.WS2M >= 10 ? "Strong" : predicted_values.WS2M >= 5 ? "Breezy" : "Calm"}
          badge={<Badge variant="light" color={confidenceColor(confidence.WS2M)}>Confidence: {confidence.WS2M}</Badge>}
          icon={<Wind className="size-6 text-gray-800 dark:text-white/90" />}
        />
      )}

      {show("windDir") && predicted_values.WD2M !== undefined && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Wind Direction</span>
            <Badge variant="light" color="info">Live</Badge>
          </div>
          <div className="flex items-center justify-center">
            <WindDirectionVane degrees={predicted_values.WD2M} />
          </div>
        </div>
      )}

      {show("humidity") && (
        <Item
          title="Relative Humidity"
          value={`${predicted_values.RH2M.toFixed(0)}%`}
          sub={predicted_values.RH2M >= 80 ? "Muggy" : predicted_values.RH2M <= 30 ? "Dry" : "Comfortable"}
          badge={<Badge variant="light" color={confidenceColor(confidence.RH2M)}>Confidence: {confidence.RH2M}</Badge>}
          icon={<Droplets className="size-6 text-gray-800 dark:text-white/90" />}
        />
      )}

      {show("feeling") && (
        <Item title="Feeling" value={data.predicted_values.feeling} badge={feelingBadge(data.predicted_values.feeling)} icon={<Gauge className="size-6 text-gray-800 dark:text-white/90" />} />
      )}

      {show("airQuality") && (
        <Item title="Air Quality" value={`AQI ${data.predicted_values.air_quality}/10`} badge={airQualityBadge(data.predicted_values.air_quality)} icon={<Activity className="size-6 text-gray-800 dark:text-white/90" />} />
      )}

      {(show("probVeryHot") || show("probVeryCold") || show("probVeryWindy") || show("probVeryWet") || show("probVeryUncomfortable")) && (
        <div className="col-span-full">
          <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Probabilities</h3>
        </div>
      )}

      {show("probVeryHot") && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <ThermometerSun className="size-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0 w-full">
              <span className="text-sm text-gray-500 dark:text-gray-400">Very Hot (&gt;35°C)</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{pct(data.probabilities.very_hot)}</h4>
              <Progress value={data.probabilities.very_hot} />
            </div>
            <Badge variant="light" color={data.probabilities.very_hot >= 60 ? "warning" : "info"}>Risk</Badge>
          </div>
        </div>
      )}

      {show("probVeryCold") && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <ThermometerSnowflake className="size-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0 w-full">
              <span className="text-sm text-gray-500 dark:text-gray-400">Very Cold (&lt;-10°C)</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{pct(data.probabilities.very_cold)}</h4>
              <Progress value={data.probabilities.very_cold} />
            </div>
            <Badge variant="light" color={data.probabilities.very_cold >= 60 ? "warning" : "info"}>Risk</Badge>
          </div>
        </div>
      )}

      {show("probVeryWindy") && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <Wind className="size-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0 w-full">
              <span className="text-sm text-gray-500 dark:text-gray-400">Very Windy (&gt;10 m/s)</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{pct(data.probabilities.very_windy)}</h4>
              <Progress value={data.probabilities.very_windy} />
            </div>
            <Badge variant="light" color={data.probabilities.very_windy >= 60 ? "warning" : "info"}>Risk</Badge>
          </div>
        </div>
      )}

      {show("probVeryWet") && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <CloudRain className="size-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0 w-full">
              <span className="text-sm text-gray-500 dark:text-gray-400">Very Wet (&gt;10 mm/day)</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{pct(data.probabilities.very_wet)}</h4>
              <Progress value={data.probabilities.very_wet} />
            </div>
            <Badge variant="light" color={data.probabilities.very_wet >= 60 ? "warning" : "info"}>Risk</Badge>
          </div>
        </div>
      )}

      {show("probVeryUncomfortable") && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <Droplets className="size-6 text-gray-800 dark:text-white/90" />
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div className="min-w-0 w-full">
              <span className="text-sm text-gray-500 dark:text-gray-400">Very Uncomfortable Humidity (&gt;80%)</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{pct(data.probabilities.very_uncomfortable)}</h4>
              <Progress value={data.probabilities.very_uncomfortable} />
            </div>
            <Badge variant="light" color={data.probabilities.very_uncomfortable >= 40 ? "warning" : "info"}>Risk</Badge>
          </div>
        </div>
      )}
    </div>
  );
}

/** ---------------- Configurator ---------------- */
const ALL_KEYS: CardKey[] = [
  "airTemp",
  "dailyMax",
  "dailyMin",
  "precip",
  "windSpeed",
  "windDir",
  "humidity",
  "feeling",
  "airQuality",
  "probVeryHot",
  "probVeryCold",
  "probVeryWindy",
  "probVeryWet",
  "probVeryUncomfortable",
  "T2M_trend", // <-- Added
];

const LABELS: Record<CardKey, string> = {
  airTemp: "Air Temp",
  dailyMax: "Daily Max",
  dailyMin: "Daily Min",
  precip: "Precipitation",
  windSpeed: "Wind Speed",
  windDir: "Wind Direction",
  humidity: "Relative Humidity",
  feeling: "Feeling",
  airQuality: "Air Quality",
  probVeryHot: "Prob. Very Hot",
  probVeryCold: "Prob. Very Cold",
  probVeryWindy: "Prob. Very Windy",
  probVeryWet: "Prob. Very Wet",
  probVeryUncomfortable: "Prob. Very Uncomfortable",
  T2M_trend: "Air Temp Trend", // <-- Added
};

const STORAGE_KEY = "weather.visibleCards.v1";

function usePersistentSelection(initial: CardKey[]) {
  const [selected, setSelected] = useState<CardKey[]>(initial);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CardKey[];
        if (Array.isArray(parsed) && parsed.length) setSelected(parsed.filter((k): k is CardKey => ALL_KEYS.includes(k as CardKey)));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {}
  }, [selected]);

  return [selected, setSelected] as const;
}

export default function WeatherMetricsConfigurator({ data, defaultVisible }: { data: WeatherData; defaultVisible?: CardKey[] }) {
  const [selected, setSelected] = usePersistentSelection(defaultVisible ?? ALL_KEYS);

  const visibleMap = useMemo(() => {
    const m: Partial<Record<CardKey, boolean>> = {};
    ALL_KEYS.forEach((k) => (m[k] = selected.includes(k)));
    return m;
  }, [selected]);

  function toggle(k: CardKey) {
    setSelected((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  function selectAll() {
    setSelected(ALL_KEYS);
  }

  function selectNone() {
    setSelected([]);
  }

  function exportToCSV() {
    if (!data) {
      console.error("No weather data available");
      return;
    }

    const { predicted_values, confidence, probabilities, metadata } = data;
    const csvRows: string[] = [];

    // Helper function to check for sentinel/invalid values
    const isSentinelValue = (value: number): boolean => {
      return value <= -999 || value === -999 || !isFinite(value) || isNaN(value);
    };

    // Helper function to format value or return N/A
    const formatValue = (value: number, decimals: number = 2): string => {
      return isSentinelValue(value) ? "N/A" : value.toFixed(decimals);
    };

    // ===== HEADER SECTION =====
    csvRows.push("WEATHER DATA EXPORT");
    csvRows.push(`Export Date:,${new Date().toLocaleString()}`);
    csvRows.push(`Location:,"Latitude ${metadata.location.latitude}° / Longitude ${metadata.location.longitude}°"`);
    csvRows.push("");
    csvRows.push("");

    // ===== PREDICTED VALUES SECTION =====
    const hasPredictedValues = selected.some(k => 
      ["airTemp", "dailyMax", "dailyMin", "precip", "windSpeed", "windDir", "humidity", "feeling", "airQuality", "T2M_trend"].includes(k)
    );

    if (hasPredictedValues) {
      csvRows.push("PREDICTED VALUES");
      csvRows.push("Parameter,Value,Unit,Confidence Level,Margin of Error,Confidence Interval,Data Points");
      
      if (selected.includes("airTemp")) {
        csvRows.push(`Air Temperature (T2M),${formatValue(predicted_values.T2M)},°C,${confidence.T2M},±${formatValue(data.uncertainty.predicted_values.T2M.margin_of_error)},${formatValue(data.uncertainty.predicted_values.T2M.confidence_interval_width)},${metadata.data_points_used.T2M}`);
      }
      
      if (selected.includes("dailyMax")) {
        csvRows.push(`Daily Max Temperature,${formatValue(predicted_values.T2M_MAX)},°C,${confidence.T2M_MAX},±${formatValue(data.uncertainty.predicted_values.T2M_MAX.margin_of_error)},${formatValue(data.uncertainty.predicted_values.T2M_MAX.confidence_interval_width)},${metadata.data_points_used.T2M_MAX}`);
      }
      
      if (selected.includes("dailyMin")) {
        csvRows.push(`Daily Min Temperature,${formatValue(predicted_values.T2M_MIN)},°C,${confidence.T2M_MIN},±${formatValue(data.uncertainty.predicted_values.T2M_MIN.margin_of_error)},${formatValue(data.uncertainty.predicted_values.T2M_MIN.confidence_interval_width)},${metadata.data_points_used.T2M_MIN}`);
      }
      
      if (selected.includes("precip")) {
        csvRows.push(`Precipitation (Total),${formatValue(predicted_values.PRECTOTCORR)},mm,${confidence.PRECTOTCORR},±${formatValue(data.uncertainty.predicted_values.PRECTOTCORR.margin_of_error)},${formatValue(data.uncertainty.predicted_values.PRECTOTCORR.confidence_interval_width)},${metadata.data_points_used.PRECTOTCORR}`);
      }
      
      if (selected.includes("windSpeed")) {
        csvRows.push(`Wind Speed,${formatValue(predicted_values.WS2M)},m/s,${confidence.WS2M},±${formatValue(data.uncertainty.predicted_values.WS2M.margin_of_error)},${formatValue(data.uncertainty.predicted_values.WS2M.confidence_interval_width)},${metadata.data_points_used.WS2M}`);
      }
      
      if (selected.includes("windDir")) {
        csvRows.push(`Wind Direction,${formatValue(predicted_values.WD2M, 0)},degrees,${confidence.WD2M},±${formatValue(data.uncertainty.predicted_values.WD2M.margin_of_error)},${formatValue(data.uncertainty.predicted_values.WD2M.confidence_interval_width)},${metadata.data_points_used.WD2M}`);
      }
      
      if (selected.includes("humidity")) {
        csvRows.push(`Relative Humidity,${formatValue(predicted_values.RH2M, 1)},%,${confidence.RH2M},±${formatValue(data.uncertainty.predicted_values.RH2M.margin_of_error)},${formatValue(data.uncertainty.predicted_values.RH2M.confidence_interval_width)},${metadata.data_points_used.RH2M}`);
      }
      
      if (selected.includes("feeling")) {
        csvRows.push(`Thermal Feeling,${predicted_values.feeling},-,-,-,-,-`);
      }
      
      if (selected.includes("airQuality")) {
        csvRows.push(`Air Quality Index,${predicted_values.air_quality},/10,-,-,-,-`);
      }

      if (selected.includes("T2M_trend")) {
        csvRows.push(`Temperature Trend,${formatValue(predicted_values.T2M_trend)},°C/day,-,-,-,-`);
      }
      
      csvRows.push("");
      csvRows.push("");
    }

    // ===== PROBABILITY ANALYSIS SECTION =====
    const hasProbabilities = selected.some(k => 
      ["probVeryHot", "probVeryCold", "probVeryWindy", "probVeryWet", "probVeryUncomfortable"].includes(k)
    );

    if (hasProbabilities) {
      csvRows.push("PROBABILITY ANALYSIS");
      csvRows.push("Condition,Probability (%),Risk Level,Description");
      
      if (selected.includes("probVeryHot")) {
        const riskLevel = probabilities.very_hot >= 60 ? "HIGH" : probabilities.very_hot >= 30 ? "MODERATE" : "LOW";
        csvRows.push(`Very Hot Conditions,${probabilities.very_hot.toFixed(1)},${riskLevel},Temperature exceeds 35°C`);
      }
      
      if (selected.includes("probVeryCold")) {
        const riskLevel = probabilities.very_cold >= 60 ? "HIGH" : probabilities.very_cold >= 30 ? "MODERATE" : "LOW";
        csvRows.push(`Very Cold Conditions,${probabilities.very_cold.toFixed(1)},${riskLevel},Temperature below -10°C`);
      }
      
      if (selected.includes("probVeryWindy")) {
        const riskLevel = probabilities.very_windy >= 60 ? "HIGH" : probabilities.very_windy >= 30 ? "MODERATE" : "LOW";
        csvRows.push(`Very Windy Conditions,${probabilities.very_windy.toFixed(1)},${riskLevel},Wind speed exceeds 10 m/s`);
      }
      
      if (selected.includes("probVeryWet")) {
        const riskLevel = probabilities.very_wet >= 60 ? "HIGH" : probabilities.very_wet >= 30 ? "MODERATE" : "LOW";
        csvRows.push(`Very Wet Conditions,${probabilities.very_wet.toFixed(1)},${riskLevel},Precipitation exceeds 10 mm/day`);
      }
      
      if (selected.includes("probVeryUncomfortable")) {
        const riskLevel = probabilities.very_uncomfortable >= 40 ? "HIGH" : probabilities.very_uncomfortable >= 20 ? "MODERATE" : "LOW";
        csvRows.push(`Very Uncomfortable Humidity,${probabilities.very_uncomfortable.toFixed(1)},${riskLevel},Humidity exceeds 80%`);
      }
      
      csvRows.push("");
      csvRows.push("");
    }

    // ===== METADATA FOOTER =====
    csvRows.push("METADATA");
    csvRows.push("Information,Value");
    csvRows.push(`Export Generated,${new Date().toLocaleString()}`);
    csvRows.push(`Selected Parameters,${selected.length} of ${ALL_KEYS.length}`);
    csvRows.push(`Total Data Points,${Object.values(metadata.data_points_used).reduce((a, b) => a + b, 0)}`);

    // Convert to CSV string
    const csvContent = csvRows.join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Generate filename with date and time
    const now = new Date();
    const filename = `weather_export_${metadata.location.latitude.toFixed(2)}_${metadata.location.longitude.toFixed(2)}_${now.toISOString().split('T')[0]}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-wrap items-center gap-2 justify-between rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <SettingsIcon className="size-5 text-gray-700 dark:text-white/80" />
          <span className="text-sm font-medium text-gray-700 dark:text-white/80">Choose cards</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={exportToCSV} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl bg-gray-800 hover:bg-gray-700 text-white dark:bg-white dark:text-gray-800 dark:hover:bg-gray-200 transition-colors"
            title={`Export ${selected.length} selected parameter(s) to CSV`}
          >
            <Download className="size-4" />
            <span>Export CSV ({selected.length})</span>
          </button>
          <button onClick={selectAll} className="px-3 py-1.5 text-sm text-black rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">Select all</button>
          <button onClick={selectNone} className="px-3 py-1.5 text-sm text-black rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">Clear</button>
        </div>
      </div>

      {/* Checkbox grid */}
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {ALL_KEYS.map((k) => (
          <label key={k} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03] cursor-pointer select-none">
            <input
              type="checkbox"
              className="size-4 accent-gray-800 dark:accent-white"
              checked={selected.includes(k)}
              onChange={() => toggle(k)}
            />
            <span className="text-sm text-gray-700 dark:text-white/80">{LABELS[k]}</span>
          </label>
        ))}
      </div>

      {/* Render metrics with visibility map */}
      <WeatherMetrics data={data} visible={visibleMap} />
    </div>
  );
}
