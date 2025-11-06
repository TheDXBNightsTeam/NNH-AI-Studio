/**
 * Utility functions for converting location coordinates
 * between database format (latitude/longitude) and API format (coordinates: { lat, lng })
 */

/**
 * Convert database latitude/longitude to coordinates object
 * Also checks metadata.latlng as fallback
 */
export function mapLocationCoordinates(location: any): { lat: number; lng: number } | undefined {
  // Priority 1: Direct latitude/longitude fields
  if (location.latitude && location.longitude) {
    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);
    
    // Validate coordinates are within valid ranges
    if (!isNaN(lat) && !isNaN(lng) && 
        lat >= -90 && lat <= 90 && 
        lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Priority 2: Check metadata.latlng
  const metadata = location.metadata || {};
  if (metadata.latlng) {
    const latlng = metadata.latlng;
    if (typeof latlng === 'object' && latlng.latitude && latlng.longitude) {
      const lat = parseFloat(latlng.latitude);
      const lng = parseFloat(latlng.longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && 
          lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    // Also check if latlng is in { lat, lng } format
    if (typeof latlng === 'object' && latlng.lat && latlng.lng) {
      const lat = parseFloat(latlng.lat);
      const lng = parseFloat(latlng.lng);
      
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && 
          lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
  }

  // Priority 3: Check metadata for lat/lng directly
  if (metadata.latitude && metadata.longitude) {
    const lat = parseFloat(metadata.latitude);
    const lng = parseFloat(metadata.longitude);
    
    if (!isNaN(lat) && !isNaN(lng) && 
        lat >= -90 && lat <= 90 && 
        lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // No valid coordinates found
  return undefined;
}

/**
 * Add coordinates field to location object
 * Returns location with coordinates field added/updated
 */
export function addCoordinatesToLocation(location: any): any {
  const coordinates = mapLocationCoordinates(location);
  return {
    ...location,
    coordinates: coordinates || undefined
  };
}

/**
 * Add coordinates to array of locations
 */
export function addCoordinatesToLocations(locations: any[]): any[] {
  return locations.map(addCoordinatesToLocation);
}

