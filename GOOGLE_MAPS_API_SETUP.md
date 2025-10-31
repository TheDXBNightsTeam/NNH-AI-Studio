# Google Maps API Key Setup

## اسم المتغير في الكود
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

## خطوات الحصول على Google Maps API Key

### 1. الذهاب إلى Google Cloud Console
- افتح: https://console.cloud.google.com/
- سجل دخول بحساب Google الخاص بك

### 2. إنشاء مشروع جديد (أو استخدام مشروع موجود)
- انقر على "Select a project" في الأعلى
- اختر "New Project"
- أدخل اسم المشروع (مثلاً: "NNH AI Studio Maps")
- انقر "Create"

### 3. تفعيل Google Maps Embed API
- من القائمة الجانبية: **APIs & Services** → **Library**
- ابحث عن: **"Maps Embed API"**
- انقر على **"Maps Embed API"**
- انقر **"Enable"**

### 4. إنشاء API Key
- من القائمة: **APIs & Services** → **Credentials**
- انقر **"Create Credentials"** → **"API Key"**
- ستظهر نافذة مع API Key الخاص بك
- **انسخ المفتاح** واحفظه في مكان آمن

### 5. تقييد API Key (موصى به للإنتاج)
- بعد إنشاء المفتاح، انقر على المفتاح للتحرير
- في **"API restrictions"**:
  - اختر **"Restrict key"**
  - حدد فقط: **"Maps Embed API"**
- في **"Application restrictions"** (اختياري):
  - يمكنك تقييد المفتاح لاستخدامه فقط من نطاق معين
  - مثلاً: **"HTTP referrers"** → أضف: `https://nnh.ae/*`

### 6. إضافة المتغير إلى ملف .env.local
أنشئ أو عدّل ملف `.env.local` في جذر المشروع:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**ملاحظة مهمة:**
- استبدل `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` بمفتاحك الفعلي
- لا تشارك هذا الملف في Git (يجب أن يكون في `.gitignore`)

### 7. إعادة تشغيل الخادم
بعد إضافة المتغير:
```bash
# أوقف الخادم (Ctrl+C) وأعد تشغيله
npm run dev
```

## التحقق من عمل الخريطة
1. افتح GMB Dashboard
2. اذهب إلى Locations
3. يجب أن ترى خريطة Google Maps في Location Cards

## ملاحظات الأمان
- **لا تشارك API Key في Git**
- استخدم تقييدات API Key في الإنتاج
- راقب الاستخدام من Google Cloud Console
- يمكنك وضع حد للاستخدام اليومي من **APIs & Services** → **Quotas**

## استكشاف الأخطاء
إذا لم تظهر الخريطة:
1. تأكد أن المتغير موجود في `.env.local`
2. أعد تشغيل الخادم بعد إضافة المتغير
3. تحقق من Console في المتصفح للأخطاء
4. تأكد أن Maps Embed API مفعّل في Google Cloud Console

