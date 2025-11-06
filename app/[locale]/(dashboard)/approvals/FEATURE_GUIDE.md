# 🚀 Approvals & Location Creation Center - Feature Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Visual Tour](#visual-tour)
3. [User Flows](#user-flows)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Phase 3 Integration Guide](#phase-3-integration-guide)

---

## 🎯 Overview

This is NNH's **KILLER FEATURE** that replicates the Google My Business location creation and verification experience directly within the platform.

**Current Status**: ✅ Phase 2 Complete (70%) - Full UI/UX with mock data  
**Next Phase**: 🔄 Phase 3 - Google API Integration

---

## 🎨 Visual Tour

### 1️⃣ Main Dashboard View

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✅ Approvals & Location Management              [+ Create Location]│
│  Create new Google Business locations and manage verification       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │  📍 Total    │  │  ⏳ Pending  │  │  ✅ Verified │  │ ❌ Issues││
│  │  Locations   │  │  Verification│  │              │  │          ││
│  │      4       │  │       2      │  │       1      │  │     1    ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  [Create Location] [Pending(2)] [Verified(1)] [Issues(1)]           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    Tab Content Area                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2️⃣ Create Location Wizard - Step Progress

```
Step 1/4          Step 2/4          Step 3/4          Step 4/4
┌───┐ ────── ┌───┐ ────── ┌───┐ ────── ┌───┐
│ ✓ │────────│ 2 │────────│ 3 │────────│ 4 │
└───┘        └───┘        └───┘        └───┘
Basic Info   Category    Features     Review
             & Hours
```

### 3️⃣ Pending Verification Card

```
┌─────────────────────────────────────────────────────────────┐
│  The DXB Night Club - Marina                  [Pending] 🟡  │
│  📍 456 Marina Walk, Dubai                                   │
│  📞 +971 4 YYY YYYY                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📞 Verification via Phone Call                      │   │
│  │  Get an automated phone call with verification code │   │
│  │  ⏱️ Est. Time: Immediate | 📅 Expected: 2025-11-05  │   │
│  └─────────────────────────────────────────────────────┘   │
│  [📝 Enter Verification Code] [🔄 Resend]                   │
└─────────────────────────────────────────────────────────────┘
```

### 4️⃣ Code Entry Interface

```
┌─────────────────────────────────────────────────────────────┐
│  Enter Verification Code                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ]         │   │
│  └─────────────────────────────────────────────────────┘   │
│  [✓ Verify Location]  [Cancel]                              │
└─────────────────────────────────────────────────────────────┘
```

### 5️⃣ Verified Location Card

```
┌─────────────────────────────────────────────────────────────┐
│  The DXB Night Club - Downtown            [✓ Verified] 🟢  │
│  📍 123 Sheikh Zayed Road, Dubai                            │
│  📞 +971 4 XXX XXXX | 🏷️ Night club                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✓ Location Successfully Verified                    │   │
│  │  Verified via POSTCARD on October 20, 2025          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────┐  ┌─────┐  ┌─────┐                                 │
│  │ 👥  │  │ 📊  │  │ ⭐  │                                 │
│  │Active│  │Stats│  │Ready│                                 │
│  └─────┘  └─────┘  └─────┘                                 │
│  [👁️ View on Google] [✏️ Edit Details] [⚙️]               │
└─────────────────────────────────────────────────────────────┘
```

### 6️⃣ Rejected/Issues Card

```
┌─────────────────────────────────────────────────────────────┐
│  Sky Lounge Dubai                         [❌ Rejected] 🔴  │
│  📍 101 Business Bay, Dubai                                 │
│  📞 +971 4 AAA AAAA                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚠️ Verification Failed                              │   │
│  │  Address could not be verified. Please ensure the   │   │
│  │  address matches official records.                   │   │
│  │                                                       │   │
│  │  Common reasons:                                     │   │
│  │  • Address doesn't match official records           │   │
│  │  • Business name is inconsistent                    │   │
│  │  • Phone number is invalid                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  [🔄 Edit & Retry] [📧 Contact Support] [🗑️]              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flows

### Flow 1: Create New Location (Happy Path)

```
User arrives at /approvals
    ↓
Clicks "Create New Location" or "Create Location" tab
    ↓
Step 1: Fills basic information
    - Business name ✓
    - Address ✓
    - Phone ✓
    - Website (optional)
    ↓
Clicks "Next: Category & Hours"
    ↓
Step 2: Selects category and hours
    - Primary category ✓
    - Additional categories (optional)
    - Business hours per day ✓
    ↓
Clicks "Next: Features"
    ↓
Step 3: Selects features
    - Business features (optional)
    - Payment methods (optional)
    ↓
Clicks "Next: Review"
    ↓
Step 4: Reviews all information
    - Sees complete summary
    - Can go back to edit
    ↓
Clicks "Submit to Google"
    ↓
Location created with status: "pending_verification"
    ↓
Redirected to "Pending" tab
    ↓
Location appears in pending list
```

### Flow 2: Verify Location (Happy Path)

```
User navigates to "Pending" tab
    ↓
Sees location awaiting verification
    ↓
Google sends verification (Postcard/Phone/Email)
    ↓
User receives verification code
    ↓
Clicks "Enter Verification Code"
    ↓
Code entry interface appears
    ↓
User types 5-6 digit code
    ↓
Clicks "Verify Location"
    ↓
Location status changes to "verified"
    ↓
Location moves to "Verified" tab
    ↓
Success message shown
```

### Flow 3: Handle Rejection (Error Recovery)

```
Location verification fails
    ↓
Location appears in "Issues" tab
    ↓
User sees error message and reasons
    ↓
Reads suggested actions
    ↓
Clicks "Edit & Retry Verification"
    ↓
Returns to "Pending" tab
    ↓
User can edit details
    ↓
Resubmits for verification
```

---

## 🏗️ Component Architecture

```
page.tsx (Main Container)
├── State Management
│   ├── locations[] (LocationCreationRequest[])
│   ├── activeTab (TabType)
│   └── Handlers
│       ├── handleLocationCreated()
│       ├── handleVerificationComplete()
│       └── handleRetry()
│
├── Header Section
│   ├── Title & Description
│   └── "Create New Location" Button
│
├── Stats Cards (4)
│   ├── Total Locations
│   ├── Pending Verification
│   ├── Verified
│   └── Issues
│
└── Tabs Section
    ├── Tab Navigation
    │   ├── Create Location
    │   ├── Pending (with count badge)
    │   ├── Verified (with count badge)
    │   └── Issues (with count badge)
    │
    └── Tab Content
        ├── CreateLocationTab
        │   └── Wizard
        │       ├── Step1BasicInfo
        │       ├── Step2CategoryHours
        │       ├── Step3Features
        │       └── Step4Review
        │
        ├── PendingVerificationTab
        │   └── Location Cards
        │       ├── Verification Method Info
        │       ├── Code Entry Interface
        │       └── Actions (Enter Code, Resend)
        │
        ├── VerifiedLocationsTab
        │   └── Location Cards
        │       ├── Verification Badge
        │       ├── Quick Stats
        │       └── Actions (View, Edit, Analytics)
        │
        └── IssuesTab
            └── Location Cards
                ├── Error Message
                ├── Suggested Actions
                └── Actions (Retry, Support, Delete)
```

---

## 📦 State Management

### Location State Structure

```typescript
interface LocationCreationRequest {
  // Identity
  id: string                    // Unique identifier
  user_id: string              // Owner ID
  
  // Core Info
  business_name: string
  address: AddressInfo
  phone: string
  website?: string
  
  // Category & Hours
  primary_category: string
  additional_categories: string[]
  business_hours: BusinessHours
  
  // Features
  features: string[]
  payment_methods: string[]
  
  // Status & Verification
  status: 'draft' | 'submitted' | 'pending_verification' | 'verified' | 'rejected'
  google_location_id?: string
  verification: VerificationInfo
  
  // Timestamps
  created_at: string
  updated_at: string
}
```

### State Flow

```
Initial State: mockLocations from mock-locations.ts
    ↓
User actions trigger state updates
    ↓
State changes filtered by status
    ↓
Appropriate tab shows filtered locations
    ↓
Tab count badges updated automatically
```

### Key State Transitions

```
draft → submitted → pending_verification → verified
                                        ↘
                                         rejected → pending_verification (retry)
```

---

## 🔌 Phase 3 Integration Guide

### API Endpoints Needed

#### 1. Create Location
```typescript
POST /api/google/locations/create
Body: {
  business_name: string
  address: Address
  phone: string
  website?: string
  category: string
  hours: BusinessHours
  features: string[]
}
Response: {
  location_id: string
  google_location_id: string
  verification_options: VerificationMethod[]
}
```

#### 2. Request Verification
```typescript
POST /api/google/locations/:id/verify
Body: {
  method: 'POSTCARD' | 'PHONE_CALL' | 'EMAIL'
}
Response: {
  verification_id: string
  estimated_arrival: string
}
```

#### 3. Submit Verification Code
```typescript
POST /api/google/locations/:id/verify/code
Body: {
  code: string
  verification_id: string
}
Response: {
  success: boolean
  status: 'verified' | 'invalid_code' | 'expired'
}
```

#### 4. Get Location Status
```typescript
GET /api/google/locations/:id/status
Response: {
  status: string
  verification_status: string
  google_location_id: string
}
```

### Integration Points in Code

#### File: `CreateLocationTab.tsx`
**Line ~60: handleSubmit()**
```typescript
// Replace mock submission with:
const response = await fetch('/api/google/locations/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
const newLocation = await response.json()
```

#### File: `PendingVerificationTab.tsx`
**Line ~30: handleVerify()**
```typescript
// Replace mock verification with:
const response = await fetch(`/api/google/locations/${locationId}/verify/code`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: verificationCode })
})
const result = await response.json()
```

#### File: `page.tsx`
**Line ~15: useState(mockLocations)**
```typescript
// Replace with API fetch:
const [locations, setLocations] = useState<LocationCreationRequest[]>([])

useEffect(() => {
  fetch('/api/google/locations')
    .then(res => res.json())
    .then(data => setLocations(data))
}, [])
```

### Google Business Profile API References

- **Create Location**: `accounts/{accountId}/locations`
- **Request Verification**: `locations/{locationId}/verifications:start`
- **Complete Verification**: `locations/{locationId}/verifications:complete`
- **Get Verification Options**: `locations/{locationId}/verificationOptions`

### Authentication Flow

```
1. User connects Google Account (OAuth 2.0)
    ↓
2. Backend receives access token & refresh token
    ↓
3. Store tokens securely (Supabase)
    ↓
4. Use tokens for Google Business Profile API calls
    ↓
5. Handle token refresh automatically
```

### Error Handling

```typescript
// Example error handling for API calls
try {
  const response = await fetch('/api/google/locations/create', config)
  if (!response.ok) {
    const error = await response.json()
    handleError(error.code, error.message)
  }
} catch (error) {
  // Network error
  showNotification('Network error. Please try again.')
}
```

### Rate Limiting Considerations

- Google Business Profile API: 10,000 requests/day
- Verification requests: Limited per location
- Implement exponential backoff for retries
- Cache location data to reduce API calls

---

## 🎯 Testing Checklist

### Phase 2 (Current - Mock Data)
- [x] Create location wizard (4 steps)
- [x] Form validation (Step 1)
- [x] Category & hours selection (Step 2)
- [x] Features selection (Step 3)
- [x] Review & submit (Step 4)
- [x] Mock submission creates new location
- [x] Pending tab shows locations
- [x] Code entry interface
- [x] Mock verification completes
- [x] Verified tab shows verified locations
- [x] Issues tab shows rejected locations
- [x] Tab navigation
- [x] Count badges update
- [x] Responsive design
- [x] State management

### Phase 3 (Future - Real API)
- [ ] Google OAuth connection
- [ ] Real location creation
- [ ] Actual verification request
- [ ] Real code validation
- [ ] Status sync with Google
- [ ] Error handling from API
- [ ] Rate limiting
- [ ] Token refresh
- [ ] Webhook notifications
- [ ] Bulk operations

---

## 📊 Success Metrics

### User Experience
- ⏱️ Average time to create location: Target < 3 minutes
- ✅ Form completion rate: Target > 80%
- 🔄 Error recovery rate: Target > 70%

### Technical Performance
- 🚀 Page load time: < 2 seconds
- 💾 State updates: Instant
- 📱 Mobile responsive: 100%

### Business Impact
- 📈 Locations created per user: Tracking
- ✓ Verification completion rate: Target > 85%
- 😊 User satisfaction: Target > 4.5/5

---

## 🚀 Quick Start for Developers

### 1. View the Feature
```bash
cd /Users/nnh-ai-studio/.cursor/worktrees/NNH-AI-Studio/AN1IZ
npm run dev
# Navigate to: http://localhost:3000/en/approvals
```

### 2. Edit Components
```bash
# Main page
app/[locale]/(dashboard)/approvals/page.tsx

# Wizard steps
app/[locale]/(dashboard)/approvals/components/wizard/

# Tab components
app/[locale]/(dashboard)/approvals/components/
```

### 3. Update Mock Data
```bash
lib/data/mock-locations.ts
```

### 4. Modify Types
```bash
lib/types/location-creation.ts
```

---

## 📞 Support & Resources

- **Documentation**: `/approvals/README.md`
- **Types Reference**: `/lib/types/location-creation.ts`
- **Mock Data**: `/lib/data/mock-locations.ts`
- **Google API Docs**: https://developers.google.com/my-business

---

**Built with ❤️ for NNH AI Studio**  
**Version**: 2.0.0  
**Phase**: 2 Complete (70%)  
**Last Updated**: November 6, 2025

🎉 **Feature Complete - Ready for Phase 3 Integration!**

