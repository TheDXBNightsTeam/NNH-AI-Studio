# White-Label Branding - Developer Guide

## Architecture Overview

The white-label branding feature is built with a layered architecture that separates concerns and ensures maintainability.

### Component Layers

```
┌─────────────────────────────────────────────┐
│         User Interface Layer                 │
│  - BrandingTab Component                     │
│  - Settings Page                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       Context & State Management             │
│  - BrandProfileContext                       │
│  - useBrandProfile() Hook                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Theme Provider Layer                │
│  - DynamicThemeProvider                      │
│  - CSS Variables Management                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Presentation Layer                   │
│  - Sidebar                                   │
│  - DashboardBanner                           │
│  - UI Components                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│          Data Layer                          │
│  - Supabase Database (client_profiles)      │
│  - Supabase Storage (branding_assets)       │
└─────────────────────────────────────────────┘
```

## Database Schema

### Table: `client_profiles`

```sql
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  primary_color TEXT DEFAULT '#FFA500',
  secondary_color TEXT DEFAULT '#1A1A1A',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can read own profile" ON client_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON client_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON client_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### Storage: `branding_assets`

```sql
-- Storage bucket for branding images
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding_assets', 'branding_assets', true);

-- RLS Policies for storage
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own branding assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding_assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own assets
CREATE POLICY "Users can update own branding assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding_assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own assets
CREATE POLICY "Users can delete own branding assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding_assets'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to branding assets
CREATE POLICY "Public read access to branding assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'branding_assets');
```

## TypeScript Types

### ClientProfile Interface

```typescript
// lib/types/database.ts
export interface ClientProfile {
  id: string;
  user_id: string;
  brand_name?: string;
  logo_url?: string;
  cover_image_url?: string;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}
```

## React Context Implementation

### BrandProfileContext

Location: `contexts/BrandProfileContext.tsx`

```typescript
interface BrandProfileContextType {
  profile: ClientProfile | null;
  loading: boolean;
  refetchProfile: () => Promise<void>;
}
```

**Features**:
- Fetches profile on mount
- Provides loading state
- Exposes refetch function for manual updates
- Handles errors gracefully
- Returns null when no profile exists

**Usage**:
```typescript
import { useBrandProfile } from '@/contexts/BrandProfileContext';

function MyComponent() {
  const { profile, loading, refetchProfile } = useBrandProfile();
  
  if (loading) return <Loader />;
  if (!profile) return <DefaultBranding />;
  
  return <CustomBranding logo={profile.logo_url} />;
}
```

## Theme Provider

### DynamicThemeProvider

Location: `components/theme/DynamicThemeProvider.tsx`

**Responsibilities**:
1. Listen for brand profile updates
2. Convert hex colors to RGB format
3. Set CSS variables on document root
4. Provide fallback colors

**CSS Variables Set**:
- `--brand-primary`: Hex color value
- `--brand-secondary`: Hex color value
- `--brand-primary-rgb`: RGB values (r g b)
- `--brand-secondary-rgb`: RGB values (r g b)

**Event System**:
```typescript
// Trigger a brand profile update
window.dispatchEvent(new Event('brand-profile-updated'));

// The provider listens and refetches automatically
```

## Components

### BrandingTab Component

Location: `components/settings/branding-tab.tsx`

**Features**:
- Form state management with useState
- Image upload with validation
- Color pickers (native HTML5 + text input)
- Save functionality with loading states
- Toast notifications for success/error
- Preview of uploaded images

**Key Functions**:

```typescript
// Upload file to Supabase Storage
const uploadFile = async (file: File, type: 'logo' | 'cover'): Promise<string>

// Handle logo upload
const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>)

// Handle cover upload
const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>)

// Save all branding changes
const handleSave = async ()
```

**Validation Rules**:
- Logo: Max 2MB, image/* types
- Cover: Max 5MB, image/* types
- Colors: Hex format validation

### DashboardBanner Component

Location: `components/dashboard/dashboard-banner.tsx`

**Features**:
- Only renders when cover image exists
- Uses Next.js Image for optimization
- Gradient overlay for text readability
- Responsive height adjustment
- Priority loading for above-the-fold content

```typescript
export function DashboardBanner() {
  const { profile } = useBrandProfile();
  
  if (!profile?.cover_image_url) {
    return null; // Hidden when no cover image
  }
  
  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6">
      <Image
        src={profile.cover_image_url}
        alt="Dashboard Banner"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
}
```

### Sidebar Integration

Location: `components/layout/sidebar.tsx`

**Branding Integration**:
```typescript
const { profile: brandProfile } = useBrandProfile();

// Logo display
{brandProfile?.logo_url ? (
  <Image
    src={brandProfile.logo_url}
    alt="Brand Logo"
    fill
    className="object-contain"
  />
) : (
  <DefaultLogoIcon />
)}

// Brand name display
<span className="text-lg font-bold">
  {brandProfile?.brand_name || 'NNH AI Studio'}
</span>
```

## CSS Utilities

### Brand Color Classes

Location: `app/globals.css`

```css
/* Utility classes for direct brand color usage */
.bg-brand-primary {
  background-color: var(--brand-primary) !important;
}

.text-brand-primary {
  color: var(--brand-primary) !important;
}

.border-brand-primary {
  border-color: var(--brand-primary) !important;
}

.bg-brand-secondary {
  background-color: var(--brand-secondary) !important;
}

.text-brand-secondary {
  color: var(--brand-secondary) !important;
}

.border-brand-secondary {
  border-color: var(--brand-secondary) !important;
}
```

**Usage in Components**:
```tsx
<Button className="bg-brand-primary text-white">
  Click Me
</Button>

<div className="border-brand-primary border-2">
  Branded border
</div>
```

## API Integration

### File Upload Flow

```typescript
// 1. User selects file
const file = e.target.files?.[0];

// 2. Validate file
if (!file.type.startsWith('image/')) {
  toast.error('Please upload an image file');
  return;
}

// 3. Upload to Supabase Storage
const { data: { user } } = await supabase.auth.getUser();
const filePath = `${user.id}/logo.png`;

await supabase.storage
  .from('branding_assets')
  .upload(filePath, file, { upsert: true });

// 4. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('branding_assets')
  .getPublicUrl(filePath);

// 5. Update state
setLogoUrl(publicUrl);
```

### Save Profile Flow

```typescript
// 1. Get authenticated user
const { data: { user } } = await supabase.auth.getUser();

// 2. Prepare data
const profileData = {
  user_id: user.id,
  brand_name: brandName,
  logo_url: logoUrl,
  cover_image_url: coverImageUrl,
  primary_color: primaryColor,
  secondary_color: secondaryColor,
};

// 3. Upsert to database (insert or update)
await supabase
  .from('client_profiles')
  .upsert(profileData)
  .eq('user_id', user.id);

// 4. Trigger UI update
window.dispatchEvent(new Event('brand-profile-updated'));
```

## Integration Guide

### Adding Branding to a New Component

```typescript
// 1. Import the hook
import { useBrandProfile } from '@/contexts/BrandProfileContext';

// 2. Use the hook in your component
function MyNewComponent() {
  const { profile, loading } = useBrandProfile();
  
  // 3. Handle loading state
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // 4. Use branding data
  return (
    <div>
      {profile?.logo_url && (
        <img src={profile.logo_url} alt="Logo" />
      )}
      <h1>{profile?.brand_name || 'Default Name'}</h1>
      <Button style={{ backgroundColor: profile?.primary_color }}>
        Branded Button
      </Button>
    </div>
  );
}
```

### Using CSS Variables

```tsx
// Method 1: Inline styles
<div style={{ color: 'var(--brand-primary)' }}>
  Branded text
</div>

// Method 2: Utility classes
<div className="text-brand-primary">
  Branded text
</div>

// Method 3: Tailwind with CSS variables
<div className="bg-[var(--brand-primary)]">
  Branded background
</div>
```

## Testing

### Manual Testing Checklist

- [ ] Navigate to Settings → Branding
- [ ] Upload a logo (< 2MB)
- [ ] Upload a cover image (< 5MB)
- [ ] Enter brand name
- [ ] Select primary color
- [ ] Select secondary color
- [ ] Click Save Changes
- [ ] Verify success toast appears
- [ ] Navigate to dashboard
- [ ] Verify logo in sidebar
- [ ] Verify brand name in sidebar
- [ ] Verify cover image on dashboard
- [ ] Verify button colors reflect primary color
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test on desktop

### Edge Cases to Test

1. **No branding set**: Should show defaults
2. **Logo only**: Other fields should have defaults
3. **Very large images**: Should reject with error
4. **Invalid file types**: Should reject with error
5. **Network errors**: Should show error toast
6. **Multiple rapid saves**: Should handle gracefully
7. **Browser refresh**: Should persist branding

## Performance Considerations

### Image Optimization

- **Lazy Loading**: Images load on-demand
- **Next.js Image**: Automatic optimization
- **Size Limits**: Enforced to prevent large files
- **Caching**: Supabase Storage provides CDN caching

### Context Optimization

- **Single Fetch**: Profile fetched once on mount
- **Memoization**: Context value memoized
- **Selective Updates**: Only re-renders when profile changes
- **Event-based**: Updates triggered only when needed

### CSS Variables

- **Performance**: CSS variables are highly performant
- **No Re-renders**: Changing CSS variables doesn't trigger React re-renders
- **Real-time**: Changes apply immediately without reflow

## Security Considerations

### File Upload Security

- **Validation**: File type and size checked client-side
- **Server Validation**: Supabase validates files server-side
- **Storage Policies**: RLS ensures users can only access their own files
- **Isolation**: Files stored in user-specific folders

### Data Security

- **RLS Enabled**: Row-level security on client_profiles table
- **User Isolation**: Users can only access their own profile
- **SQL Injection**: Prevented by Supabase parameterized queries
- **XSS Protection**: React escapes all user input by default

### Authentication

- **Required**: All branding operations require authentication
- **Session-based**: Uses Supabase session management
- **Token Refresh**: Automatic token refresh handled by Supabase

## Troubleshooting

### Common Issues

**Issue**: Branding not updating after save  
**Solution**: Check browser console for errors, verify network request succeeded

**Issue**: Images not loading  
**Solution**: Check Supabase Storage bucket permissions, verify public access

**Issue**: Colors not applying  
**Solution**: Check CSS variable names, ensure DynamicThemeProvider is mounted

**Issue**: Context error "useBrandProfile must be used within BrandProfileProvider"  
**Solution**: Ensure component is wrapped in BrandProfileProvider

## Future Enhancements

Potential features for future releases:

1. **Font Customization**: Allow custom fonts
2. **Multiple Themes**: Light/dark theme with brand colors
3. **Favicon Upload**: Custom favicon
4. **Email Templates**: Branded email templates
5. **PDF Reports**: Branded PDF exports
6. **Login Page**: Branding on login/signup pages
7. **Custom Domain**: Support for custom domains
8. **Branding Presets**: Pre-defined color schemes
9. **A/B Testing**: Test different branding variations
10. **Analytics**: Track branding impact on engagement

## Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [React Context API](https://react.dev/reference/react/useContext)

---

**Last Updated**: November 2025  
**Version**: 1.0.0
