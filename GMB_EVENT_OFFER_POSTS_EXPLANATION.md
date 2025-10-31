# 📋 GMB Event/Offer Posts - Explanation

## ❓ السؤال: لماذا Event/Offer Posts لا يمكن نشرها؟

---

## 🔍 السبب الرئيسي

### **Google Business Profile API v4 Limitation**

الكود الحالي يستخدم **Google Business Profile API v4** endpoint:
```typescript
const url = `https://mybusiness.googleapis.com/v4/${locationResource}/localPosts`
```

هذا الـ API endpoint **يدعم فقط نوع واحد من الـ Posts**:
- ✅ **"What's New" Posts** (Standard Posts)
- ❌ **Event Posts** - غير مدعوم
- ❌ **Offer Posts** - غير مدعوم

---

## 📚 Google API Documentation

### **localPosts API (v4)**
- **Endpoint**: `POST /v4/{location}/localPosts`
- **Supported Post Types**: **Standard Posts Only**
- **Payload Structure**:
  ```json
  {
    "languageCode": "en",
    "summary": "Post content text",
    "media": [{ "sourceUrl": "..." }],
    "callToAction": {
      "actionType": "LEARN_MORE",
      "url": "..."
    }
  }
  ```

**لا يوجد** في الـ API:
- ❌ `topicType` field (Event/Offer/What's New)
- ❌ `eventTime` field (for Event posts)
- ❌ `offerCode` field (for Offer posts)
- ❌ `redeemUrl` field (for Offer posts)

---

## 🔄 Google Business Profile API v1 (Newer)

Google أطلقت **Business Profile Performance API v1** (جديد)، لكن:

1. **الـ API الجديد** يستخدم endpoints مختلفة:
   - `mybusinessbusinessinformation.googleapis.com/v1`
   - `mybusinessnotifications.googleapis.com/v1`

2. **لكن حتى الـ API الجديد لا يدعم Event/Offer Posts بشكل مباشر**:
   - يدعم فقط **Local Posts** (Standard Posts)
   - Event و Offer posts تحتاج **Business Profile Posts API** (منفصل)

3. **Business Profile Posts API**:
   - يتطلب **API key خاص**
   - يتطلب **permissions إضافية**
   - **محدود التوفر** (قد لا يكون متاح لجميع الحسابات)

---

## 🛠️ الحلول الممكنة

### **Option 1: إزالة Event/Offer Types** (الأسهل)
- ✅ إزالة خيارات Event و Offer من UI
- ✅ السماح فقط بـ "What's New" posts
- ✅ بسيط وسريع

### **Option 2: حفظ Event/Offer كـ Drafts فقط**
- ✅ حفظ جميع البيانات في Database
- ⚠️ إظهار تحذير: "Event/Offer posts cannot be published to Google"
- ⚠️ السماح بالحفظ فقط، بدون نشر

### **Option 3: استخدام Google Business Profile Posts API** (معقد)
- ⚠️ يتطلب **API permissions إضافية**
- ⚠️ قد لا يكون متاح لجميع الحسابات
- ⚠️ يحتاج تطوير كامل للكود
- ⚠️ قد يحتاج **Google Partner verification**

---

## 💡 التوصية

### **الحل الأفضل: Option 1 + Option 2 Hybrid**

1. **إزالة Event/Offer من UI** (للنشر المباشر)
2. **الاحتفاظ بالقدرة على حفظ Event/Offer** كـ drafts
3. **إظهار تحذير واضح** للمستخدم:
   ```
   ⚠️ Note: Event and Offer posts can only be saved as drafts. 
   Google Business Profile API currently only supports "What's New" posts.
   ```

---

## 📝 الكود الحالي

### **في `app/api/gmb/posts/publish/route.ts`:**
```typescript
const payload: any = {
  languageCode: 'en',
  summary: post.content?.slice(0, 1500) || '',
}
if (post.media_url) {
  payload.media = [{ sourceUrl: post.media_url }]
}
if (post.call_to_action && post.call_to_action_url) {
  payload.callToAction = { actionType: 'LEARN_MORE', url: post.call_to_action_url }
}
```

**المشكلة**: لا يوجد `topicType` أو `eventTime` أو `offerCode` في الـ payload لأن الـ API لا يدعمها.

---

## ✅ الخطوات المقترحة

1. **إضافة Validation** في `handlePublish`:
   ```typescript
   if (postType === 'event' || postType === 'offer') {
     toast.error('Event and Offer posts cannot be published to Google. They can only be saved as drafts.')
     return
   }
   ```

2. **تحديث UI** لإظهار تحذير:
   - إضافة Alert في Create Post Tab
   - إضافة Tooltip على Event/Offer buttons

3. **حفظ Event/Offer Data** في Database:
   - تحديث `app/api/gmb/posts/create/route.ts` لقبول Event/Offer fields
   - حفظها في `metadata` JSON column

---

## 🔗 References

- [Google Business Profile API v4 - localPosts](https://developers.google.com/my-business/content/local-posts)
- [Google Business Profile Performance API v1](https://developers.google.com/my-business/content/basic-setup)
- [Google Business Profile Posts API](https://developers.google.com/my-business/content/posts) (Limited availability)

---

## 📊 Summary

| Post Type | Supported by API? | Can Publish? | Can Save as Draft? |
|-----------|-------------------|--------------|-------------------|
| What's New | ✅ Yes | ✅ Yes | ✅ Yes |
| Event | ❌ No | ❌ No | ✅ Yes (if we save data) |
| Offer | ❌ No | ❌ No | ✅ Yes (if we save data) |

---

**Last Updated**: 2025-01-02
**Status**: ⚠️ API Limitation - Not a Bug

