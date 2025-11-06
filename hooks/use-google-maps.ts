'use client';

import { useLoadScript } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

/**
 * Hook to load Google Maps API once and share across all components
 * This prevents the "multiple times" error by using @react-google-maps/api's built-in singleton
 */
export function useGoogleMaps() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  return { isLoaded, loadError };
}
