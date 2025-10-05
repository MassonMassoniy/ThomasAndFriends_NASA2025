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
import { useEffect, useState } from "react";
import { getWeatherData } from "@/lib/getData";
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

type SP = Record<string, string | string[] | undefined>;
type MaybePromise<T> = T | Promise<T>;


export default async function Ecommerce({searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const sp = await searchParams;
  const latitude = sp.latitude ?? "49.9"
  const longitude = sp.longitude ?? "97.1"
  var date = sp.date ?? "20240606"
  var date1 = "s";
  const temp = ["s", "f"]
  console.log("SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
  console.log(date);
  console.log(date[0]);
  console.log(date[1]);
  if (typeof date == typeof temp) {
    date1 = date + "";
  }
  const data = await getWeatherData(+latitude, +longitude, date);
  console.log(data);
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
