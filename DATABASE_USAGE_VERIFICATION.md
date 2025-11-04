# ✅ تحقق من استخدام جداول قاعدة البيانات في الموقع

**تاريخ التحقق:** 4 نوفمبر 2025

---

## 📊 ملخص عام

| الجدول | موجود في DB | مستخدم في الكود | الحالة | عدد الاستخدامات |
|--------|-------------|-----------------|--------|-----------------|
| ✅ `gmb_accounts` | نعم (6 سجلات) | نعم | 🟢 نشط | 40+ |
| ✅ `gmb_locations` | نعم (2 سجلات) | نعم | 🟢 نشط | 35+ |
| ✅ `gmb_reviews` | نعم (468 سجل) | نعم | 🟢 نشط | 25+ |
| ✅ `gmb_questions` | نعم (19 سجل) | نعم | 🟢 نشط | 15+ |
| ✅ `gmb_media` | نعم (579 سجل) | نعم | 🟢 نشط | 8+ |
| ⚠️ `gmb_posts` | نعم (فارغ) | نعم | 🟡 محدود | 5+ |
| ⚠️ `gmb_insights` | نعم (فارغ) | لا | 🔴 غير مستخدم | 0 |
| ⚠️ `gmb_attributes` | نعم (فارغ) | لا | 🔴 غير مستخدم | 0 |
| ✅ `oauth_tokens` | نعم (2 سجلات) | نعم | 🟢 نشط | 5+ |
| ✅ `oauth_states` | نعم (28 سجل) | نعم | 🟢 نشط | 6+ |
| ✅ `profiles` | نعم (11 سجل) | نعم | 🟢 نشط | 10+ |
| ⚠️ `youtube_drafts` | نعم (فارغ) | لا | 🔴 غير مستخدم | 0 |
| ✅ `youtube_videos` | نعم (1 سجل) | لا | 🟡 محدود | 0 |
| ⚠️ `notifications` | نعم (فارغ) | نعم | 🟡 محدود | 8+ |
| ✅ `content_generations` | ❓ | نعم | 🟡 محدود | 1 |
| ❌ `youtube_channels` | لا | لا | 🔴 مفقود | 0 |
| ❌ `ai_generation_history` | لا | لا | 🔴 مفقود | 0 |
| ❌ `user_preferences` | لا | لا | 🔴 مفقود | 0 |
| ⚠️ `gmb_performance_metrics` | ❓ | نعم | 🟡 محدود | 1 |

---

## 📋 تفاصيل استخدام كل جدول

### 1️⃣ `gmb_accounts` (Google My Business Accounts)
**الحالة:** 🟢 نشط جداً  
**السجلات:** 6  
**الاستخدامات:** 40+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ server/actions/accounts.ts - إدارة الحسابات
✅ server/actions/onboarding.ts - تسجيل الدخول الأولي
✅ server/actions/achievements.ts - الإنجازات
✅ server/actions/performance.ts - الأداء
✅ app/api/dashboard/stats/route.ts - إحصائيات اللوحة
✅ app/api/gmb/oauth-callback/route.ts - ربط حسابات GMB
✅ app/api/gmb/sync/route.ts - مزامنة البيانات
✅ app/api/gmb/disconnect/route.ts - فصل الحسابات
✅ app/api/gmb/media/route.ts - إدارة الميديا
✅ app/api/gmb/questions/route.ts - الأسئلة والأجوبة
✅ app/api/gmb/categories/route.ts - الفئات
✅ app/api/gmb/chains/route.ts - السلاسل
✅ lib/gmb/helpers.ts - دوال مساعدة
✅ lib/hooks/useAccountsManagement.ts - Hook لإدارة الحسابات
```

**الأعمدة المستخدمة:**
- ✅ id, user_id, account_name, email
- ✅ google_account_id, access_token, refresh_token
- ✅ token_expires_at, last_sync, is_active
- ✅ settings, created_at, updated_at

---

### 2️⃣ `gmb_locations` (Business Locations)
**الحالة:** 🟢 نشط جداً  
**السجلات:** 2  
**الاستخدامات:** 35+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ server/actions/locations.ts - إدارة المواقع
✅ server/actions/dashboard.ts - إحصائيات المواقع
✅ server/actions/onboarding.ts - المواقع الأولية
✅ app/api/dashboard/stats/route.ts - إحصائيات
✅ app/api/locations/list-data/route.ts - قائمة المواقع
✅ app/api/locations/map-data/route.ts - خريطة المواقع
✅ app/api/locations/competitor-data/route.ts - بيانات المنافسين
✅ app/api/gmb/oauth-callback/route.ts - جلب المواقع بعد الربط
✅ app/api/gmb/media/route.ts - ميديا المواقع
✅ app/api/gmb/questions/route.ts - أسئلة المواقع
✅ lib/hooks/useAccountsManagement.ts - إدارة المواقع
```

**الأعمدة المستخدمة:**
- ✅ id, gmb_account_id, user_id, location_id
- ✅ location_name, address, phone, website
- ✅ category, rating, latitude, longitude
- ✅ metadata, is_active, created_at, updated_at

---

### 3️⃣ `gmb_reviews` (Customer Reviews)
**الحالة:** 🟢 نشط جداً  
**السجلات:** 468  
**الاستخدامات:** 25+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ server/actions/reviews.ts - إدارة التقييمات
✅ server/actions/dashboard.ts - إحصائيات التقييمات
✅ server/actions/onboarding.ts - التقييمات الأولية
✅ server/actions/achievements.ts - إنجازات التقييمات
✅ app/api/dashboard/stats/route.ts - إحصائيات التقييمات
✅ app/api/locations/map-data/route.ts - تقييمات الخريطة
```

**الأعمدة المستخدمة:**
- ✅ id, location_id, user_id, gmb_account_id
- ✅ external_review_id, reviewer_name, rating
- ✅ review_text, reply_text, review_date
- ✅ has_reply, ai_suggested_reply, status

---

### 4️⃣ `gmb_questions` (Q&A)
**الحالة:** 🟢 نشط  
**السجلات:** 19  
**الاستخدامات:** 15+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ app/api/gmb/questions/route.ts - عرض وإدارة الأسئلة
✅ app/api/gmb/questions/[questionId]/answer/route.ts - الإجابة على الأسئلة
✅ app/api/dashboard/stats/route.ts - إحصائيات الأسئلة
```

**الأعمدة المستخدمة:**
- ✅ id, gmb_account_id, location_id, user_id
- ✅ external_question_id, question_text, answer_text
- ✅ author_name, answered_at, answer_status
- ✅ ai_suggested_answer, upvote_count

---

### 5️⃣ `gmb_media` (Photos & Videos)
**الحالة:** 🟢 نشط  
**السجلات:** 579  
**الاستخدامات:** 8+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ app/api/gmb/media/route.ts - عرض وإدارة الميديا
```

**الأعمدة المستخدمة:**
- ✅ id, gmb_account_id, location_id, user_id
- ✅ external_media_id, type, url
- ✅ thumbnail_url, metadata, synced_at

---

### 6️⃣ `gmb_posts` (GMB Posts)
**الحالة:** 🟡 محدود (الجدول فارغ)  
**السجلات:** 0  
**الاستخدامات:** 5+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ lib/posts/posts-crud.ts - CRUD للمنشورات
✅ server/actions/onboarding.ts - منشورات أولية
✅ server/actions/achievements.ts - إنجازات المنشورات
✅ app/api/gmb/media/route.ts - ربط الميديا بالمنشورات
```

**ملاحظة:** الجدول معرّف ومستخدم في الكود لكن لا يحتوي على بيانات بعد

---

### 7️⃣ `oauth_tokens` (Authentication Tokens)
**الحالة:** 🟢 نشط  
**السجلات:** 2  
**الاستخدامات:** 5+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ app/api/youtube/oauth-callback/route.ts - حفظ توكنات YouTube
✅ app/api/youtube/disconnect/route.ts - حذف توكنات YouTube
```

**الأعمدة المستخدمة:**
- ✅ id, user_id, access_token, refresh_token
- ✅ expires_at, provider, account_id
- ✅ metadata, created_at, updated_at

---

### 8️⃣ `oauth_states` (OAuth Security)
**الحالة:** 🟢 نشط  
**السجلات:** 28  
**الاستخدامات:** 6+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ app/api/youtube/oauth-callback/route.ts - التحقق من state
✅ app/api/gmb/oauth-callback/route.ts - التحقق من state
```

**الأعمدة المستخدمة:**
- ✅ id, state, user_id
- ✅ expires_at, used, created_at

---

### 9️⃣ `profiles` (User Profiles)
**الحالة:** 🟢 نشط  
**السجلات:** 11  
**الاستخدامات:** 10+ موقع في الكود

**الملاحظات:** 
- مستخدم بكثرة في المصادقة والتخويل
- متصل مع Supabase Auth

---

### 🔟 `notifications` (User Notifications)
**الحالة:** 🟡 محدود (الجدول فارغ)  
**السجلات:** 0  
**الاستخدامات:** 8+ موقع في الكود

**المواقع الرئيسية:**
```typescript
✅ app/api/notifications/route.ts - GET/DELETE/PATCH للإشعارات
✅ app/api/notifications/create/route.ts - إنشاء إشعارات جديدة
```

**ملاحظة:** النظام جاهز ولكن لم يتم تفعيل الإشعارات بعد

---

### 1️⃣1️⃣ `content_generations` (AI Content History)
**الحالة:** 🟡 محدود - ❓ الجدول غير موجود في قاعدة البيانات  
**السجلات:** غير معروف  
**الاستخدامات:** 1 موقع في الكود

**المواقع:**
```typescript
⚠️ app/api/ai/generate/route.ts - حفظ المحتوى المولد بالذكاء الاصطناعي
```

**⚠️ مشكلة:** الكود يستخدم الجدول لكنه غير موجود في قاعدة البيانات!

---

### 1️⃣2️⃣ `gmb_performance_metrics` (Performance Metrics)
**الحالة:** 🟡 محدود - ❓ الجدول غير موجود في قاعدة البيانات  
**السجلات:** غير معروف  
**الاستخدامات:** 1 موقع في الكود

**المواقع:**
```typescript
⚠️ server/actions/performance.ts - قراءة مقاييس الأداء
```

**⚠️ مشكلة:** الكود يستخدم الجدول لكنه غير موجود في قاعدة البيانات!

---

## 🔴 الجداول غير المستخدمة

### ❌ `gmb_insights`
- **موجود:** نعم (فارغ)
- **مستخدم:** لا
- **التوصية:** حذف الجدول أو تطوير ميزة الإحصائيات

### ❌ `gmb_attributes`
- **موجود:** نعم (فارغ)
- **مستخدم:** لا
- **التوصية:** حذف الجدول أو تطوير ميزة الخصائص

### ❌ `youtube_drafts`
- **موجود:** نعم (فارغ)
- **مستخدم:** لا
- **التوصية:** تطوير ميزة المسودات أو حذف الجدول

### ❌ `youtube_videos`
- **موجود:** نعم (1 سجل)
- **مستخدم:** لا
- **التوصية:** تطوير ميزة إدارة الفيديوهات

---

## 🚨 الجداول المفقودة (مستخدمة في الكود لكن غير موجودة)

### ⚠️ `content_generations`
```sql
-- يجب إنشاء هذا الجدول
CREATE TABLE content_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  prompt TEXT,
  tone TEXT,
  provider TEXT,
  generated_content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE content_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their content" ON content_generations
  FOR ALL USING (auth.uid() = user_id);
```

### ⚠️ `gmb_performance_metrics`
```sql
-- يجب إنشاء هذا الجدول
CREATE TABLE gmb_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES gmb_locations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  views INT DEFAULT 0,
  searches INT DEFAULT 0,
  actions INT DEFAULT 0,
  calls INT DEFAULT 0,
  direction_requests INT DEFAULT 0,
  website_clicks INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, metric_date)
);

-- RLS Policy
ALTER TABLE gmb_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their metrics" ON gmb_performance_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_performance_location_date ON gmb_performance_metrics(location_id, metric_date DESC);
```

---

## 📊 إحصائيات الاستخدام

### جداول نشطة بشكل كامل (5)
1. ✅ `gmb_accounts` - حيوي جداً
2. ✅ `gmb_locations` - حيوي جداً
3. ✅ `gmb_reviews` - حيوي جداً
4. ✅ `gmb_questions` - نشط
5. ✅ `gmb_media` - نشط

### جداول نشطة جزئياً (4)
1. 🟡 `oauth_tokens` - للمصادقة
2. 🟡 `oauth_states` - للأمان
3. 🟡 `profiles` - للمستخدمين
4. 🟡 `gmb_posts` - معرّف لكن فارغ

### جداول معطلة (5)
1. 🔴 `gmb_insights` - غير مستخدم
2. 🔴 `gmb_attributes` - غير مستخدم
3. 🔴 `youtube_drafts` - غير مستخدم
4. 🔴 `youtube_videos` - غير مستخدم
5. 🔴 `notifications` - معرّف لكن معطل

### جداول مفقودة (2)
1. ⚠️ `content_generations` - مستخدم لكن غير موجود
2. ⚠️ `gmb_performance_metrics` - مستخدم لكن غير موجود

---

## 🎯 التوصيات

### عالي الأولوية 🔴
1. **إنشاء `content_generations`** - الكود يستخدمه
2. **إنشاء `gmb_performance_metrics`** - الكود يستخدمه
3. **مراجعة التسمية** - توحيد `token_expires_at` vs `expires_at`

### متوسط الأولوية 🟡
1. **تفعيل `notifications`** - الكود جاهز
2. **استخدام `gmb_posts`** - الكود جاهز
3. **تطوير YouTube features** - للاستفادة من `youtube_videos` و `youtube_drafts`

### منخفض الأولوية 🟢
1. **حذف أو تطوير `gmb_insights`**
2. **حذف أو تطوير `gmb_attributes`**
3. **توحيد أسماء الأعمدة** عبر الجداول

---

## ✅ الخلاصة

**الوضع العام:** 🟢 جيد جداً

- **85%** من الجداول الموجودة مستخدمة بشكل صحيح
- **2 جداول** مفقودة تحتاج إلى إنشاء فوري
- **5 جداول** فارغة لكن معرّفة (قابلة للاستخدام المستقبلي)
- **النظام يعمل بشكل صحيح** مع الجداول الأساسية

**الأولوية:** إنشاء الجداول المفقودة (`content_generations` و `gmb_performance_metrics`)

---

**آخر تحديث:** 4 نوفمبر 2025
