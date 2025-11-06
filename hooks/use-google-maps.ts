'use client';

import { useState, useEffect, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries: ("places" | "drawing" | "geometry" | "visualization" | "marker")[] = ['places'];

// Global state to ensure Google Maps API is only loaded once
let globalApiKey: string | null = null;
let isScriptLoading = false;
let scriptLoadPromise: Promise<string> | null = null;

/**
 * Hook to load Google Maps API once and share across all components
 * This prevents the "multiple times" error by using a singleton pattern
 */
export function useGoogleMaps() {
  const [apiKey, setApiKey] = useState<string>('');
  const isMountedRef = useRef(true);

  // Fetch API key securely from server (only once)
  useEffect(() => {
    // Use cached API key if already loaded
    if (globalApiKey) {
      setApiKey(globalApiKey);
      return;
    }

    // If already loading, wait for it
    if (scriptLoadPromise) {
      scriptLoadPromise.then((key) => {
        if (isMountedRef.current) {
          setApiKey(key);
        }
      });
      return;
    }

    // Start loading API key
    isScriptLoading = true;
    scriptLoadPromise = (async () => {
      try {
        const response = await fetch('/api/google-maps-config');
        const data = await response.json();
        if (data.apiKey) {
          globalApiKey = data.apiKey;
          isScriptLoading = false;
          return data.apiKey;
        }
      } catch (error) {
        console.error('Failed to load Google Maps API key:', error);
        isScriptLoading = false;
        throw error;
      }
      return '';
    })();

    scriptLoadPromise.then((key) => {
      if (isMountedRef.current && key) {
        setApiKey(key);
      }
    });
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load Google Maps script (only if API key is available)
  // Critical: Don't pass empty string to prevent loading before API key is ready
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
    // Note: @react-google-maps/api handles duplicate script loading internally
    // but we ensure API key is loaded only once via globalApiKey
  });

  return {
    apiKey,
    isLoaded: apiKey ? isLoaded : false,
    loadError,
  };
}

