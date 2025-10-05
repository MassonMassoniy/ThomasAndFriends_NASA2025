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

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const searchParams = useSearchParams();
  
  // Get search query parameters
  const latitude = searchParams.get('latitude') || undefined;
  const longitude = searchParams.get('longitude') || undefined;
  const searchDate = searchParams.get('date') || undefined;

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
        <AppHeader latitude={latitude} longitude={longitude} searchDate={searchDate} />
        {/* Page Content */}

            <div className="p-4 mx-auto md:p-6">{children}</div>
        
      </div>
    </div>
  );
}
