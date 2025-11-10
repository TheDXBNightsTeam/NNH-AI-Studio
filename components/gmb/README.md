# GMB Connection Manager

## نظرة عامة

مكون مركزي موحد لإدارة اتصال Google My Business في جميع أنحاء التطبيق. يحل هذا المكون مشكلة تكرار الأزرار والكود في أماكن متعددة.

## المشكلة التي تم حلها

قبل هذا المكون، كانت أزرار GMB (Connect, Disconnect, Sync Now, Re-authenticate) موزعة ومكررة في:
- ✅ `components/settings/gmb-settings.tsx`
- ✅ `components/dashboard/last-sync-info.tsx`
- ✅ `components/accounts/AccountCard.tsx`
- ✅ `app/[locale]/(dashboard)/dashboard/optimized-page.tsx`
- ✅ `app/[locale]/(dashboard)/dashboard/DashboardClient.tsx`

هذا التكرار سبب:
- 🔴 صعوبة في الصيانة والتطوير
- 🔴 احتمالية عالية للأخطاء والتضارب
- 🔴 تجربة مستخدم غير متسقة
- 🔴 كود متكرر في عدة أماكن

## الحل

مكون واحد مركزي `GMBConnectionManager` يوفر:
- ✅ **مكان واحد** لجميع وظائف GMB
- ✅ **تصميم موحد** ومتسق في كل التطبيق
- ✅ **سهولة الصيانة** - تعديل واحد يطبق على كل شيء
- ✅ **تقليل الكود** - حذف أكثر من 300 سطر كود مكرر
- ✅ **دعم عربي كامل** في جميع النصوص

## الاستخدام

### 1. في الـ Dashboard (Compact View)

```tsx
import { GMBConnectionManager } from '@/components/gmb/gmb-connection-manager';

<GMBConnectionManager
  variant="compact"
  showLastSync={true}
  onSuccess={handleRefresh}
/>
```

### 2. في الـ Settings (Full View)

```tsx
import { GMBConnectionManager } from '@/components/gmb/gmb-connection-manager';

<GMBConnectionManager
  variant="full"
  showLastSync={true}
  onSuccess={handleRefresh}
/>
```

### 3. أي مكان آخر

```tsx
<GMBConnectionManager
  variant="compact"  // أو "full"
  showLastSync={false}
  className="custom-class"
  onSuccess={() => {
    // ماذا تفعل بعد نجاح العملية
    console.log('GMB operation successful');
  }}
/>
```

## الخصائص (Props)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'compact' \| 'full'` | `'compact'` | نمط العرض - compact للداشبورد، full للإعدادات |
| `showLastSync` | `boolean` | `true` | إظهار معلومات آخر مزامنة |
| `className` | `string` | `undefined` | CSS classes إضافية |
| `onSuccess` | `() => void` | `undefined` | Callback يُستدعى بعد نجاح أي عملية |

## الميزات

### 1. إدارة كاملة للحساب

- ✅ ربط حساب GMB جديد
- ✅ مزامنة البيانات
- ✅ إعادة المصادقة
- ✅ قطع الاتصال مع خيارات متقدمة

### 2. خيارات قطع الاتصال

عند قطع الاتصال، المستخدم يمكنه اختيار:

1. **الاحتفاظ بالبيانات** (موصى به)
   - إخفاء المعلومات الشخصية
   - الاحتفاظ بالإحصائيات التاريخية

2. **تصدير ثم الاحتفاظ**
   - تنزيل جميع البيانات كـ JSON
   - ثم إخفاء الهوية والأرشفة

3. **حذف فوري**
   - حذف دائم لجميع البيانات
   - لا يمكن التراجع عن هذا

### 3. حالة الاتصال الفورية

- 🟢 متصل - يعرض اسم الحساب ووقت آخر مزامنة
- 🟠 غير متصل - زر واضح للربط
- 🔄 جاري التحميل - مؤشر تحميل واضح

### 4. تصميم متجاوب

- ✅ يعمل بشكل مثالي على الموبايل
- ✅ يتكيف مع الشاشات الصغيرة والكبيرة
- ✅ أزرار واضحة وسهلة الاستخدام

## البنية الداخلية

```
GMBConnectionManager
├── Connection Status Display
│   ├── Icon (Connected/Not Connected)
│   ├── Account Name
│   └── Last Sync Time (optional)
├── Action Buttons
│   ├── Connect Button (when not connected)
│   ├── Sync Button (when connected)
│   ├── Re-authenticate Button (when connected)
│   └── Disconnect Button (when connected)
└── Disconnect Dialog
    ├── Keep Data Option (recommended)
    ├── Export Data Option
    └── Delete All Option
```

## التكامل مع الأنظمة الموجودة

المكون يتكامل تلقائياً مع:
- ✅ Supabase Auth
- ✅ GMB API endpoints (`/api/gmb/*`)
- ✅ Server Actions (`disconnectGMBAccount`)
- ✅ Toast notifications (Sonner)
- ✅ Next.js Router

## الأمان

- ✅ التحقق من المستخدم قبل أي عملية
- ✅ إخفاء هوية البيانات عند قطع الاتصال
- ✅ تأكيد قبل العمليات الحساسة
- ✅ معالجة الأخطاء بشكل آمن

## الأداء

- ⚡ تحميل سريع للحالة
- ⚡ Cache-friendly
- ⚡ تحديثات في الوقت الفعلي
- ⚡ لا يعيد التحميل إلا عند الحاجة

## التطوير المستقبلي

يمكن بسهولة إضافة:
- [ ] دعم حسابات متعددة
- [ ] جدولة المزامنة التلقائية
- [ ] إشعارات عند اكتمال المزامنة
- [ ] تاريخ المزامنات السابقة
- [ ] إحصائيات استخدام API

## المثال الكامل

```tsx
'use client';

import { GMBConnectionManager } from '@/components/gmb/gmb-connection-manager';
import { useRouter } from 'next/navigation';

export function MyPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // تحديث البيانات
    router.refresh();
    
    // إعادة تحميل الإحصائيات
    // invalidateCache();
  };

  return (
    <div className="p-6">
      <h1>لوحة التحكم</h1>
      
      <GMBConnectionManager
        variant="compact"
        showLastSync={true}
        onSuccess={handleSuccess}
        className="mt-4"
      />
    </div>
  );
}
```

## الدعم الفني

إذا واجهت أي مشاكل:
1. تحقق من أن `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET` موجودة في `.env`
2. تأكد من أن جداول Supabase (`gmb_accounts`) موجودة
3. تحقق من console للأخطاء
4. راجع وثائق GMB API

## الترخيص

جزء من مشروع NNH AI Studio - جميع الحقوق محفوظة

