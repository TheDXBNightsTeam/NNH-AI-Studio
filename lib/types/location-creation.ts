/**
 * Location Creation & Verification Types
 * For Google Business Profile location management
 */

export interface LocationCreationRequest {
  id: string
  user_id: string
  
  // Basic Info
  business_name: string
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  phone: string
  website?: string
  
  // Category & Hours
  primary_category: string
  additional_categories: string[]
  business_hours: {
    [key: string]: { open: string; close: string; closed: boolean }
  }
  
  // Features
  features: string[]
  payment_methods: string[]
  
  // Status
  status: 'draft' | 'submitted' | 'pending_verification' | 'verified' | 'rejected'
  google_location_id?: string
  
  // Verification
  verification: {
    method?: 'POSTCARD' | 'PHONE_CALL' | 'EMAIL' | 'INSTANT'
    verification_id?: string
    requested_at?: string
    expected_date?: string
    code?: string
    completed_at?: string
    error_message?: string
  }
  
  created_at: string
  updated_at: string
}

export interface VerificationMethod {
  id: 'POSTCARD' | 'PHONE_CALL' | 'EMAIL' | 'INSTANT'
  name: string
  icon: string
  description: string
  estimatedTime: string
  available: boolean
  details?: string
}

export const VERIFICATION_METHODS: VerificationMethod[] = [
  {
    id: 'POSTCARD',
    name: 'Postcard',
    icon: '📬',
    description: 'Google will mail a postcard with a 5-digit code to your business address',
    estimatedTime: '5-14 days',
    available: true,
    details: 'Most reliable method. Code will be printed on a postcard sent to your business address.'
  },
  {
    id: 'PHONE_CALL',
    name: 'Phone Call',
    icon: '📞',
    description: 'Get an automated phone call with a verification code',
    estimatedTime: 'Immediate',
    available: true,
    details: 'Automated call to your business phone number with a 6-digit code.'
  },
  {
    id: 'EMAIL',
    name: 'Email',
    icon: '📧',
    description: 'Receive verification code via email',
    estimatedTime: 'Few minutes',
    available: false,
    details: 'Only available for certain business categories and regions.'
  },
  {
    id: 'INSTANT',
    name: 'Instant Verification',
    icon: '⚡',
    description: 'Verify instantly if you have access to existing listing',
    estimatedTime: 'Immediate',
    available: false,
    details: 'Available if you already have access to this location through another method.'
  }
]

export const BUSINESS_CATEGORIES = [
  'Night club',
  'Bar',
  'Restaurant',
  'Cafe',
  'Live music venue',
  'Dance club',
  'Lounge',
  'Hotel',
  'Event venue',
  'Entertainment venue'
]

export const FEATURES = [
  { id: 'wifi_free', label: 'Free Wi-Fi', icon: '📶' },
  { id: 'parking', label: 'Parking available', icon: '🅿️' },
  { id: 'wheelchair_accessible', label: 'Wheelchair accessible', icon: '♿' },
  { id: 'outdoor_seating', label: 'Outdoor seating', icon: '🌳' },
  { id: 'live_music', label: 'Live music', icon: '🎵' },
  { id: 'valet_parking', label: 'Valet parking', icon: '🚗' },
  { id: 'reservations', label: 'Accepts reservations', icon: '📅' },
  { id: 'private_events', label: 'Private events', icon: '🎉' },
  { id: 'coat_check', label: 'Coat check', icon: '🧥' },
  { id: 'table_service', label: 'Table service', icon: '🍾' }
]

export const PAYMENT_METHODS = [
  { id: 'credit_cards', label: 'Credit cards', icon: '💳' },
  { id: 'debit_cards', label: 'Debit cards', icon: '💳' },
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'mobile_payment', label: 'Mobile payment', icon: '📱' },
  { id: 'contactless', label: 'Contactless', icon: '📲' }
]

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday', 
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]

