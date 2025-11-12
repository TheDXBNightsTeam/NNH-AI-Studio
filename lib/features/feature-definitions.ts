import type { FeatureCategoryKey } from '@/types/features';

export interface FeatureDefinition {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly icon: string;
  readonly commonPercentage: number;
  readonly importance: number;
}

export type FeatureCatalog = Record<FeatureCategoryKey, readonly FeatureDefinition[]>;

export const FEATURE_CATALOG: FeatureCatalog = {
  amenities: [
    { id: '1', key: 'wifi_free', name: 'Free WiFi', icon: '📶', commonPercentage: 85, importance: 9 },
    { id: '2', key: 'wheelchair_accessible', name: 'Wheelchair Accessible', icon: '♿', commonPercentage: 72, importance: 8 },
    { id: '3', key: 'parking', name: 'Parking Available', icon: '🅿️', commonPercentage: 78, importance: 8 },
    { id: '4', key: 'valet_parking', name: 'Valet Parking', icon: '🚗', commonPercentage: 45, importance: 6 },
    { id: '5', key: 'outdoor_seating', name: 'Outdoor Seating', icon: '🌳', commonPercentage: 68, importance: 7 },
    { id: '6', key: 'restroom', name: 'Restroom', icon: '🚻', commonPercentage: 95, importance: 9 },
    { id: '7', key: 'air_conditioning', name: 'Air Conditioning', icon: '❄️', commonPercentage: 90, importance: 8 },
    { id: '8', key: 'coat_check', name: 'Coat Check', icon: '🧥', commonPercentage: 35, importance: 5 },
  ],
  payment_methods: [
    { id: '9', key: 'credit_cards', name: 'Credit Cards', icon: '💳', commonPercentage: 95, importance: 10 },
    { id: '10', key: 'debit_cards', name: 'Debit Cards', icon: '💳', commonPercentage: 92, importance: 9 },
    { id: '11', key: 'cash', name: 'Cash', icon: '💵', commonPercentage: 88, importance: 8 },
    { id: '12', key: 'mobile_payment', name: 'Mobile Payments', icon: '📱', commonPercentage: 75, importance: 8 },
    { id: '13', key: 'contactless', name: 'Contactless', icon: '📲', commonPercentage: 70, importance: 7 },
    { id: '14', key: 'cryptocurrency', name: 'Cryptocurrency', icon: '₿', commonPercentage: 5, importance: 3 },
  ],
  services: [
    { id: '15', key: 'dine_in', name: 'Dine-in', icon: '🍽️', commonPercentage: 90, importance: 10 },
    { id: '16', key: 'takeout', name: 'Takeout', icon: '🥡', commonPercentage: 85, importance: 9 },
    { id: '17', key: 'delivery', name: 'Delivery', icon: '🚴', commonPercentage: 65, importance: 7 },
    { id: '18', key: 'reservations', name: 'Reservations', icon: '📅', commonPercentage: 75, importance: 8 },
    { id: '19', key: 'online_ordering', name: 'Online Ordering', icon: '💻', commonPercentage: 60, importance: 7 },
    { id: '20', key: 'catering', name: 'Catering', icon: '🍱', commonPercentage: 40, importance: 6 },
  ],
  atmosphere: [
    { id: '21', key: 'family_friendly', name: 'Family Friendly', icon: '👨‍👩‍👧', commonPercentage: 70, importance: 7 },
    { id: '22', key: 'groups', name: 'Good for Groups', icon: '👥', commonPercentage: 80, importance: 8 },
    { id: '23', key: 'romantic', name: 'Romantic', icon: '💑', commonPercentage: 45, importance: 5 },
    { id: '24', key: 'live_music', name: 'Live Music', icon: '🎵', commonPercentage: 55, importance: 7 },
    { id: '25', key: 'dj', name: 'DJ', icon: '🎧', commonPercentage: 50, importance: 7 },
    { id: '26', key: 'dancing', name: 'Dancing', icon: '💃', commonPercentage: 45, importance: 6 },
    { id: '27', key: 'casual', name: 'Casual', icon: '👕', commonPercentage: 85, importance: 6 },
    { id: '28', key: 'upscale', name: 'Upscale', icon: '🎩', commonPercentage: 40, importance: 6 },
  ],
};

export const ALL_FEATURE_KEYS = new Set(
  Object.values(FEATURE_CATALOG).flatMap((definitions) => definitions.map((item) => item.key))
);
