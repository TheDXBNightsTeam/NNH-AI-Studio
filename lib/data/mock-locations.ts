/**
 * Mock data for location creation and verification
 * Phase 2: UI/UX with mock data
 * Phase 3: Replace with real Google API
 */

import { LocationCreationRequest } from '@/lib/types/location-creation'

export const mockLocations: LocationCreationRequest[] = [
  {
    id: '1',
    user_id: 'user123',
    business_name: 'The DXB Night Club - Downtown',
    address: {
      street: '123 Sheikh Zayed Road',
      city: 'Dubai',
      state: 'Dubai',
      postal_code: '00000',
      country: 'AE'
    },
    phone: '+971 4 XXX XXXX',
    website: 'https://dxbnightclub.com',
    primary_category: 'Night club',
    additional_categories: ['Bar', 'Live music venue'],
    business_hours: {
      monday: { open: '', close: '', closed: true },
      tuesday: { open: '', close: '', closed: true },
      wednesday: { open: '', close: '', closed: true },
      thursday: { open: '22:00', close: '04:00', closed: false },
      friday: { open: '22:00', close: '04:00', closed: false },
      saturday: { open: '22:00', close: '04:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    features: ['wifi_free', 'parking', 'wheelchair_accessible', 'live_music', 'valet_parking'],
    payment_methods: ['credit_cards', 'debit_cards', 'cash', 'mobile_payment'],
    status: 'verified',
    google_location_id: 'ChIJ123abc',
    verification: {
      method: 'POSTCARD',
      verification_id: 'verify123',
      requested_at: '2025-10-15T10:00:00Z',
      code: '12345',
      completed_at: '2025-10-20T15:30:00Z'
    },
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-10-20T15:30:00Z'
  },
  {
    id: '2',
    user_id: 'user123',
    business_name: 'The DXB Night Club - Marina',
    address: {
      street: '456 Marina Walk',
      city: 'Dubai',
      state: 'Dubai',
      postal_code: '00000',
      country: 'AE'
    },
    phone: '+971 4 YYY YYYY',
    website: 'https://dxbnightclub.com/marina',
    primary_category: 'Night club',
    additional_categories: ['Bar', 'Dance club'],
    business_hours: {
      monday: { open: '', close: '', closed: true },
      tuesday: { open: '', close: '', closed: true },
      wednesday: { open: '', close: '', closed: true },
      thursday: { open: '22:00', close: '04:00', closed: false },
      friday: { open: '22:00', close: '04:00', closed: false },
      saturday: { open: '22:00', close: '04:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    features: ['wifi_free', 'outdoor_seating', 'live_music', 'reservations'],
    payment_methods: ['credit_cards', 'mobile_payment', 'contactless'],
    status: 'pending_verification',
    google_location_id: 'ChIJ456def',
    verification: {
      method: 'PHONE_CALL',
      verification_id: 'verify456',
      requested_at: '2025-11-05T14:00:00Z',
      expected_date: '2025-11-05'
    },
    created_at: '2025-11-05T14:00:00Z',
    updated_at: '2025-11-05T14:00:00Z'
  },
  {
    id: '3',
    user_id: 'user123',
    business_name: 'The DXB Night Club - JBR',
    address: {
      street: '789 The Walk, Jumeirah Beach Residence',
      city: 'Dubai',
      state: 'Dubai',
      postal_code: '00000',
      country: 'AE'
    },
    phone: '+971 4 ZZZ ZZZZ',
    primary_category: 'Night club',
    additional_categories: [],
    business_hours: {
      monday: { open: '', close: '', closed: true },
      tuesday: { open: '', close: '', closed: true },
      wednesday: { open: '', close: '', closed: true },
      thursday: { open: '22:00', close: '04:00', closed: false },
      friday: { open: '22:00', close: '04:00', closed: false },
      saturday: { open: '22:00', close: '04:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    },
    features: ['parking', 'wheelchair_accessible'],
    payment_methods: ['credit_cards', 'cash'],
    status: 'pending_verification',
    google_location_id: 'ChIJ789ghi',
    verification: {
      method: 'POSTCARD',
      verification_id: 'verify789',
      requested_at: '2025-11-06T09:00:00Z',
      expected_date: '2025-11-15 - 2025-11-20'
    },
    created_at: '2025-11-06T09:00:00Z',
    updated_at: '2025-11-06T09:00:00Z'
  },
  {
    id: '4',
    user_id: 'user123',
    business_name: 'Sky Lounge Dubai',
    address: {
      street: '101 Business Bay',
      city: 'Dubai',
      state: 'Dubai',
      postal_code: '00000',
      country: 'AE'
    },
    phone: '+971 4 AAA AAAA',
    website: 'https://skylounge.ae',
    primary_category: 'Lounge',
    additional_categories: ['Bar', 'Restaurant'],
    business_hours: {
      monday: { open: '18:00', close: '02:00', closed: false },
      tuesday: { open: '18:00', close: '02:00', closed: false },
      wednesday: { open: '18:00', close: '02:00', closed: false },
      thursday: { open: '18:00', close: '03:00', closed: false },
      friday: { open: '18:00', close: '03:00', closed: false },
      saturday: { open: '18:00', close: '03:00', closed: false },
      sunday: { open: '18:00', close: '01:00', closed: false }
    },
    features: ['wifi_free', 'outdoor_seating', 'valet_parking', 'reservations'],
    payment_methods: ['credit_cards', 'debit_cards', 'mobile_payment'],
    status: 'rejected',
    verification: {
      method: 'POSTCARD',
      verification_id: 'verify111',
      requested_at: '2025-10-25T12:00:00Z',
      error_message: 'Address could not be verified. Please ensure the address matches official records.'
    },
    created_at: '2025-10-25T12:00:00Z',
    updated_at: '2025-10-26T08:00:00Z'
  }
]

