# White-Label Branding - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### For End Users

#### Step 1: Apply Database Migrations
If you're running the application for the first time with this feature:

```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Manual SQL execution in Supabase Dashboard
# Run these files in order:
# 1. supabase/migrations/20251110_create_client_profiles.sql
# 2. supabase/migrations/20251110_create_branding_storage.sql
```

#### Step 2: Access Branding Settings
1. Log into your dashboard
2. Navigate to **Settings** (gear icon in sidebar)
3. Click the **Branding** tab

#### Step 3: Upload Your Brand Assets

**Logo:**
1. Click "Upload Logo" button
2. Select your logo file (PNG, JPG, or SVG)
3. Max size: 2MB
4. Best practice: Use a square image (e.g., 512x512px)

**Cover Image:**
1. Click "Upload Cover" button  
2. Select your cover image (PNG or JPG)
3. Max size: 5MB
4. Best practice: Use 16:9 ratio (e.g., 1920x1080px)

#### Step 4: Set Your Colors

**Primary Color:**
- Click the color picker
- Choose your brand's primary color
- Or enter a hex code (e.g., #FF6B00)

**Secondary Color:**
- Click the color picker
- Choose your brand's secondary/accent color
- Or enter a hex code (e.g., #1A1A1A)

#### Step 5: Set Brand Name
- Enter your company/brand name
- This will replace "NNH AI Studio" throughout the platform

#### Step 6: Save
1. Click "Save Changes" button
2. Wait for success message
3. Your branding is now live! 🎉

### Result

After saving, you'll see:
- ✅ Your logo in the sidebar
- ✅ Your brand name replacing "NNH AI Studio"
- ✅ Your colors applied to buttons and UI elements
- ✅ Cover image on dashboard (if uploaded)

---

## 🎨 Design Tips

### Logo Guidelines
- **Format**: PNG with transparency recommended
- **Size**: 512x512px or larger
- **Background**: Transparent or solid color
- **Content**: Should be legible at small sizes
- **File size**: Keep under 500KB for best performance

### Cover Image Guidelines
- **Format**: JPG or PNG
- **Aspect Ratio**: 16:9 (1920x1080px recommended)
- **Content**: High-quality professional image
- **File size**: Optimize to 1-2MB for best performance
- **Safe zone**: Keep important content away from edges

### Color Guidelines
- **Contrast**: Ensure text remains readable
- **Accessibility**: Check WCAG contrast ratios
- **Consistency**: Use colors from your brand guidelines
- **Testing**: Test on both light and dark backgrounds

---

## 🛠️ For Developers

### Quick Integration

#### 1. Access Brand Profile in Any Component
```tsx
import { useBrandProfile } from '@/contexts/BrandProfileContext';

function MyComponent() {
  const { profile, loading } = useBrandProfile();
  
  return (
    <div>
      {profile?.brand_name && <h1>{profile.brand_name}</h1>}
    </div>
  );
}
```

#### 2. Use Brand Colors
```tsx
// With inline styles
<button style={{ backgroundColor: 'var(--brand-primary)' }}>
  Click Me
</button>

// With Tailwind
<button className="bg-[var(--brand-primary)]">
  Click Me
</button>
```

#### 3. Listen for Branding Updates
```tsx
useEffect(() => {
  const handleBrandUpdate = () => {
    // Refresh or update UI
  };
  
  window.addEventListener('brand-profile-updated', handleBrandUpdate);
  return () => window.removeEventListener('brand-profile-updated', handleBrandUpdate);
}, []);
```

---

## 📋 Checklist

### Before Going Live
- [ ] Database migrations applied
- [ ] Storage bucket created in Supabase
- [ ] RLS policies verified
- [ ] Logo uploaded and tested
- [ ] Cover image uploaded and tested
- [ ] Colors selected and applied
- [ ] Brand name set
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Tested in different browsers

### Testing Scenarios
- [ ] Upload image larger than limit (should fail gracefully)
- [ ] Upload non-image file (should show error)
- [ ] Change colors and verify UI updates
- [ ] Save and refresh page (persistence test)
- [ ] Test with no branding (should show defaults)
- [ ] Delete logo and re-upload
- [ ] Change brand name multiple times

---

## 🐛 Troubleshooting

### Logo Not Showing
**Problem**: Logo uploaded but not visible in sidebar

**Solutions**:
1. Check browser console for errors
2. Verify file uploaded to Supabase Storage
3. Check RLS policies allow public read
4. Try hard refresh (Ctrl+Shift+R)
5. Clear browser cache

### Colors Not Applying
**Problem**: Selected colors not visible in UI

**Solutions**:
1. Verify you clicked "Save Changes"
2. Check CSS variables in DevTools
3. Ensure DynamicThemeProvider is wrapping app
4. Try refreshing the page

### Upload Failing
**Problem**: File upload returns error

**Solutions**:
1. Check file size (2MB for logo, 5MB for cover)
2. Verify file is an image type
3. Check Supabase storage bucket exists
4. Verify RLS policies allow user uploads
5. Check browser network tab for errors

### Changes Not Persisting
**Problem**: Settings reset after page refresh

**Solutions**:
1. Verify you're logged in
2. Check database connection
3. Verify client_profiles table exists
4. Check RLS policies allow user to update
5. Look for errors in browser console

---

## 📞 Support

### Need Help?
- **Documentation**: See `docs/WHITE_LABEL_BRANDING.md`
- **Implementation Details**: See `BRANDING_IMPLEMENTATION_SUMMARY.md`
- **GitHub Issues**: [Create an issue](https://github.com/TheDXBNightsTeam/NNH-AI-Studio/issues)
- **Email**: info@nnh.ae

### Common Questions

**Q: Can I change my branding later?**
A: Yes! You can update your branding at any time through Settings > Branding.

**Q: What happens if I don't set branding?**
A: The platform will use default NNH AI Studio branding.

**Q: Can I use animated GIFs for my logo?**
A: No, static images only (PNG, JPG, SVG).

**Q: Will my branding appear in emails?**
A: Not currently, but this is planned for a future release.

**Q: Can I have different branding for different users?**
A: Yes, each user can have their own branding.

**Q: Is there a preview before saving?**
A: The preview shows immediately after upload. Save to apply across the platform.

---

## 🎯 Next Steps

1. ✅ Complete this quick start guide
2. 📖 Read the full documentation
3. 🎨 Customize your branding
4. 🧪 Test thoroughly
5. 🚀 Deploy to production
6. 📊 Gather user feedback

---

**Version**: 1.0.0  
**Last Updated**: November 10, 2025  
**Status**: Production Ready ✅
