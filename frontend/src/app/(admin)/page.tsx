import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { useWeatherData } from "@/context/WeatherDataContext";
import WeatherMetrics from "@/components/weather/WeatherMetrics";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getWeatherData } from "@/lib/getData";
import type { WeatherData } from "@/lib/getData";
import { WeatherDataProvider } from "@/context/WeatherDataContext";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

const exampleData = {
  probabilities: {
    very_hot: 70.7,
    very_cold: 0.0,
    very_windy: 8.7,
    very_wet: 12.3,
    very_uncomfortable: 5.4,
  },
  predicted_values: {
    T2M: 30.77,
    T2M_MAX: 37.43,
    T2M_MIN: 25.12,
    PRECTOTCORR: 1.83,
    WS2M: 3.2,
    RH2M: 65.0,
    feeling: "Hot",
    precipitation: true,
    air_quality: 7,
  },
  confidence: {
    T2M: "high",
    T2M_MAX: "high",
    PRECTOTCORR: "high",
    WS2M: "high",
    RH2M: "high",
  },
} as const;

  const searchParams = useSearchParams();
  const latitude = searchParams.get("latitude") ?? "49.9"
  const longitude = searchParams.get("latitude") ?? "97.1"
  const date = searchParams.get("date") ?? "20240606"
  const [data, setData] = useState<null | WeatherData>(null);
  useEffect(() => {
    getWeatherData(+latitude, +longitude, date).then(setData).catch(console.error);
  }, []);

export default function Ecommerce() {
  const data = useWeatherData();
  return (
    <div>
      {/* <div className="col-span-11 space-y-6 xl:col-span-9"> */}
        {/* <EcommerceMetrics /> */}
                  <WeatherDataProvider initial={data}>
        <WeatherMetrics data={exampleData}></WeatherMetrics>
        </WeatherDataProvider>
        {/* <MonthlySalesChart /> */}
      {/* </div> */}

      {/* <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div> */}

      {/* <div className="col-span-12">
        <StatisticsChart />
      </div> */}

      {/* <div className="col-span-12 xl:col-span-5">
        <DemographicCard />
      </div> */}

      {/* <div className="col-span-12 xl:col-span-7">
        <RecentOrders />
      </div> */}
    </div>
  );
}
