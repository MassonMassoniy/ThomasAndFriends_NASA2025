"use client";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import Backdrop from "@/layout/Backdrop";
import React from "react";
import { getWeatherData } from '@/lib/getData';
import { WeatherDataProvider } from '@/context/WeatherDataContext';
import { useEffect, useState } from "react";
import type { WeatherData } from "@/lib/getData";
import { useSearchParams } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const latitude = searchParams.get("latitude") ?? "49.9"
  const longitude = searchParams.get("latitude") ?? "97.1"
  const date = searchParams.get("date") ?? "20240606"
  const [data, setData] = useState<null | WeatherData>(null);
  useEffect(() => {
    getWeatherData(+latitude, +longitude, date).then(setData).catch(console.error);
  }, []);
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = "ml-0";
  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
          <WeatherDataProvider initial={data}>
            <div className="p-4 mx-auto md:p-6">{children}</div>
          </WeatherDataProvider>
        
      </div>
    </div>
  );
}
