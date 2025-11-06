# 🔧 إصلاح مشكلة تحميل Google Maps API المتعدد

## المشكلة

```
You have included the Google Maps JavaScript API multiple times on this page. 
This may cause unexpected errors.
```

## الحل

تم إنشاء hook مشترك `useGoogleMaps` يضمن تحميل Google Maps API مرة واحدة فقط.

### التغييرات

1. **إنشاء hook مشترك** (`hooks/use-google-maps.ts`):
   - يستخدم `globalApiKey` لتخزين API key مرة واحدة
   - يستخدم `scriptLoadPromise` لمنع تحميل متعدد
   - جميع المكونات تستخدم نفس الـ hook

2. **تحديث المكونات**:
   - `components/locations/locations-map-tab.tsx` - يستخدم `useGoogleMaps`
   - `components/locations/LocationMapDashboard.tsx` - يستخدم `useGoogleMaps`

### الملفات المعدلة

- ✅ `hooks/use-google-maps.ts` (جديد)
- ✅ `components/locations/locations-map-tab.tsx`
- ✅ `components/locations/LocationMapDashboard.tsx`

### النتيجة المتوقعة

- ✅ Google Maps API يتم تحميله مرة واحدة فقط
- ✅ لا توجد أخطاء "multiple times" في Console
- ✅ تحسين الأداء (تحميل واحد بدلاً من متعدد)

---

## ملاحظات

- `@react-google-maps/api` يحاول منع التحميل المزدوج تلقائياً، لكن استخدام hook مشترك يضمن ذلك 100%
- إذا ظهرت المشكلة مرة أخرى، تحقق من وجود أي `<script>` tags يدوية لـ Google Maps في HTML

