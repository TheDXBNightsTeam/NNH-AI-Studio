/**
 * Google Maps Dark Theme Styles
 * Used for consistent dark map styling across the application
 */

export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#b3d4f8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b3961' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#445b8a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ color: '#28385e' }] },
];

/**
 * Get custom marker icon configuration
 * @param isSelected - Whether the marker is currently selected
 * @returns Marker icon configuration
 */
export function getMarkerIcon(isSelected: boolean = false): google.maps.Icon | google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: isSelected ? 18 : 15,
    fillColor: isSelected ? '#ff6b35' : '#ff8c42',
    fillOpacity: isSelected ? 1 : 0.8,
    strokeWeight: isSelected ? 4 : 3,
    strokeColor: '#ffffff',
  };
}

/**
 * Get map container style
 */
export const MAP_CONTAINER_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '600px',
};

/**
 * Default map options
 */
export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  styles: DARK_MAP_STYLES,
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'cooperative',
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

