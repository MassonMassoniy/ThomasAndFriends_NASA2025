"use client"
import { createContext, useContext } from "react";
import type { WeatherData } from "@/lib/getData";

const Ctx = createContext<WeatherData | null>(null);

export function WeatherDataProvider({
  initial,
  children,
}: { initial: WeatherData | null; children: React.ReactNode }) {
  return <Ctx.Provider value={initial}>{children}</Ctx.Provider>;
}

export function useWeatherData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWeatherData must be used under WeatherDataProvider");
  return ctx;
}