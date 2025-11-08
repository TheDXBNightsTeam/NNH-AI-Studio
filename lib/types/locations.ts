/Users/nnh-ai-studio/Documents/NNH-AI-Studio/lib/types/locations.ts
/**
 * @file locations.ts
 * Centralized TypeScript interfaces for all Location-related data structures.
 * Used by dashboard, server actions, and API endpoints.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationCategory {
  id: string;
  name: string;
  type?: string;
}

export interface LocationStats {
  views: number;
  clicks: number;
  calls: number;
  directionRequests: number;
  websiteVisits: number;
  photoViews: number;
  postViews: number;
  lastUpdated: string;
}

export interface LocationSyncStatus {
  lastSync: string | null;
  isActive: boolean;
  isDisconnected: boolean;
  lastSyncDurationMs?: number;
  lastSyncMessage?: string;
}

export interface GMBAttributes {
  acceptsAppointments?: boolean;
  outdoorSeating?: boolean;
  wheelchairAccessible?: boolean;
  kidFriendly?: boolean;
  paymentOptions?: string[];
  parkingAvailable?: boolean;
  wifiAvailable?: boolean;
}

export interface Location {
  id: string;
  user_id?: string;
  gmb_account_id?: string;
  google_location_id?: string;
  name: string;
  address: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  website?: string;
  email?: string;
  category?: LocationCategory;
  coordinates?: Coordinates;
  status?: string;
  rating?: number;
  reviewCount?: number;
  healthScore?: number;
  attributes?: GMBAttributes;
  photos?: string[];
  insights?: LocationStats;
  syncStatus?: LocationSyncStatus;
  created_at?: string;
  updated_at?: string;
  disconnected_at?: string | null;
}

export interface LocationUpdatePayload {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  categoryId?: string;
  attributes?: GMBAttributes;
  coordinates?: Coordinates;
}

export interface LocationActionLog {
  id?: string;
  action: string;
  status: string;
  details?: string;
  timestamp: string;
  durationMs?: number;
}

export type LocationQuickFilter =
  | 'all'
  | 'active'
  | 'disconnected'
  | 'needs_attention'
  | 'high_performance'
  | 'low_health';

export interface LocationAnalyticsSummary {
  totalLocations: number;
  activeLocations: number;
  disconnectedLocations: number;
  avgRating: number;
  totalReviews: number;
  totalViews: number;
  totalClicks: number;
  period: string;
}
