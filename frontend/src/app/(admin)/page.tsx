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
    WD2M: -100,
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

export default function Ecommerce() {
  //const data = useWeatherData();
  return (
    <div>
      {/* <div className="col-span-11 space-y-6 xl:col-span-9"> */}
        {/* <EcommerceMetrics /> */}
        <WeatherMetrics data={exampleData}></WeatherMetrics>
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
