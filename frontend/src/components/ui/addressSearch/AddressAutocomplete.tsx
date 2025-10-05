// app/components/AddressAutocomplete.tsx
"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

type Picked = {
  address?: string;
  lat?: number;
  lng?: number;
};

export default function AddressAutocomplete({
  placeholder = "Start typing the address...",
  onSelect,
  restrictCountries, // e.g. ["ca", "us"]
}: {
  placeholder?: string;
  onSelect?: (p: Picked) => void;
  restrictCountries?: string[]; 
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const initAutocomplete = async () => {
    // Guard for SSR/fast-refresh
    if (!window.google || !inputRef.current || autocompleteRef.current) return;

    // Ensure the Places library is available (new method works fine here)
    // @ts-ignore
    await google.maps.importLibrary("places");

    // Create classic Autocomplete bound to your input
    // @ts-ignore - types for Autocomplete exist, this is just extra-safe
    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"], // or ["address"]
      fields: ["formatted_address", "geometry"], // ask only for what you need
      componentRestrictions: restrictCountries
        ? { country: restrictCountries }
        : undefined,
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const addr = place?.formatted_address;
      const lat = place?.geometry?.location?.lat?.();
      const lng = place?.geometry?.location?.lng?.();
      onSelect?.({ address: addr, lat, lng });
    });

    autocompleteRef.current = ac;
  };

  return (
    <div className="relative">
      {/* Load Maps JS + Places once on the client */}
      <Script
        id="google-maps-places"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`}
        strategy="afterInteractive"
        onLoad={initAutocomplete}
      />

      {/* Your exact input markup */}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
        aria-label="Address"
        autoComplete="off"
      />

      <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        <span>⌘</span>
        <span>K</span>
      </button>
    </div>
  );
}
