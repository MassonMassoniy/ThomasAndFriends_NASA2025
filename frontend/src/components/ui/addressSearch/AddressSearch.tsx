"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

type PlaceResult = {
  name?: string;
  formattedAddress?: string;
  lat?: number;
  lng?: number;
};

export default function AddressSearch({
  placeholder = "Search address",
  onSelect,
}: {
  placeholder?: string;
  onSelect?: (place: PlaceResult) => void;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<any>(null); // will hold PlaceAutocompleteElement

  // Initialize after the Google script loads
  const handleScriptLoad = async () => {
    // Guard for SSR and repeat in dev fast-refresh
    if (autocompleteRef.current || !mountRef.current) return;

    // Ensure the Places library is available (new style)
    // @ts-ignore - types lag behind the "importLibrary" API
    await google.maps.importLibrary("places");

    // @ts-ignore - web component constructor
    const el = new google.maps.places.PlaceAutocompleteElement();
    // Basic UI config
    el.setAttribute("placeholder", placeholder);
    el.setAttribute("class", "w-full px-3 py-2 rounded-lg border outline-none");

    // Listen for selection
    el.addEventListener("gmp-select", async (evt: any) => {
      const prediction = evt?.placePrediction;
      if (!prediction) return;

      const place = prediction.toPlace();
      await place.fetchFields({
        // Ask only for what you need
        fields: ["displayName", "formattedAddress", "location"],
      });

      const json = place.toJSON() as any;
      const lat =
        json?.location?.latLng?.lat?.() ??
        json?.location?.latitude ?? // fallback if shape changes
        undefined;
      const lng =
        json?.location?.latLng?.lng?.() ??
        json?.location?.longitude ??
        undefined;

      onSelect?.({
        name: json?.displayName?.text,
        formattedAddress: json?.formattedAddress,
        lat,
        lng,
      });
    });

    // Mount the web component into your search bar container
    mountRef.current.appendChild(el);
    autocompleteRef.current = el;
  };

  return (
    <>
      {/* Load the Maps JS API on the client */}
      <Script
        id="google-maps"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=weekly`} 
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {/* Your styled search bar wrapper */}
      <div className="w-full max-w-xl">
        <label className="mb-1 block text-sm font-medium text-gray-600">
          Address
        </label>

        {/* The autocomplete input will be injected here */}
        <div
          ref={mountRef}
          className="relative"
          // If you use Tailwind, the input styling above is applied to the element itself
        />
      </div>
    </>
  );
}