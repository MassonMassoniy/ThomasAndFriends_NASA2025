// components/weather/WeatherMetrics.tsx
"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  ThermometerSun,
  ThermometerSnowflake,
  Wind,
  CloudRain,
  Droplets,
  Gauge,
  Sun,
  CloudSun,
  CloudSunRain,
  Cloud,
  Activity,
  Info,
} from "lucide-react";

/** ---------------- Types (match your JSON) ---------------- */
type WeatherData = {
  probabilities: {
    very_hot: number;
    very_cold: number;
    very_windy: number;
    very_wet: number;
    very_uncomfortable: number;
  };
  predicted_values: {
    T2M: number;
    T2M_MAX: number;
    T2M_MIN: number;
    PRECTOTCORR: number;
    WS2M: number;
    WD2M?: number;
    RH2M: number;
    feeling: "Hot" | "Cold" | string;
    precipitation: boolean;
    air_quality: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  };
  confidence: {
    T2M: "low" | "medium" | "high";
    T2M_MAX: "low" | "medium" | "high";
    PRECTOTCORR: "low" | "medium" | "high";
    WS2M: "low" | "medium" | "high";
    RH2M: "low" | "medium" | "high";
  };
};

/** ---------------- Small helpers ---------------- */
const pct = (n: number) => `${n.toFixed(1)}%`;
const mm = (n: number) => `${n.toFixed(2)} mm`;
const ms = (n: number) => `${n.toFixed(1)} m/s`;
const celsius = (n: number) => `${n.toFixed(1)}°C`;

/** Convert degrees to cardinal direction */
function degreesToCardinal(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

/** Get simple cardinal direction (N, E, S, W) */
function getSimpleCardinal(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized >= 315 || normalized < 45) return 'N';
  if (normalized >= 45 && normalized < 135) return 'E';
  if (normalized >= 135 && normalized < 225) return 'S';
  return 'W';
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

function precipitationBadge(val: boolean) {
  return val ? (
    <Badge variant="solid" color="info">Precipitation Likely</Badge>
  ) : (
    <Badge variant="light" color="dark">No Significant Precip</Badge>
  );
}

function airQualityBadge(index: WeatherData["predicted_values"]["air_quality"]) {
  // 0-10 scale; map to label/color
  const label =
    index >= 9 ? "Excellent"
      : index >= 8 ? "Good"
      : index >= 7 ? "Fair"
      : index >= 5 ? "Moderate"
      : "Poor";
  const color: Parameters<typeof Badge>[0]["color"] =
    index >= 9 ? "success"
      : index >= 8 ? "success"
      : index >= 7 ? "info"
      : index >= 5 ? "warning"
      : "error";
  return (
    <div className="flex items-center gap-2">
      <Badge variant="solid" color={color}>{label}</Badge>
    </div>
  );
}

/** A tiny progress bar used for probability cards */
function Progress({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className="h-2 rounded-full bg-gray-800 dark:bg-white/80"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/** Wind direction vane component */
function WindDirectionVane({ degrees }: { degrees: number | undefined }) {
  // Handle undefined or invalid degrees
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
        {/* Compass circle with vane */}
        <div className="relative w-24 h-24 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
          {/* Cardinal markers */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">N</div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">S</div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">W</div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 dark:text-gray-400">E</div>
          
          {/* Wind direction arrow (pointing TO direction) - centered */}
          <div 
            className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${degrees}deg)` }}
          >
            <div className="relative w-1 h-15">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500 dark:border-b-red-400"></div>
              <div className="w-full h-full bg-red-500 dark:bg-red-400"></div>
            </div>
          </div>
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400 dark:bg-gray-500 z-10"></div>
        </div>
      
      {/* Direction info */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">{simpleCardinal}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{cardinal} ({degrees.toFixed(0)}°)</div>
      </div>
    </div>
  );
}

/** ---------------- Reusable Item card ---------------- */
type ItemProps = {
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
};
function Item({ title, value, sub, badge=null, icon }: ItemProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon ?? <Info className="size-6 text-gray-800 dark:text-white/90" />}
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 truncate">
            {value}
          </h4>
          {/* {sub && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</div>} */}
        </div>
        {badge ?? <div></div>}
      </div>
    </div>
  );
}

/** ---------------- Main grid ---------------- */
export default function WeatherMetrics({ data }: { data: WeatherData }) {
  const { probabilities, predicted_values, confidence } = data;

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">

      {/* -------- Predicted Values -------- */}
      <div className="col-span-full mt-3">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Predicted Values</h3>
      </div>

      <Item
        title="Air Temp"
        value={celsius(predicted_values.T2M)}
        sub="Current-day mean"
        badge={<Badge variant="light" color={confidenceColor(confidence.T2M)}>Confidence: {confidence.T2M}</Badge>}
        icon={<ThermometerSun className="size-6 text-gray-800 dark:text-white/90" />}
      />

      <Item
        title="Daily Max"
        value={celsius(predicted_values.T2M_MAX)}
        badge={<Badge variant="light" color={confidenceColor(confidence.T2M_MAX)}>Confidence: {confidence.T2M_MAX}</Badge>}
        icon={<Sun className="size-6 text-gray-800 dark:text-white/90" />}
      />

      <Item
        title="Daily Min"
        value={celsius(predicted_values.T2M_MIN)}
        badge={<Badge variant="light" color="info">Nighttime Low</Badge>}
        icon={<Cloud className="size-6 text-gray-800 dark:text-white/90" />}
      />

      <Item
        title="Precipitation"
        value={mm(predicted_values.PRECTOTCORR)}
        sub={predicted_values.PRECTOTCORR >= 10 ? "Heavy rain risk" : predicted_values.PRECTOTCORR >= 1 ? "Light to moderate" : "Minimal"}
        badge={<Badge variant="light" color={confidenceColor(confidence.PRECTOTCORR)}>Confidence: {confidence.PRECTOTCORR}</Badge>}
        icon={<CloudSunRain className="size-6 text-gray-800 dark:text-white/90" />}
      />

      <Item
        title="Wind Speed"
        value={ms(predicted_values.WS2M)}
        sub={predicted_values.WS2M >= 10 ? "Strong" : predicted_values.WS2M >= 5 ? "Breezy" : "Calm"}
        badge={<Badge variant="light" color={confidenceColor(confidence.WS2M)}>Confidence: {confidence.WS2M}</Badge>}
        icon={<Wind className="size-6 text-gray-800 dark:text-white/90" />}
      />

      {/* Wind Direction Tile - Only show if WD2M data is available */}
      {predicted_values.WD2M !== undefined && (
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

      <Item
        title="Relative Humidity"
        value={`${predicted_values.RH2M.toFixed(0)}%`}
        sub={predicted_values.RH2M >= 80 ? "Muggy" : predicted_values.RH2M <= 30 ? "Dry" : "Comfortable"}
        badge={<Badge variant="light" color={confidenceColor(confidence.RH2M)}>Confidence: {confidence.RH2M}</Badge>}
        icon={<Droplets className="size-6 text-gray-800 dark:text-white/90" />}
      />

      <Item
        title="Feeling"
        value={predicted_values.feeling}
        icon={<Gauge className="size-6 text-gray-800 dark:text-white/90" />}
      />

      {/* <Item
        title="Precipitation"
        value={predicted_values.precipitation ? "Yes" : "No"}
        badge={precipitationBadge(predicted_values.precipitation)}
        icon={<CloudRain className="size-6 text-gray-800 dark:text-white/90" />}
      /> */}

      <Item
        title="Air Quality"
        value={`AQI ${predicted_values.air_quality}/10`}
        badge={airQualityBadge(predicted_values.air_quality)}
        icon={<Activity className="size-6 text-gray-800 dark:text-white/90" />}
      />

      {/* -------- Probabilities -------- */}
      <div className="col-span-full">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Probabilities</h3>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ThermometerSun className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0 w-full">
            <span className="text-sm text-gray-500 dark:text-gray-400">Very Hot (&gt;35°C)</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {pct(probabilities.very_hot)}
            </h4>
            <Progress value={probabilities.very_hot} />
          </div>
          <Badge variant="light" color={probabilities.very_hot >= 60 ? "warning" : "info"}>
            Risk
          </Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ThermometerSnowflake className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0 w-full">
            <span className="text-sm text-gray-500 dark:text-gray-400">Very Cold (&lt;-10°C)</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {pct(probabilities.very_cold)}
            </h4>
            <Progress value={probabilities.very_cold} />
          </div>
          <Badge variant="light" color={probabilities.very_cold >= 60 ? "warning" : "info"}>Risk</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Wind className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0 w-full">
            <span className="text-sm text-gray-500 dark:text-gray-400">Very Windy (&gt;10 m/s)</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {pct(probabilities.very_windy)}
            </h4>
            <Progress value={probabilities.very_windy} />
          </div>
          <Badge variant="light" color={probabilities.very_windy >= 60 ? "warning" : "info"}>Risk</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CloudRain className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0 w-full">
            <span className="text-sm text-gray-500 dark:text-gray-400">Very Wet (&gt;10 mm/day)</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {pct(probabilities.very_wet)}
            </h4>
            <Progress value={probabilities.very_wet} />
          </div>
          <Badge variant="light" color={probabilities.very_wet >= 60 ? "warning" : "info"}>Risk</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Droplets className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0 w-full">
            <span className="text-sm text-gray-500 dark:text-gray-400">Very Uncomfortable Humidity (&gt;80%)</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {pct(probabilities.very_uncomfortable)}
            </h4>
            <Progress value={probabilities.very_uncomfortable} />
          </div>
          <Badge variant="light" color={probabilities.very_uncomfortable >= 40 ? "warning" : "info"}>Risk</Badge>
        </div>
      </div>

    </div>
  );
}
